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
}

export default function NodeWrapper({ nodeId, label, selected, minWidth = 240, children, overlay }: Props) {
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
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
          <button
            type="button"
            onClick={() => void handleRunNode()}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-sm transition-colors shadow-lg border hover:bg-[var(--input-bg)]"
            style={{ background: "var(--toolbar-bg)", borderColor: "var(--toolbar-border)", color: "var(--text-primary)" }}
          >
            <Play size={12} style={{ color: "var(--text-muted)" }} />
            Run node
          </button>
        </div>
      )}
      {overlay}
      <div
        className={`border rounded-2xl overflow-hidden ${selected ? "border-[#7c3aed]" : "border-[var(--node-border)]"}`}
        style={{ background: "var(--node-bg)" }}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: "var(--toolbar-border)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
          <Info size={13} style={{ color: "var(--text-muted)" }} />
        </div>
        {children}
      </div>
    </div>
  );
}
