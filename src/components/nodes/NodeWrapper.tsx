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
}

export default function NodeWrapper({ nodeId, label, selected, minWidth = 240, children }: Props) {
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
        body: JSON.stringify({
          workflowId,
          scope: "single",
          selectedNodeIds: [nodeId],
          nodes,
          edges,
        }),
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
      {selected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
          <button
            type="button"
            onClick={() => void handleRunNode()}
            className="flex items-center gap-1.5 px-3 h-8 bg-[#111111] border border-[#272727] rounded-xl text-sm text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors shadow-lg"
          >
            <Play size={12} className="text-[#888888]" />
            Run node
          </button>
        </div>
      )}
      <div
        className={`border rounded-2xl overflow-hidden ${
          selected ? "border-[#7c3aed]" : "border-[var(--node-border)]"
        }`}
        style={{ background: "var(--node-bg)" }}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1f1f1f]">
          <span className="text-xs text-[#888888] font-medium">{label}</span>
          <Info size={13} className="text-[#525252]" />
        </div>
        {children}
      </div>
    </div>
  );
}
