"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus } from "@/types/workflow";

export function useWorkflowRun(workflowId: string) {
  const [running, setRunning] = useState(false);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);

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
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toast.error("Workflow failed: " + message);
      setRunStatus("failed");
    } finally {
      setRunning(false);
      setExecutingNodeIds(new Set());
    }
  }, [running, nodes, edges, workflowId, setRunStatus, setExecutingNodeIds]);

  return { running, handleRun };
}
