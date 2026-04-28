import type { LLMNodeData } from "@/types/workflow";

const MODEL_ALIASES: Record<string, string> = {
  "gemini-1.5-flash-latest": "gemini-1.5-flash",
  "gemini-1.5-pro-latest": "gemini-1.5-pro",
  "gemini-2.0-flash-exp": "gemini-2.0-flash",
};

function sanitizeModel(model: string): string {
  return MODEL_ALIASES[model] ?? model;
}

type TextPart = { text: string };
type InlineDataPart = { inlineData: { mimeType: string; data: string } };
type Part = TextPart | InlineDataPart;

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

async function callGemini(
  modelName: string,
  body: Record<string, unknown>,
  apiKey: string
): Promise<Response> {
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function executeLlmNode(
  nodeData: LLMNodeData,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const systemPromptInput = inputs["system_prompt"] ?? inputs["systemPrompt"];
  const systemPrompt =
    typeof systemPromptInput === "string" ? systemPromptInput : nodeData.systemPrompt;

  const userMessageInput = inputs["user_message"] ?? inputs["userMessage"];
  const userMessage = typeof userMessageInput === "string" ? userMessageInput : "";

  const imageInput = inputs["images"] ?? inputs["imageUrls"];
  const imageUrls: string[] = Array.isArray(imageInput)
    ? imageInput.filter((u): u is string => typeof u === "string")
    : typeof imageInput === "string"
    ? [imageInput]
    : [];

  const hasUserMessage = userMessage.trim().length > 0;
  const hasSystemPrompt = !!(systemPrompt && systemPrompt.trim().length > 0);
  const hasImages = imageUrls.length > 0;

  if (!hasUserMessage && !hasSystemPrompt && !hasImages) {
    throw new Error("LLM node requires at least one input: a message, system prompt, or image");
  }

  const primaryModel = sanitizeModel(nodeData.model || "gemini-2.0-flash");
  const fallbackModel = primaryModel === "gemini-1.5-flash" ? "gemini-1.5-pro" : "gemini-1.5-flash";

  const parts: Part[] = [];

  const combinedText = [systemPrompt?.trim(), userMessage.trim()]
    .filter(Boolean)
    .join("\n\n");

  if (combinedText) {
    parts.push({ text: combinedText });
  }

  for (const url of imageUrls) {
    if (url.startsWith("data:")) {
      const commaIdx = url.indexOf(",");
      const header = commaIdx !== -1 ? url.slice(0, commaIdx) : "";
      const data = commaIdx !== -1 ? url.slice(commaIdx + 1) : url;
      const mimeMatch = /^data:([^;,]+)/.exec(header);
      const mimeType = mimeMatch !== null && mimeMatch[1] ? mimeMatch[1] : "image/jpeg";
      parts.push({ inlineData: { mimeType, data } });
    } else {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") ?? "image/jpeg";
      parts.push({ inlineData: { data: base64, mimeType } });
    }
  }

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts }],
  };

  let res = await callGemini(primaryModel, body, apiKey);

  if (res.status === 429) {
    res = await callGemini(fallbackModel, body, apiKey);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const responseData = (await res.json()) as GeminiResponse;
  const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return { output: text };
}
