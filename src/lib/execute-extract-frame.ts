import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";
import type { ExtractFrameNodeData } from "@/types/workflow";

function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data: FfprobeData) => {
      if (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      const duration = data.format?.duration;
      if (typeof duration !== "number") {
        reject(new Error("Could not determine video duration"));
        return;
      }
      resolve(duration);
    });
  });
}

function extractFrame(
  inputPath: string,
  outputPath: string,
  seekSeconds: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(seekSeconds)
      .frames(1)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

function parseTimestamp(timestamp: string, durationSeconds: number): number {
  if (timestamp.endsWith("%")) {
    const percent = parseFloat(timestamp) / 100;
    return percent * durationSeconds;
  }
  return parseFloat(timestamp) || 0;
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

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `input-${Date.now()}.mp4`);
  const outputPath = path.join(tmpDir, `frame-${Date.now()}.jpg`);

  try {
    const buffer = await urlToBuffer(videoUrl);
    fs.writeFileSync(inputPath, buffer);

    const duration = await getVideoDuration(inputPath);
    const seekSeconds = parseTimestamp(timestamp, duration);

    await extractFrame(inputPath, outputPath, seekSeconds);

    const outputBuffer = fs.readFileSync(outputPath);
    const base64 = outputBuffer.toString("base64");

    return { output: `data:image/jpeg;base64,${base64}` };
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
}
