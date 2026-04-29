import ffmpegLib from "fluent-ffmpeg";

if (process.env.FFMPEG_PATH) {
  ffmpegLib.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpegLib.setFfprobePath(process.env.FFPROBE_PATH);
}
import { task } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";

interface ExtractFrameInput {
  videoUrl: string;
  timestamp: string;
}

function parseTimestamp(timestamp: string): number {
  if (timestamp.endsWith("%")) {
    return 0;
  }
  return parseFloat(timestamp) || 0;
}

export const extractFrameTask = task({
  id: "extract-frame",
  retry: { maxAttempts: 1 },
  run: async (payload: ExtractFrameInput) => {
    let videoBuffer: Buffer;
    if (payload.videoUrl.startsWith("data:")) {
      const commaIdx = payload.videoUrl.indexOf(",");
      const data = commaIdx !== -1 ? payload.videoUrl.slice(commaIdx + 1) : payload.videoUrl;
      videoBuffer = Buffer.from(data, "base64");
    } else {
      const res = await fetch(payload.videoUrl);
      videoBuffer = Buffer.from(await res.arrayBuffer());
    }

    const tmpVideo = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);
    const tmpFrame = path.join(os.tmpdir(), `frame-${Date.now()}.jpg`);
    fs.writeFileSync(tmpVideo, videoBuffer);

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tmpVideo)
          .seekInput(parseTimestamp(payload.timestamp))
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
  },
});
