"use client";

import { Play, Braces, LayoutGrid } from "lucide-react";
import { useReactFlow } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import { toast } from "sonner";
import type { RunStatus, WorkflowRunRecord } from "@/types/workflow";

interface SelectionToolbarProps {
  workflowId: string;
}

export default function SelectionToolbar({ workflowId }: SelectionToolbarProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const groupSelectedNodes = useWorkflowStore((s) => s.groupSelectedNodes);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { flowToScreenPosition } = useReactFlow();

  const selected = nodes.filter((n) => n.selected);
  if (selected.length < 2) return null;

  const minX = Math.min(...selected.map((n) => n.position.x));
  const maxX = Math.max(...selected.map((n) => n.position.x + (n.width ?? 240)));
  const minY = Math.min(...selected.map((n) => n.position.y));
  const centerX = (minX + maxX) / 2;

  const screenPos = flowToScreenPosition({ x: centerX, y: minY });

  async function applyNodeOutputs(runId: string) {
    try {
      const res = await fetch(`/api/workflows/${workflowId}/runs`);
      if (!res.ok) return;
      const data = (await res.json()) as { runs: WorkflowRunRecord[] };
      const run = data.runs.find((r) => r.id === runId);
      if (!run) return;
      for (const exec of run.executions) {
        if (exec.status !== "success") continue;
        const output = (exec.outputs as Record<string, unknown>)?.output;
        if (typeof output !== "string") continue;
        const node = useWorkflowStore.getState().nodes.find((n) => n.id === exec.nodeId);
        if (!node) continue;
        if (node.data.type === "llm") {
          updateNodeData(exec.nodeId, { result: output, streaming: false, error: null });
        }
        if (node.data.type === "crop-image") {
          updateNodeData(exec.nodeId, { outputUrl: output, error: null });
        }
        if (node.data.type === "extract-frame") {
          updateNodeData(exec.nodeId, { outputUrl: output, error: null });
        }
      }
    } catch {
      // silently ignore
    }
  }

  async function handleRunSelected() {
    const selectedIds = selected.map((n) => n.id);
    toast.info("Running selected nodes...");
    setExecutingNodeIds(new Set(selectedIds));
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          scope: "partial",
          selectedNodeIds: selectedIds,
          nodes,
          edges,
        }),
      });
      const data = (await res.json()) as {
        runId?: string;
        status?: string;
        error?: string;
      };
      if (!res.ok) {
        toast.error("Run failed: " + (data.error ?? "Unknown error"));
        setRunStatus("failed");
      } else {
        toast.success("Selected nodes completed");
        setRunStatus((data.status as RunStatus) ?? "success");
        if (data.runId) {
          await applyNodeOutputs(data.runId);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toast.error("Run failed: " + message);
      setRunStatus("failed");
    } finally {
      setExecutingNodeIds(new Set());
    }
  }

  return (
    <div
      className="fixed z-30 pointer-events-auto"
      style={{ left: screenPos.x, top: screenPos.y - 52, transform: "translateX(-50%)" }}
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => void handleRunSelected()}
          className="flex items-center gap-1.5 h-8 px-3.5 bg-[#4169e1] hover:bg-[#3a5ecc] rounded-full text-sm text-white font-medium transition-colors shadow-lg whitespace-nowrap"
        >
          <Play size={11} fill="currentColor" />
          Run nodes
        </button>
        <button
          type="button"
          onClick={() => {
            groupSelectedNodes();
          }}
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