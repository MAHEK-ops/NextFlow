"use client";

import { useCallback } from "react";
import { Type, Sparkles, Image as ImageIcon, VideoIcon, Crop, Film, type LucideIcon } from "lucide-react";
import { useReactFlow } from "reactflow";
import { NODE_COLORS, type NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import { DEFAULT_NODE_DATA } from "@/lib/node-defaults";
import type { WorkflowNode } from "@/types/workflow";

const NODE_DEFINITIONS: Array<{ type: NodeType; label: string; icon: LucideIcon }> = [
  { type: "text", label: "Text", icon: Type },
  { type: "llm", label: "LLM", icon: Sparkles },
  { type: "upload-image", label: "Upload Image", icon: ImageIcon },
  { type: "upload-video", label: "Upload Video", icon: VideoIcon },
  { type: "crop-image", label: "Crop Image", icon: Crop },
  { type: "extract-frame", label: "Extract Frame", icon: Film },
];

function NodeButton({ type, label, icon: Icon }: { type: NodeType; label: string; icon: LucideIcon }) {
  const color = NODE_COLORS[type];
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);

  function onDragStart(event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData("nodeType", type);
    event.dataTransfer.effectAllowed = "move";
  }

  const handleClick = useCallback(() => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type,
      position,
      data: DEFAULT_NODE_DATA[type],
    };
    addNode(newNode);
  }, [screenToFlowPosition, addNode]);

  return (
    <div className="relative group">
      <button
        type="button"
        draggable
        onDragStart={onDragStart}
        onClick={handleClick}
        className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-all hover:bg-[#1a1a1a]"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color }}>
          <Icon size={14} className="text-white" />
        </div>
      </button>
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1a1a1a] border border-[#272727] rounded-lg text-xs text-[#e5e5e5] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {label}
      </div>
    </div>
  );
}

export default function NodeSidebar() {
  return (
    <aside
      className="w-12 flex-none flex flex-col items-center py-3 gap-1 border-r"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--toolbar-border)" }}
    >
      {NODE_DEFINITIONS.map((def) => (
        <NodeButton key={def.type} {...def} />
      ))}
    </aside>
  );
}
