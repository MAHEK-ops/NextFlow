import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

export const SAMPLE_WORKFLOW_NAME = "Product Marketing Kit";

export const SAMPLE_NODES: WorkflowNode[] = [
  {
    id: "sample-1",
    type: "text",
    position: { x: 80, y: 200 },
    data: {
      type: "text",
      label: "System Prompt",
      text: "You are a world-class product marketer. Write compelling, concise copy.",
    },
  },
  {
    id: "sample-2",
    type: "text",
    position: { x: 80, y: 380 },
    data: {
      type: "text",
      label: "User Message",
      text: "Write a product description for a new AI-powered workflow builder called NextFlow. Include key features, benefits, and a call to action.",
    },
  },
  {
    id: "sample-3",
    type: "llm",
    position: { x: 420, y: 280 },
    data: {
      type: "llm",
      label: "Generate Copy",
      model: "gemini-1.5-flash",
      systemPrompt: "",
      result: null,
      streaming: false,
      error: null,
    },
  },
  {
    id: "sample-4",
    type: "upload-image",
    position: { x: 80, y: 560 },
    data: {
      type: "upload-image",
      label: "Product Image",
      imageUrl: null,
      fileName: null,
    },
  },
  {
    id: "sample-5",
    type: "crop-image",
    position: { x: 420, y: 520 },
    data: {
      type: "crop-image",
      label: "Crop Thumbnail",
      xPercent: 10,
      yPercent: 10,
      widthPercent: 80,
      heightPercent: 80,
      outputUrl: null,
      error: null,
    },
  },
];

export const SAMPLE_EDGES: WorkflowEdge[] = [
  {
    id: "sample-edge-1",
    source: "sample-1",
    sourceHandle: "output",
    target: "sample-3",
    targetHandle: "system_prompt",
    animated: true,
    style: { stroke: "#7c3aed", strokeWidth: 2 },
    type: "smoothstep",
  },
  {
    id: "sample-edge-2",
    source: "sample-2",
    sourceHandle: "output",
    target: "sample-3",
    targetHandle: "user_message",
    animated: true,
    style: { stroke: "#7c3aed", strokeWidth: 2 },
    type: "smoothstep",
  },
  {
    id: "sample-edge-3",
    source: "sample-4",
    sourceHandle: "output",
    target: "sample-5",
    targetHandle: "image_url",
    animated: true,
    style: { stroke: "#7c3aed", strokeWidth: 2 },
    type: "smoothstep",
  },
];
