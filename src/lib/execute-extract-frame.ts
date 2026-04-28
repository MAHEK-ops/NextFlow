import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";
import type { ExtractFrameNodeData } from "@/types/workflow";

async function fetchVideoBuffer(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) {
    const commaIdx = url.indexOf(",");
    const data = commaIdx !== -1 ? url.slice(commaIdx + 1) : url;
    return Buffer.from(data, "base64");
  }
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}

function parseTimestamp(timestamp: string): number {
  if (timestamp.endsWith("%")) return 0;
  return parseFloat(timestamp) || 0;
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
    typeof inputs["timestamp"] === "string" ? inputs["timestamp"] : nodeData.timestamp;

  const videoBuffer = await fetchVideoBuffer(videoUrl);
  const tmpVideo = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);
  const tmpFrame = path.join(os.tmpdir(), `frame-${Date.now()}.jpg`);
  fs.writeFileSync(tmpVideo, videoBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tmpVideo)
        .seekInput(parseTimestamp(timestamp))
        .frames(1)
        .output(tmpFrame)
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .run();
    });

    const frameBuffer = fs.readFileSync(tmpFrame);
    return { output: `data:image/jpeg;base64,${frameBuffer.toString("base64")}` };
  } finally {
    if (fs.existsSync(tmpVideo)) fs.unlinkSync(tmpVideo);
    if (fs.existsSync(tmpFrame)) fs.unlinkSync(tmpFrame);
  }
}
