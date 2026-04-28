"use client";

import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type OnConnectStartParams,
} from "reactflow";
import NodeContextMenu from "./NodeContextMenu";
import CanvasToolbar, { type ActiveTool } from "./CanvasToolbar";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import NodePickerPanel from "./NodePickerPanel";
import { NODE_COLORS, type NodeType, type WorkflowNode, type WorkflowEdge } from "@/types/workflow";
import { DEFAULT_NODE_DATA } from "@/lib/node-defaults";
import { useWorkflowStore } from "@/store/workflow";
import { useNodeShortcuts } from "@/hooks/useNodeShortcuts";
import { toast } from "sonner";
import { isValidConnection as checkConnection, getInvalidConnectionReason } from "@/lib/handle-validator";
import TextNode from "@/components/nodes/TextNode";
import UploadImageNode from "@/components/nodes/UploadImageNode";
import UploadVideoNode from "@/components/nodes/UploadVideoNode";
import LLMNode from "@/components/nodes/LLMNode";
import CropImageNode from "@/components/nodes/CropImageNode";
import ExtractFrameNode from "@/components/nodes/ExtractFrameNode";

const nodeTypes = {
  text: TextNode,
  "upload-image": UploadImageNode,
  "upload-video": UploadVideoNode,
  llm: LLMNode,
  "crop-image": CropImageNode,
  "extract-frame": ExtractFrameNode,
};

function getNodeColor(node: Node): string {
  const type = node.type as NodeType | undefined;
  if (!type || !(type in NODE_COLORS)) return "#525252";
  return NODE_COLORS[type];
}

function Flow() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const executingNodeIds = useWorkflowStore((s) => s.executingNodeIds);
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const setEdges = useWorkflowStore((s) => s.setEdges);
  const addNode = useWorkflowStore((s) => s.addNode);
  const addEdgeToStore = useWorkflowStore((s) => s.addEdge);
  const { screenToFlowPosition } = useReactFlow();

  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [showMinimap, setShowMinimap] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);

  useNodeShortcuts(showShortcuts, () => setShowShortcuts(false), () => setShowNodePicker(true));

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
  }, []);

  const connectingNodeRef = useRef<{ nodeId: string | null; handleId: string | null }>({
    nodeId: null,
    handleId: null,
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes)),
    [setNodes, nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(applyEdgeChanges(changes, edges)),
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
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
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

  const styledNodes = nodes.map((node) => ({
    ...node,
    className: executingNodeIds.has(node.id) ? "node-executing" : "",
  }));

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeContextMenu={onNodeContextMenu}
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
        panOnDrag={activeTool === "pan"}
        selectionOnDrag={activeTool === "select"}
        zoomOnScroll
        snapToGrid={false}
        style={{ background: "var(--canvas-bg)" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2a2a" />
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            nodeColor={getNodeColor}
            style={{ background: "#111111", marginBottom: "48px" }}
            maskColor="rgba(0,0,0,0.6)"
          />
        )}
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm font-medium text-[#3a3a3a] select-none">Add a node</p>
          <p className="text-xs text-[#2a2a2a] select-none mt-1 flex items-center">
            Double click, right click, or press
            <span className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#272727] rounded text-xs text-[#525252] font-mono inline-flex items-center ml-1">
              N
            </span>
          </p>
        </div>
      )}

      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}

      {showNodePicker && (
        <>
          <div
            className="absolute inset-0 z-20"
            onClick={() => setShowNodePicker(false)}
          />
          <NodePickerPanel onClose={() => setShowNodePicker(false)} />
        </>
      )}

      <CanvasToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        showMinimap={showMinimap}
        setShowMinimap={setShowMinimap}
        onOpenShortcuts={() => setShowShortcuts(true)}
        showNodePicker={showNodePicker}
        onToggleNodePicker={() => setShowNodePicker((v) => !v)}
      />

      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <main className="relative w-full h-full" style={{ background: "var(--canvas-bg)" }}>
      <Flow />
    </main>
  );
}
