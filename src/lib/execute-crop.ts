import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";
import type { CropImageNodeData } from "@/types/workflow";

function parseInputNumber(value: unknown, fallback: number): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data: FfprobeData) => {
      if (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      const stream = data.streams.find((s) => s.codec_type === "video");
      if (!stream || !stream.width || !stream.height) {
        reject(new Error("Could not determine image dimensions"));
        return;
      }
      resolve({ width: stream.width, height: stream.height });
    });
  });
}

function runFfmpegCrop(
  inputPath: string,
  outputPath: string,
  x: number,
  y: number,
  cropWidth: number,
  cropHeight: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilter(`crop=${cropWidth}:${cropHeight}:${x}:${y}`)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

async function urlToBuffer(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) {
    const commaIdx = url.indexOf(",");
    const data = commaIdx !== -1 ? url.slice(commaIdx + 1) : url;
    return Buffer.from(data, "base64");
  }
  const response = await fetch(url);
  return Buffer.from(await response.arrayBuffer());
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

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `input-${Date.now()}.jpg`);
  const outputPath = path.join(tmpDir, `output-${Date.now()}.jpg`);

  try {
    const buffer = await urlToBuffer(imageUrl);
    fs.writeFileSync(inputPath, buffer);

    const { width, height } = await getImageDimensions(inputPath);

    const x = Math.round((xPercent / 100) * width);
    const y = Math.round((yPercent / 100) * height);
    const cropWidth = Math.round((widthPercent / 100) * width);
    const cropHeight = Math.round((heightPercent / 100) * height);

    await runFfmpegCrop(inputPath, outputPath, x, y, cropWidth, cropHeight);

    const outputBuffer = fs.readFileSync(outputPath);
    const base64 = outputBuffer.toString("base64");

    return { output: `data:image/jpeg;base64,${base64}` };
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
}
