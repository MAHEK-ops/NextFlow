import sharp from "sharp";
import type { CropImageNodeData } from "@/types/workflow";

function parseInputNumber(value: unknown, fallback: number): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) {
    const commaIdx = url.indexOf(",");
    const data = commaIdx !== -1 ? url.slice(commaIdx + 1) : url;
    return Buffer.from(data, "base64");
  }
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
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

  const imageBuffer = await fetchImageBuffer(imageUrl);
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const imageWidth = metadata.width ?? 100;
  const imageHeight = metadata.height ?? 100;

  const left = Math.round((xPercent / 100) * imageWidth);
  const top = Math.round((yPercent / 100) * imageHeight);

  const cropWidth = Math.max(1, Math.min(
    Math.round((widthPercent / 100) * imageWidth),
    imageWidth - left
  ));
  const cropHeight = Math.max(1, Math.min(
    Math.round((heightPercent / 100) * imageHeight),
    imageHeight - top
  ));

  const safeLeft = Math.max(0, Math.min(left, imageWidth - 1));
  const safeTop = Math.max(0, Math.min(top, imageHeight - 1));

  const croppedBuffer = await image
    .extract({ left: safeLeft, top: safeTop, width: cropWidth, height: cropHeight })
    .jpeg()
    .toBuffer();

  const base64 = croppedBuffer.toString("base64");
  return { output: `data:image/jpeg;base64,${base64}` };
}
