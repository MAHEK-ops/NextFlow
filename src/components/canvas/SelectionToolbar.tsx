"use client";

import { Play, Braces, LayoutGrid } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow";
import { useWorkflowRun } from "@/hooks/useWorkflowRun";

interface SelectionToolbarProps {
  workflowId: string;
}

export default function SelectionToolbar({ workflowId }: SelectionToolbarProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const groupSelectedNodes = useWorkflowStore((s) => s.groupSelectedNodes);
  const { handleRun } = useWorkflowRun(workflowId);

  const selected = nodes.filter((n) => n.selected);
  if (selected.length === 0) return null;
  if (selected.length === 1 && selected[0]?.type === "group") return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#141414]/90 backdrop-blur-sm border border-[#272727] rounded-2xl px-2 py-1.5 shadow-xl">
      <button
        type="button"
        onClick={() => void handleRun()}
        className="flex items-center gap-1.5 h-8 px-3.5 bg-[#4169e1] hover:bg-[#3a5ecc] rounded-full text-sm text-white font-medium transition-colors"
      >
        <Play size={11} fill="currentColor" />
        Run nodes
      </button>
      <button
        type="button"
        onClick={groupSelectedNodes}
        className="flex items-center gap-1.5 h-8 px-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222222] rounded-full text-sm text-[#e5e5e5] transition-colors"
      >
        <Braces size={13} />
        Group
      </button>
      <button
        type="button"
        className="flex items-center gap-1.5 h-8 px-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222222] rounded-full text-sm text-[#e5e5e5] transition-colors"
      >
        <LayoutGrid size={13} />
        Tidy Up
      </button>
    </div>
  );
}
