"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus } from "@/types/workflow";
import NodeSidebar from "./NodeSidebar";
import WorkflowCanvas from "./WorkflowCanvas";
import HistorySidebar from "./HistorySidebar";

interface WorkflowShellProps {
  workflowId: string;
  initialName: string;
}

export default function WorkflowShell({ workflowId, initialName }: WorkflowShellProps) {
  const [running, setRunning] = useState(false);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setWorkflowId = useWorkflowStore((s) => s.setWorkflowId);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);

  useEffect(() => {
    setWorkflowId(workflowId);
  }, [workflowId, setWorkflowId]);

  async function handleRun() {
    if (running || nodes.length === 0) return;
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
        toast.error("Workflow failed: " + (data.error ?? "Unknown error"));
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
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <header className="h-12 flex-none flex items-center justify-between px-4 bg-[#111111] border-b border-[#1f1f1f]">
        <input
          type="text"
          defaultValue={initialName}
          placeholder="Untitled Workflow"
          className="bg-transparent text-white text-sm font-medium placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] rounded px-1 py-0.5 w-48 min-w-0"
        />
        <button
          type="button"
          disabled={running}
          onClick={handleRun}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          {running && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {running ? "Running..." : "Run"}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar />
        <WorkflowCanvas />
        <HistorySidebar workflowId={workflowId} />
      </div>
    </div>
  );
}
