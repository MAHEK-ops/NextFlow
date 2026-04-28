"use client";

import { useState } from "react";
import { type NodeProps, NodeResizer } from "reactflow";
import { Play, Ungroup } from "lucide-react";
import { toast } from "sonner";
import { useWorkflowStore } from "@/store/workflow";
import type { GroupNodeData, RunStatus } from "@/types/workflow";

export default function GroupNode({ id, data, selected }: NodeProps<GroupNodeData>) {
  const [hovered, setHovered] = useState(false);
  const ungroupNodes = useWorkflowStore((s) => s.ungroupNodes);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);

  async function handleRunGroup() {
    const { nodes, edges, workflowId } = useWorkflowStore.getState();
    if (!workflowId) return;
    const childIds = nodes.filter((n) => n.parentId === id).map((n) => n.id);
    if (childIds.length === 0) return;
    setExecutingNodeIds(new Set(childIds));
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, scope: "partial", selectedNodeIds: childIds, nodes, edges }),
      });
      const result = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) {
        toast.error("Group failed: " + (result.error ?? "Unknown error"));
        setRunStatus("failed");
      } else {
        toast.success("Group completed");
        setRunStatus((result.status as RunStatus) ?? "success");
      }
    } catch (err) {
      toast.error("Group failed: " + (err instanceof Error ? err.message : "Network error"));
      setRunStatus("failed");
    } finally {
      setExecutingNodeIds(new Set());
    }
  }

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        lineStyle={{ borderColor: "#f59e0b", borderWidth: 1.5 }}
        handleStyle={{ background: "#f59e0b", border: "none", width: 8, height: 8 }}
      />
      <div
        className="w-full h-full rounded-2xl border-2 border-dashed"
        style={{ borderColor: "rgba(245, 158, 11, 0.5)", background: "rgba(245, 158, 11, 0.04)" }}
      >
        <span
          className="absolute top-2 left-3 text-xs font-medium select-none pointer-events-none"
          style={{ color: "rgba(245, 158, 11, 0.7)" }}
        >
          {data.label ?? "Group 1"}
        </span>
      </div>

      {(hovered || selected) && (
        <div className="absolute -top-10 left-0 flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            className="flex items-center gap-1.5 h-8 px-3.5 bg-[#4169e1] hover:bg-[#3a5ecc] rounded-full text-sm text-white font-medium transition-colors shadow-lg"
            onClick={() => void handleRunGroup()}
          >
            <Play size={11} fill="currentColor" />
            Run Group
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 h-8 px-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222222] rounded-full text-sm text-[#e5e5e5] transition-colors shadow-lg"
            onClick={() => ungroupNodes(id)}
          >
            <Ungroup size={13} />
            Ungroup
          </button>
        </div>
      )}
    </div>
  );
}
