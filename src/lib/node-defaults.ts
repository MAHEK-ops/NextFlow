import type { NodeType, NodeData } from "@/types/workflow";

export const DEFAULT_NODE_DATA: Record<NodeType, NodeData> = {
  text: { type: "text", label: "Text", text: "" },
  llm: { type: "llm", label: "LLM", model: "gemini-1.5-flash", systemPrompt: "", result: null, streaming: false, error: null },
  "upload-image": { type: "upload-image", label: "Upload Image", imageUrl: null, fileName: null },
  "upload-video": { type: "upload-video", label: "Upload Video", videoUrl: null, fileName: null },
  "crop-image": { type: "crop-image", label: "Crop Image", xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100, outputUrl: null, error: null },
  "extract-frame": { type: "extract-frame", label: "Extract Frame", timestamp: "0", outputUrl: null, error: null },
};
