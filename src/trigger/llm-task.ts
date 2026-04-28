import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

export const llmTask = task({
  id: "llm-task",
  run: async (payload: {
    model: string;
    systemPrompt: string;
    userMessage: string;
    imageUrls: string[];
  }) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

      const model = genAI.getGenerativeModel({
        model: payload.model,
        systemInstruction: payload.systemPrompt || undefined,
      });

      const parts: Part[] = [];
      if (payload.userMessage) parts.push({ text: payload.userMessage });

      for (const imageUrl of payload.imageUrls) {
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = imageResponse.headers.get("content-type") ?? "image/jpeg";
        parts.push({ inlineData: { data: base64, mimeType } });
      }

      if (parts.length === 0 && payload.systemPrompt) {
        parts.push({ text: payload.systemPrompt });
      }

      const result = await model.generateContent(parts);
      const text = result.response.text();

      return { result: text };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gemini API error";
      console.error("LLM task failed:", message);
      throw new Error(message);
    }
  },
});
