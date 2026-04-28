import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import type { LLMNodeData } from "@/types/workflow";

export async function executeLlmNode(
  nodeData: LLMNodeData,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const systemPrompt =
    typeof inputs["system_prompt"] === "string"
      ? inputs["system_prompt"]
      : nodeData.systemPrompt;

  const userMessage =
    typeof inputs["user_message"] === "string" ? inputs["user_message"] : "";

  const imageInput = inputs["images"];
  const imageUrls: string[] = Array.isArray(imageInput)
    ? imageInput.filter((u): u is string => typeof u === "string")
    : typeof imageInput === "string"
    ? [imageInput]
    : [];

  const hasContent =
    userMessage.trim().length > 0 ||
    (systemPrompt && systemPrompt.trim().length > 0) ||
    imageUrls.length > 0;

  if (!hasContent) {
    throw new Error("LLM node requires at least one input: user message, system prompt, or an image");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = nodeData.model || "gemini-2.0-flash";
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
