"use client";

import { type ReactNode } from "react";
import { Info, Play } from "lucide-react";
import { toast } from "sonner";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus } from "@/types/workflow";

interface Props {
  nodeId: string;
  label: string;
  selected?: boolean;
  minWidth?: number;
  children: ReactNode;
  overlay?: ReactNode;
  error?: string | null;
}

export default function NodeWrapper({ nodeId, label, selected, minWidth = 240, children, overlay, error }: Props) {
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);

  async function handleRunNode() {
    const { nodes, edges, workflowId } = useWorkflowStore.getState();
    if (!workflowId) return;
    setExecutingNodeIds(new Set([nodeId]));
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, scope: "single", selectedNodeIds: [nodeId], nodes, edges }),
      });
      const data = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) {
        toast.error("Node failed: " + (data.error ?? "Unknown error"));
        setRunStatus("failed");
      } else {
        toast.success("Node completed");
        setRunStatus((data.status as RunStatus) ?? "success");
      }
    } catch (err) {
      toast.error("Node failed: " + (err instanceof Error ? err.message : "Network error"));
      setRunStatus("failed");
    } finally {
      setExecutingNodeIds(new Set());
    }
  }

  return (
    <div className="relative" style={{ minWidth }}>
      {selected && !overlay && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
          <button
            type="button"
            onClick={() => void handleRunNode()}
            className="flex items-center gap-1.5 h-7 px-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222222] rounded-full text-xs text-[#e5e5e5] transition-colors shadow-lg whitespace-nowrap"
          >
            <Play size={10} fill="currentColor" className="text-[#aaaaaa]" />
            Run node
          </button>
        </div>
      )}
      {overlay}
      <div
        className={`border rounded-2xl overflow-hidden bg-[#111111] ${selected ? "border-[#6d4aed]/60" : "border-[#2a2a2a]"}`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f]">
          <span className="text-xs font-medium text-[#666666]">{label}</span>
          <Info size={13} className="text-[#3a3a3a]" />
        </div>
        {children}
        {error && (
          <div className="mx-3 mb-3 px-3 py-2 bg-[#7f1d1d]/20 border border-[#f87171]/30 rounded-xl">
            <p className="text-xs text-[#f87171] leading-relaxed break-words">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
