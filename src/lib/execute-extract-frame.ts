import { tasks } from "@trigger.dev/sdk/v3";
import type { extractFrameTask } from "@/trigger/extract-frame-task";
import type { ExtractFrameNodeData } from "@/types/workflow";

export async function executeExtractFrameNode(
  nodeData: ExtractFrameNodeData,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const videoUrl = inputs["video_url"];
  if (typeof videoUrl !== "string" || !videoUrl) {
    throw new Error("Extract frame node requires a video URL");
  }

  const timestamp =
    typeof inputs["timestamp"] === "string"
      ? inputs["timestamp"]
      : nodeData.timestamp;

  const result = await tasks.triggerAndWait<typeof extractFrameTask>("extract-frame-task", {
    videoUrl,
    timestamp,
  });

  if (!result.ok) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : typeof result.error === "string"
        ? result.error
        : "Extract frame task failed";
    throw new Error(errorMessage);
  }

  return { output: result.output.outputUrl };
}
