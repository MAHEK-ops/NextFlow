"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { ReactFlowProvider } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus, WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { exportWorkflowAsJson, parseWorkflowJson } from "@/lib/workflow-io";
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
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveNow = useCallback(async () => {
    const { nodes: n, edges: e, workflowName: name } = useWorkflowStore.getState();
    setSaveState("saving");
    try {
      await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nodes: n, edges: e }),
      });
      setSaveState("saved");
      if (savedFeedbackTimeoutRef.current) clearTimeout(savedFeedbackTimeoutRef.current);
      savedFeedbackTimeoutRef.current = setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("idle");
    }
  }, [workflowId]);

  // Show the server-fetched name immediately before the fetch effect completes
  useEffect(() => {
    setWorkflowName(initialName);
  }, [initialName, setWorkflowName]);

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
    saveTimeoutRef.current = setTimeout(() => void saveNow(), 1000);
  }, [saveNow]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    scheduleSave();
  }, [nodes, edges, scheduleSave]);

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isTyping = ["input", "textarea", "select"].includes(tag);

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void handleRun();
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (e.key === "s" && (e.metaKey || e.ctrlKey) && !isTyping) {
        e.preventDefault();
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        void saveNow();
      }
      if (e.key === "a" && (e.metaKey || e.ctrlKey) && !isTyping) {
        e.preventDefault();
        const { nodes: n, setNodes: sn } = useWorkflowStore.getState();
        sn(n.map((node) => ({ ...node, selected: true })));
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleRun, undo, redo, saveNow]);

  function handleExport() {
    exportWorkflowAsJson(workflowName, nodes, edges);
  }

  function handleTriggerImport() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;
      const parsed = parseWorkflowJson(text);
      if (!parsed) {
        toast.error("Invalid workflow file");
        return;
      }
      skipNextSaveRef.current = true;
      loadWorkflow(workflowId, parsed.name, parsed.nodes, parsed.edges);
      try {
        await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: parsed.name, nodes: parsed.nodes, edges: parsed.edges }),
        });
        toast.success("Workflow imported");
      } catch {
        toast.error("Failed to save imported workflow");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <header className="h-12 flex-none flex items-center justify-between px-4 bg-[#111111] border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3 min-w-0">
            <input
              type="text"
              value={workflowName}
              placeholder="Untitled Workflow"
              onChange={(e) => {
                setWorkflowName(e.target.value);
                scheduleSave();
              }}
              className="bg-transparent text-white text-sm font-medium placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] rounded px-1 py-0.5 w-48 min-w-0"
            />
            {saveState === "saving" && (
              <span className="text-xs text-[#525252] flex-none">Saving...</span>
            )}
            {saveState === "saved" && (
              <span className="text-xs text-[#525252] flex-none">Saved</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Export workflow as JSON"
              onClick={handleExport}
              className="p-1.5 text-[#525252] hover:text-white rounded transition-colors"
            >
              <Download size={15} />
            </button>
            <button
              type="button"
              title="Import workflow from JSON"
              onClick={handleTriggerImport}
              className="p-1.5 text-[#525252] hover:text-white rounded transition-colors"
            >
              <Upload size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={running}
              onClick={handleRun}
              className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              {running && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {running ? "Running..." : "Run"}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <NodeSidebar />
          <WorkflowCanvas />
          <HistorySidebar workflowId={workflowId} />
        </div>

        <CommandPalette
          workflowId={workflowId}
          onRun={handleRun}
          onExport={handleExport}
          onImport={handleTriggerImport}
        />
      </div>
    </ReactFlowProvider>
  );
}
