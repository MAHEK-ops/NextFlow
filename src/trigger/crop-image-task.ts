import ffmpegLib from "fluent-ffmpeg";

if (process.env.FFMPEG_PATH) {
  ffmpegLib.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpegLib.setFfprobePath(process.env.FFPROBE_PATH);
}
import { task } from "@trigger.dev/sdk/v3";

interface CropInput {
  imageUrl: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export const cropImageTask = task({
  id: "crop-image",
  retry: { maxAttempts: 1 },
  run: async (payload: CropInput) => {
    const sharp = (await import("sharp")).default;

    let imageBuffer: Buffer;
    if (payload.imageUrl.startsWith("data:")) {
      const commaIdx = payload.imageUrl.indexOf(",");
      const data = commaIdx !== -1 ? payload.imageUrl.slice(commaIdx + 1) : payload.imageUrl;
      imageBuffer = Buffer.from(data, "base64");
    } else {
      const res = await fetch(payload.imageUrl);
      imageBuffer = Buffer.from(await res.arrayBuffer());
    }

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width ?? 100;
    const height = metadata.height ?? 100;

    const left = Math.round((payload.xPercent / 100) * width);
    const top = Math.round((payload.yPercent / 100) * height);
    const cropWidth = Math.max(1, Math.round((payload.widthPercent / 100) * width));
    const cropHeight = Math.max(1, Math.round((payload.heightPercent / 100) * height));

    const cropped = await image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .jpeg()
      .toBuffer();

    return { output: `data:image/jpeg;base64,${cropped.toString("base64")}` };
  },
});
