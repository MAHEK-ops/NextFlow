import type { Connection } from "reactflow";
import { NODE_OUTPUT_HANDLE_TYPE } from "@/types/workflow";
import type { WorkflowNode, NodeType, HandleType } from "@/types/workflow";

// Maps each target handle ID to the handle type it accepts
const TARGET_HANDLE_TYPES: Record<string, HandleType> = {
  system_prompt: "text",
  user_message: "text",
  images: "image",
  image_url: "image",
  x_percent: "text",
  y_percent: "text",
  width_percent: "text",
  height_percent: "text",
  video_url: "video",
  timestamp: "text",
};

export function isValidConnection(
  connection: Connection,
  nodes: WorkflowNode[]
): boolean {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  const nodeType = sourceNode.type as NodeType | undefined;
  if (!nodeType) return false;

  const sourceType = NODE_OUTPUT_HANDLE_TYPE[nodeType];
  if (!sourceType) return false;

  const targetHandleId = connection.targetHandle;
  if (!targetHandleId) return false;

  const targetType = TARGET_HANDLE_TYPES[targetHandleId];
  if (!targetType) return false;

  return sourceType === targetType;
}

export function getInvalidConnectionReason(
  connection: Connection,
  nodes: WorkflowNode[]
): string {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) return "Node not found";

  const nodeType = sourceNode.type as NodeType | undefined;
  if (!nodeType) return "Source node has no output";

  const sourceType = NODE_OUTPUT_HANDLE_TYPE[nodeType];
  if (!sourceType) return "Source node has no output";

  const targetHandleId = connection.targetHandle;
  if (!targetHandleId) return "Target handle not found";

  const targetType = TARGET_HANDLE_TYPES[targetHandleId];
  if (!targetType) return "Target handle type unknown";

  return `Cannot connect ${sourceType} output to ${targetType} input`;
}
