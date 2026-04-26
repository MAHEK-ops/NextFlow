"use client";

import { Type, Cpu, ImagePlus, VideoIcon, Crop, Film, type LucideIcon } from "lucide-react";
import { NODE_COLORS, type NodeType } from "@/types/workflow";

const NODE_DEFINITIONS: Array<{ type: NodeType; label: string; icon: LucideIcon }> = [
  { type: "text", label: "Text", icon: Type },
  { type: "llm", label: "LLM", icon: Cpu },
  { type: "upload-image", label: "Upload Image", icon: ImagePlus },
  { type: "upload-video", label: "Upload Video", icon: VideoIcon },
  { type: "crop-image", label: "Crop Image", icon: Crop },
  { type: "extract-frame", label: "Extract Frame", icon: Film },
];

function NodeButton({ type, label, icon: Icon }: { type: NodeType; label: string; icon: LucideIcon }) {
  const color = NODE_COLORS[type];

  function onDragStart(event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData("nodeType", type);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-[#1a1a1a] hover:bg-[#222222] transition-colors text-left cursor-grab active:cursor-grabbing"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <Icon size={14} style={{ color }} className="flex-none" />
      <span className="text-sm text-white">{label}</span>
    </button>
  );
}

export default function NodeSidebar() {
  return (
    <aside className="w-[220px] flex-none flex flex-col bg-[#111111] border-r border-[#1f1f1f]">
      <p className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
        Nodes
      </p>
      <div className="border-b border-[#1f1f1f]" />
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {NODE_DEFINITIONS.map((def) => (
          <NodeButton key={def.type} {...def} />
        ))}
      </div>
    </aside>
  );
}
