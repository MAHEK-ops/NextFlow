"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReactFlowProvider } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus, WorkflowNode, WorkflowEdge } from "@/types/workflow";
import NodeSidebar from "./NodeSidebar";
import WorkflowCanvas from "./WorkflowCanvas";
import HistorySidebar from "./HistorySidebar";
import CommandPalette from "./CommandPalette";

interface WorkflowShellProps {
  workflowId: string;
  initialName: string;
}

type SaveState = "idle" | "saving" | "saved";

export default function WorkflowShell({ workflowId, initialName }: WorkflowShellProps) {
  const [running, setRunning] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          id: string;
          name: string;
          nodes: WorkflowNode[];
          edges: WorkflowEdge[];
        };
        skipNextSaveRef.current = true;
        loadWorkflow(data.id, data.name, data.nodes, data.edges);
      } finally {
        hasLoadedRef.current = true;
      }
    }
    fetchWorkflow();
  }, [workflowId, loadWorkflow]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const { nodes: n, edges: e } = useWorkflowStore.getState();
      setSaveState("saving");
      try {
        await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes: n, edges: e }),
        });
        setSaveState("saved");
        if (savedFeedbackTimeoutRef.current) clearTimeout(savedFeedbackTimeoutRef.current);
        savedFeedbackTimeoutRef.current = setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("idle");
      }
    }, 1000);
  }, [workflowId]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    scheduleSave();
  }, [nodes, edges, scheduleSave]);

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
    <ReactFlowProvider>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <header className="h-12 flex-none flex items-center justify-between px-4 bg-[#111111] border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3 min-w-0">
            <input
              type="text"
              defaultValue={initialName}
              placeholder="Untitled Workflow"
              className="bg-transparent text-white text-sm font-medium placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] rounded px-1 py-0.5 w-48 min-w-0"
            />
            {saveState === "saving" && (
              <span className="text-xs text-[#525252] flex-none">Saving...</span>
            )}
            {saveState === "saved" && (
              <span className="text-xs text-[#525252] flex-none">Saved</span>
            )}
          </div>
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

        <CommandPalette workflowId={workflowId} onRun={handleRun} />
      </div>
    </ReactFlowProvider>
  );
}
