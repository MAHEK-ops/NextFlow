"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { ReactFlowProvider } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { exportWorkflowAsJson, parseWorkflowJson } from "@/lib/workflow-io";
import { useWorkflowRun } from "@/hooks/useWorkflowRun";
import TitlePill from "./TitlePill";
import TopBarActions from "./TopBarActions";
import SelectionToolbar from "./SelectionToolbar";
import NodeSidebar from "./NodeSidebar";
import WorkflowCanvas from "./WorkflowCanvas";
import HistorySidebar from "./HistorySidebar";
import AssetsPanel from "./AssetsPanel";
import CommandPalette from "./CommandPalette";

interface WorkflowShellProps {
  workflowId: string;
  initialName: string;
}

type SaveState = "idle" | "saving" | "saved";

export default function WorkflowShell({ workflowId, initialName }: WorkflowShellProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAssetsPanel, setShowAssetsPanel] = useState(false);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);

  const { handleRun } = useWorkflowRun(workflowId);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="h-screen w-screen overflow-hidden flex">
        <NodeSidebar
          collapsed={!showSidebar}
          onToggle={() => setShowSidebar((v) => !v)}
          onOpenAssets={() => setShowAssetsPanel(true)}
        />
        <div className="relative flex-1 overflow-hidden">
          <WorkflowCanvas />
          <div className="absolute top-4 left-4 z-20">
            <TitlePill
              workflowName={workflowName}
              onWorkflowNameChange={setWorkflowName}
              onScheduleSave={scheduleSave}
              saveState={saveState}
              onImport={handleTriggerImport}
              onExport={handleExport}
            />
          </div>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <TopBarActions
              showVersionHistory={showVersionHistory}
              onToggleVersionHistory={() => setShowVersionHistory((v) => !v)}
              onOpenAssets={() => setShowAssetsPanel(true)}
            />
          </div>
          <SelectionToolbar workflowId={workflowId} />
          {showAssetsPanel && (
            <AssetsPanel onClose={() => setShowAssetsPanel(false)} />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <CommandPalette
            workflowId={workflowId}
            onRun={handleRun}
            onExport={handleExport}
            onImport={handleTriggerImport}
          />
        </div>
        {showVersionHistory && (
          <HistorySidebar
            workflowId={workflowId}
            onClose={() => setShowVersionHistory(false)}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}
