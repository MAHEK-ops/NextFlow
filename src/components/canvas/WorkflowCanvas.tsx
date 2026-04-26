"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from "reactflow";
import { NODE_COLORS, type NodeType } from "@/types/workflow";

function getNodeColor(node: Node): string {
  const type = node.type as NodeType | undefined;
  if (!type || !(type in NODE_COLORS)) return "#525252";
  return NODE_COLORS[type];
}

function Flow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((prev) => applyNodeChanges(changes, prev)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((prev) => applyEdgeChanges(changes, prev)),
    []
  );

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
