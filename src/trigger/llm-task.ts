import { task } from "@trigger.dev/sdk/v3";

interface LLMInput {
  model: string;
  systemPrompt?: string;
  userMessage?: string;
  imageUrls?: string[];
}

const MODEL_ALIASES: Record<string, string> = {
  "gemini-1.5-flash-latest": "gemini-1.5-flash",
  "gemini-1.5-pro-latest": "gemini-1.5-pro",
  "gemini-2.0-flash-exp": "gemini-2.0-flash",
};

function sanitizeModel(model?: string): string {
  const raw = model ?? "gemini-2.0-flash";
  return MODEL_ALIASES[raw] ?? raw;
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

export const llmTask = task({
  id: "llm-node",
  retry: { maxAttempts: 1 },
  run: async (payload: LLMInput) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const modelName = sanitizeModel(payload.model);
    const parts: Part[] = [];

    const combinedText = [payload.systemPrompt?.trim(), payload.userMessage?.trim()]
      .filter(Boolean)
      .join("\n\n");

    if (combinedText) {
      parts.push({ text: combinedText });
    }

    for (const url of payload.imageUrls ?? []) {
      if (url.startsWith("data:")) {
        const commaIdx = url.indexOf(",");
        const header = commaIdx !== -1 ? url.slice(0, commaIdx) : "";
        const data = commaIdx !== -1 ? url.slice(commaIdx + 1) : url;
        const mimeMatch = /^data:([^;,]+)/.exec(header);
        const mimeType = mimeMatch?.[1] ?? "image/jpeg";
        parts.push({ inlineData: { mimeType, data } });
      } else {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = res.headers.get("content-type") ?? "image/jpeg";
        parts.push({ inlineData: { data: base64, mimeType } });
      }
    }

    if (parts.length === 0) {
      throw new Error("LLM node requires at least one input");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }] }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const responseData = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { output: text };
  },
});
