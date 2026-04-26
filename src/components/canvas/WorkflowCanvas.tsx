"use client";

import { useCallback } from "react";
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
} from "reactflow";
import { NODE_COLORS, type NodeType, type NodeData, type WorkflowNode } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import TextNode from "@/components/nodes/TextNode";
import UploadImageNode from "@/components/nodes/UploadImageNode";
import UploadVideoNode from "@/components/nodes/UploadVideoNode";

// defined outside Flow so React Flow never sees a new object reference on re-render
const nodeTypes = {
  text: TextNode,
  "upload-image": UploadImageNode,
  "upload-video": UploadVideoNode,
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
  const { screenToFlowPosition } = useReactFlow();

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

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
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
