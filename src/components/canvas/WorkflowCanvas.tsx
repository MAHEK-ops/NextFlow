"use client";

import { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type OnConnectStartParams,
} from "reactflow";
import { NODE_COLORS, type NodeType, type NodeData, type WorkflowNode, type WorkflowEdge } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import { toast } from "sonner";
import { isValidConnection as checkConnection, getInvalidConnectionReason } from "@/lib/handle-validator";
import TextNode from "@/components/nodes/TextNode";
import UploadImageNode from "@/components/nodes/UploadImageNode";
import UploadVideoNode from "@/components/nodes/UploadVideoNode";
import LLMNode from "@/components/nodes/LLMNode";
import CropImageNode from "@/components/nodes/CropImageNode";
import ExtractFrameNode from "@/components/nodes/ExtractFrameNode";

// defined outside Flow so React Flow never sees a new object reference on re-render
const nodeTypes = {
  text: TextNode,
  "upload-image": UploadImageNode,
  "upload-video": UploadVideoNode,
  llm: LLMNode,
  "crop-image": CropImageNode,
  "extract-frame": ExtractFrameNode,
};

// default data for each node type when first dropped onto the canvas
const DEFAULT_NODE_DATA: Record<NodeType, NodeData> = {
  text: { type: "text", label: "Text", text: "" },
  llm: { type: "llm", label: "LLM", model: "gemini-1.5-flash", systemPrompt: "", result: null, streaming: false, error: null },
  "upload-image": { type: "upload-image", label: "Upload Image", imageUrl: null, fileName: null },
  "upload-video": { type: "upload-video", label: "Upload Video", videoUrl: null, fileName: null },
  "crop-image": { type: "crop-image", label: "Crop Image", xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100, outputUrl: null, error: null },
  "extract-frame": { type: "extract-frame", label: "Extract Frame", timestamp: "0", outputUrl: null, error: null },
};

function getNodeColor(node: Node): string {
  const type = node.type as NodeType | undefined;
  if (!type || !(type in NODE_COLORS)) return "#525252";
  return NODE_COLORS[type];
}

function Flow() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const setEdges = useWorkflowStore((s) => s.setEdges);
  const addNode = useWorkflowStore((s) => s.addNode);
  const addEdgeToStore = useWorkflowStore((s) => s.addEdge);
  const { screenToFlowPosition } = useReactFlow();

  const connectingNodeRef = useRef<{ nodeId: string | null; handleId: string | null }>({
    nodeId: null,
    handleId: null,
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes(applyNodeChanges(changes, nodes)),
    [setNodes, nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges(applyEdgeChanges(changes, edges)),
    [setEdges, edges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("nodeType") as NodeType;
      if (!nodeType || !(nodeType in DEFAULT_NODE_DATA)) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        position,
        data: DEFAULT_NODE_DATA[nodeType],
      };

      addNode(newNode);
    },
    [addNode, screenToFlowPosition]
  );

  const validateConnection = useCallback(
    (connection: Connection) => checkConnection(connection, nodes),
    [nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        id: crypto.randomUUID(),
        animated: true,
        style: { stroke: "#7c3aed", strokeWidth: 2 },
        type: "smoothstep",
      };
      addEdgeToStore(edge as WorkflowEdge);
    },
    [addEdgeToStore]
  );

  const onConnectStart = useCallback(
    (_: React.MouseEvent | React.TouchEvent, params: OnConnectStartParams) => {
      connectingNodeRef.current = { nodeId: params.nodeId, handleId: params.handleId };
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const el = event.target as Element | null;
      if (!el) return;
      const handleEl = el.closest<HTMLElement>(".react-flow__handle");
      if (!handleEl) return;

      const targetHandleId = handleEl.getAttribute("data-handleid");
      const nodeEl = handleEl.closest<HTMLElement>("[data-id]");
      const targetNodeId = nodeEl?.getAttribute("data-id") ?? null;
      if (!targetNodeId || !targetHandleId) return;

      const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingNodeRef.current;
      if (!sourceNodeId || sourceNodeId === targetNodeId) return;

      const connection: Connection = {
        source: sourceNodeId,
        sourceHandle: sourceHandleId,
        target: targetNodeId,
        targetHandle: targetHandleId,
      };

      if (!checkConnection(connection, nodes)) {
        toast.error(getInvalidConnectionReason(connection, nodes));
      }
    },
    [nodes]
  );

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        isValidConnection={validateConnection}
        nodeTypes={nodeTypes}
        deleteKeyCode={["Delete", "Backspace"]}
        multiSelectionKeyCode="Shift"
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        connectionLineStyle={{ stroke: "#7c3aed", strokeWidth: 2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#7c3aed", strokeWidth: 2 },
          type: "smoothstep",
        }}
        panOnDrag
        zoomOnScroll
        snapToGrid={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#2a2a2a"
        />
        <MiniMap
          position="bottom-right"
          nodeColor={getNodeColor}
          style={{ background: "#111111" }}
          maskColor="rgba(0,0,0,0.6)"
        />
        <Controls position="bottom-left" />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-[#525252] select-none">
            Drag a node from the left panel to get started
          </p>
        </div>
      )}
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <main className="relative flex-1 h-full bg-[#0a0a0a]">
        <Flow />
      </main>
    </ReactFlowProvider>
  );
}
