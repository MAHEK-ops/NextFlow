import type { LLMNodeData } from "@/types/workflow";

const MODEL_ALIASES: Record<string, string> = {
  "gemini-1.5-flash": "gemini-2.0-flash",
  "gemini-1.5-pro": "gemini-2.5-pro",
  "gemini-1.5-flash-latest": "gemini-2.5-flash",
  "gemini-1.5-pro-latest": "gemini-2.5-pro",
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

type GroqMessage = { role: "system" | "user"; content: string };

type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function callGemini(
  modelName: string,
  body: Record<string, unknown>,
  apiKey: string
): Promise<Response> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

async function callGroq(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<string> {
  const messages: GroqMessage[] = [];
  if (systemPrompt.trim()) {
    messages.push({ role: "system", content: systemPrompt.trim() });
  }
  messages.push({ role: "user", content: userMessage.trim() || systemPrompt.trim() });

  console.log("[llm] provider: groq", GROQ_MODEL);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: GROQ_MODEL, messages }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as GroqResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

export async function executeLlmNode(
  nodeData: LLMNodeData,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set");

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
  console.log("[llm] imageUrls received:", imageUrls.length, imageUrls.map(u => u.slice(0, 30)));

  const hasUserMessage = userMessage.trim().length > 0;
  const hasSystemPrompt = !!(systemPrompt && systemPrompt.trim().length > 0);
  const hasImages = imageUrls.length > 0;

  if (!hasUserMessage && !hasSystemPrompt && !hasImages) {
    throw new Error("LLM node requires at least one input: a message, system prompt, or image");
  }

  const primaryModel = sanitizeModel(nodeData.model || "gemini-2.0-flash");

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

  const geminiBody: Record<string, unknown> = {
    contents: [{ role: "user", parts }],
  };

  console.log("[llm] provider: gemini", primaryModel);

  const res = await callGemini(primaryModel, geminiBody, geminiApiKey);

  if (!res.ok) {
    const shouldFallback =
      res.status === 429 ||
      res.status === 404 ||
      res.status >= 500;

    const geminiError = await res.text();

    const groqApiKey = process.env.GROQ_API_KEY;
    if (shouldFallback && groqApiKey) {
      console.warn("[llm] Gemini failed, switching to Groq", res.status);
      try {
        const text = await callGroq(systemPrompt ?? "", userMessage, groqApiKey);
        return { output: text };
      } catch (groqErr) {
        const groqError = groqErr instanceof Error ? groqErr.message : String(groqErr);
        throw new Error(`Gemini failed: ${geminiError}\nGroq failed: ${groqError}`);
      }
    }

    throw new Error(`Gemini API error ${res.status}: ${geminiError}`);
  }

  const responseData = (await res.json()) as GeminiResponse;
  const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return { output: text };
}
