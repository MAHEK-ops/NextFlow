import ffmpeg from "fluent-ffmpeg";
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import type { ExtractFrameNodeData } from "@/types/workflow";

function getFfmpegPath(): string | null {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  for (const p of ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"]) {
    if (fs.existsSync(p)) return p;
  }
  try {
    return execSync("which ffmpeg").toString().trim();
  } catch {
    return null;
  }
}

function getFfprobePath(): string | null {
  if (process.env.FFPROBE_PATH) return process.env.FFPROBE_PATH;
  for (const p of ["/opt/homebrew/bin/ffprobe", "/usr/local/bin/ffprobe", "/usr/bin/ffprobe"]) {
    if (fs.existsSync(p)) return p;
  }
  try {
    return execSync("which ffprobe").toString().trim();
  } catch {
    return null;
  }
}

const ffmpegPath = getFfmpegPath();
const ffprobePath = getFfprobePath();
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);

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
