import { task } from "@trigger.dev/sdk/v3";
import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";

function getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data: FfprobeData) => {
      if (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      const stream = data.streams.find((s) => s.codec_type === "video");
      if (!stream) {
        reject(new Error("No video stream found in image"));
        return;
      }
      const { width, height } = stream;
      if (!width || !height) {
        reject(new Error("Could not determine image dimensions"));
        return;
      }
      resolve({ width, height });
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

export const cropImageTask = task({
  id: "crop-image-task",
  run: async (payload: {
    imageUrl: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  }) => {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}.jpg`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.jpg`);

    try {
      const response = await fetch(payload.imageUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(inputPath, Buffer.from(buffer));

      const { width, height } = await getImageDimensions(inputPath);

      const x = Math.round((payload.xPercent / 100) * width);
      const y = Math.round((payload.yPercent / 100) * height);
      const cropWidth = Math.round((payload.widthPercent / 100) * width);
      const cropHeight = Math.round((payload.heightPercent / 100) * height);

      await runFfmpegCrop(inputPath, outputPath, x, y, cropWidth, cropHeight);

      const outputBuffer = fs.readFileSync(outputPath);
      const base64 = outputBuffer.toString("base64");
      const outputUrl = `data:image/jpeg;base64,${base64}`;

      return { outputUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Crop image task failed";
      console.error("Crop image task failed:", message);
      throw new Error(message);
    } finally {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  },
});
