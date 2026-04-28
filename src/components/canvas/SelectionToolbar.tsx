"use client";

import { Play, Braces, LayoutGrid } from "lucide-react";
import { useReactFlow } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import { useWorkflowRun } from "@/hooks/useWorkflowRun";

interface SelectionToolbarProps {
  workflowId: string;
}

export default function SelectionToolbar({ workflowId }: SelectionToolbarProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const groupSelectedNodes = useWorkflowStore((s) => s.groupSelectedNodes);
  const { handleRun } = useWorkflowRun(workflowId);
  const { flowToScreenPosition } = useReactFlow();

  const selected = nodes.filter((n) => n.selected);
  if (selected.length === 0) return null;
  if (selected.length === 1 && selected[0]?.type === "group") return null;

  const minX = Math.min(...selected.map((n) => n.position.x));
  const maxX = Math.max(...selected.map((n) => n.position.x + (n.width ?? 200)));
  const minY = Math.min(...selected.map((n) => n.position.y));
  const centerX = (minX + maxX) / 2;

  const screenPos = flowToScreenPosition({ x: centerX, y: minY });

  return (
    <div
      className="fixed z-30 pointer-events-auto"
      style={{ left: screenPos.x, top: screenPos.y - 52, transform: "translateX(-50%)" }}
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => void handleRun()}
          className="flex items-center gap-1.5 h-8 px-3.5 bg-[#4169e1] hover:bg-[#3a5ecc] rounded-full text-sm text-white font-medium transition-colors shadow-lg whitespace-nowrap"
        >
          <Play size={11} fill="currentColor" />
          Run nodes
        </button>
        <button
          type="button"
          onClick={groupSelectedNodes}
          className="flex items-center gap-1.5 h-8 px-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222222] rounded-full text-sm text-[#e5e5e5] transition-colors shadow-lg whitespace-nowrap"
        >
          <Braces size={13} />
          Group
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 h-8 px-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222222] rounded-full text-sm text-[#e5e5e5] transition-colors shadow-lg whitespace-nowrap"
        >
          <LayoutGrid size={13} />
          Tidy Up
        </button>
      </div>
    </div>
  );
}
