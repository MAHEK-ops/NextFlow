import type { Node, Edge } from "reactflow";

// Handle types

export type HandleType = "text" | "image" | "video";

// Node types

export type NodeType =
  | "text"
  | "llm"
  | "upload-image"
  | "upload-video"
  | "crop-image"
  | "extract-frame";

// Per-node data shapes

export interface TextNodeData {
  type: "text";
  label: string;
  text: string;
}

export interface LLMNodeData {
  type: "llm";
  label: string;
  model: string;
  systemPrompt: string;
  result: string | null;
  streaming: boolean;
  error: string | null;
}

export interface UploadImageNodeData {
  type: "upload-image";
  label: string;
  imageUrl: string | null;
  fileName: string | null;
}

export interface UploadVideoNodeData {
  type: "upload-video";
  label: string;
  videoUrl: string | null;
  fileName: string | null;
}

export interface CropImageNodeData {
  type: "crop-image";
  label: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  outputUrl: string | null;
  error: string | null;
}

export interface ExtractFrameNodeData {
  type: "extract-frame";
  label: string;
  timestamp: string;
  outputUrl: string | null;
  error: string | null;
}

export interface GroupNodeData {
  type: "group";
  label: string;
}

export type NodeData =
  | TextNodeData
  | LLMNodeData
  | UploadImageNodeData
  | UploadVideoNodeData
  | CropImageNodeData
  | ExtractFrameNodeData
  | GroupNodeData;

// Workflow graph types (React Flow wrappers)

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge;

// Run status and scope (mirrors Prisma enums)

export type RunStatus = "success" | "failed" | "partial" | "running";
export type RunScope = "full" | "partial" | "single";

// Execution records (DB row shapes returned from API)

export interface NodeExecutionRecord {
  id: string;
  runId: string;
  nodeId: string;
  nodeType: string;
  status: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  duration: number;
  error: string | null;
  createdAt: string;
}

export interface WorkflowRunRecord {
  id: string;
  workflowId: string;
  userId: string;
  status: RunStatus;
  scope: RunScope;
  duration: number;
  createdAt: string;
  executions: NodeExecutionRecord[];
}

// Execution engine types

export interface ExecutionInput {
  nodeId: string;
  inputs: Record<string, unknown>;
}

export interface ExecutionOutput {
  nodeId: string;
  outputs: Record<string, unknown>;
  error?: string;
}

export interface ExecutionLayer {
  nodes: WorkflowNode[];
}

export interface RunOptions {
  scope: RunScope;
  selectedNodeIds?: string[];
}

// API response shape

export interface ApiError {
  error: string;
  code: string;
}

// Workflow DB record shape (for save/load)

export interface WorkflowRecord {
  id: string;
  userId: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

// Node color map for the minimap

export const NODE_COLORS: Record<NodeType, string> = {
  text: "#3b82f6",
  llm: "#7c3aed",
  "upload-image": "#10b981",
  "upload-video": "#f59e0b",
  "crop-image": "#06b6d4",
  "extract-frame": "#f97316",
};

// Handle type map per node type (output side)

export const NODE_OUTPUT_HANDLE_TYPE: Partial<Record<NodeType, HandleType>> = {
  text: "text",
  llm: "text",
  "upload-image": "image",
  "upload-video": "video",
  "crop-image": "image",
  "extract-frame": "image",
};

// LLM model options

export const GEMINI_MODELS = [
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["id"];
