import { tasks } from "@trigger.dev/sdk/v3";
import type { llmTask } from "@/trigger/llm-task";
import type { LLMNodeData } from "@/types/workflow";

export async function executeLlmNode(
  nodeData: LLMNodeData,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const systemPrompt =
    typeof inputs["system_prompt"] === "string"
      ? inputs["system_prompt"]
      : nodeData.systemPrompt;

  const userMessage = inputs["user_message"];
  if (typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("LLM node requires a non-empty user message");
  }

  const imageInput = inputs["images"];
  const imageUrls: string[] = Array.isArray(imageInput)
    ? imageInput.filter((u): u is string => typeof u === "string")
    : typeof imageInput === "string"
    ? [imageInput]
    : [];

  const result = await tasks.triggerAndWait<typeof llmTask>("llm-task", {
    model: nodeData.model,
    systemPrompt,
    userMessage,
    imageUrls,
  });

  if (!result.ok) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : typeof result.error === "string"
        ? result.error
        : "LLM task failed";
    throw new Error(errorMessage);
  }

  return { output: result.output.result };
}
