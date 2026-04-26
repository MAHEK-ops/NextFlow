import { tasks } from "@trigger.dev/sdk/v3";
import type { cropImageTask } from "@/trigger/crop-image-task";
import type { CropImageNodeData } from "@/types/workflow";

function parseInputNumber(value: unknown, fallback: number): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

export async function executeCropNode(
  nodeData: CropImageNodeData,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const imageUrl = inputs["image_url"];
  if (typeof imageUrl !== "string" || !imageUrl) {
    throw new Error("Crop image node requires an image URL");
  }

  const xPercent = parseInputNumber(inputs["x_percent"], nodeData.xPercent);
  const yPercent = parseInputNumber(inputs["y_percent"], nodeData.yPercent);
  const widthPercent = parseInputNumber(inputs["width_percent"], nodeData.widthPercent);
  const heightPercent = parseInputNumber(inputs["height_percent"], nodeData.heightPercent);

  const result = await tasks.triggerAndWait<typeof cropImageTask>("crop-image-task", {
    imageUrl,
    xPercent,
    yPercent,
    widthPercent,
    heightPercent,
  });

  if (!result.ok) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : typeof result.error === "string"
        ? result.error
        : "Crop image task failed";
    throw new Error(errorMessage);
  }

  return { output: result.output.outputUrl };
}
