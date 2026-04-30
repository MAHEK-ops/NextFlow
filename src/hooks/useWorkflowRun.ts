"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus, WorkflowRunRecord } from "@/types/workflow";

export function useWorkflowRun(workflowId: string) {
  const [running, setRunning] = useState(false);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const applyNodeOutputs = useCallback(async (runId: string) => {
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
  }, [workflowId, updateNodeData]);

  const handleRun = useCallback(async () => {
    if (running || nodes.length === 0) return;
    toast.info("Running workflow...");
    setRunning(true);
    setExecutingNodeIds(new Set(nodes.map((n) => n.id)));

    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, scope: "full", nodes, edges }),
      });

      const data = (await res.json()) as {
        runId?: string;
        status?: string;
        duration?: number;
        error?: string;
      };

      if (!res.ok) {
        const errorMsg = data.error ?? "Unknown error";
        if (errorMsg.toLowerCase().includes("cycle")) {
          toast.error("Workflow contains a cycle");
        } else {
          toast.error("Workflow failed: " + errorMsg);
        }
        setRunStatus("failed");
      } else {
        toast.success("Workflow completed");
        setRunStatus((data.status as RunStatus) ?? "success");
        if (data.runId) {
          await applyNodeOutputs(data.runId);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toast.error("Workflow failed: " + message);
      setRunStatus("failed");
    } finally {
      setRunning(false);
      setExecutingNodeIds(new Set());
    }
  }, [running, nodes, edges, workflowId, setRunStatus, setExecutingNodeIds, applyNodeOutputs]);

  return { running, handleRun };
}