import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import type { LLMNodeData } from "@/types/workflow";

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

  // eslint-disable-next-line no-console
  console.log("[llm] inputs received:", JSON.stringify({
    keys: Object.keys(inputs),
    hasUserMessage,
    hasSystemPrompt,
    hasImages,
  }));

  if (!hasUserMessage && !hasSystemPrompt && !hasImages) {
    throw new Error("LLM node requires at least one input: a message, system prompt, or image");
  }

  const MODEL_ALIASES: Record<string, string> = {
    "gemini-1.5-flash": "gemini-1.5-flash-latest",
    "gemini-1.5-pro": "gemini-1.5-pro-latest",
    "gemini-2.0-flash-exp": "gemini-2.0-flash",
  };

  const genAI = new GoogleGenerativeAI(apiKey);
  const rawModel = nodeData.model || "gemini-2.0-flash";
  const modelName = MODEL_ALIASES[rawModel] ?? rawModel;
  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(systemPrompt?.trim() ? { systemInstruction: systemPrompt } : {}),
  });

  const parts: Part[] = [];

  if (userMessage.trim()) {
    parts.push({ text: userMessage });
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

  if (parts.length === 0 && systemPrompt?.trim()) {
    parts.push({ text: systemPrompt });
  }

  const result = await model.generateContent({ contents: [{ role: "user", parts }] });
  const text = result.response.text();

  return { output: text };
}
