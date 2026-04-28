"use client";

import {
  Play, AlignLeft, Copy, CopyPlus, Pencil, EyeOff, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus } from "@/types/workflow";

interface Props {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

const badgeCls = "px-1.5 py-0.5 rounded text-xs font-mono border";
const item = "w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--input-bg)] cursor-pointer transition-colors";

function Badges({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <span key={k} className={badgeCls} style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-muted)" }}>
          {k}
        </span>
      ))}
    </div>
  );
}

export default function NodeContextMenu({ nodeId, x, y, onClose }: Props) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const addNode = useWorkflowStore((s) => s.addNode);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);

  async function handleRunNode() {
    const { nodes: n, edges, workflowId } = useWorkflowStore.getState();
    if (!workflowId) { onClose(); return; }
    onClose();
    setExecutingNodeIds(new Set([nodeId]));
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, scope: "single", selectedNodeIds: [nodeId], nodes: n, edges }),
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

  function handleDuplicate() {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) { onClose(); return; }
    addNode({ ...node, id: crypto.randomUUID(), position: { x: node.position.x + 20, y: node.position.y + 20 } });
    onClose();
  }

  function handleDelete() {
    removeNode(nodeId);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed z-50 rounded-2xl p-1.5 shadow-2xl w-[220px] border" style={{ left: x, top: y, background: "var(--toolbar-bg)", borderColor: "var(--toolbar-border)" }}>
        <button type="button" onClick={() => void handleRunNode()} className={item}>
          <div className="flex items-center"><Play size={15} style={{ color: "var(--text-muted)" }} /><span className="text-sm ml-2.5" style={{ color: "var(--text-primary)" }}>Run Node</span></div>
          <Badges keys={["Cmd", "Enter"]} />
        </button>
        <button type="button" className={item}>
          <div className="flex items-center"><AlignLeft size={15} style={{ color: "var(--text-muted)" }} /><span className="text-sm ml-2.5" style={{ color: "var(--text-primary)" }}>Open Text Editor</span></div>
        </button>

        <div className="h-px my-1" style={{ background: "var(--toolbar-border)" }} />

        <button type="button" className={item}>
          <div className="flex items-center"><Copy size={15} style={{ color: "var(--text-muted)" }} /><span className="text-sm ml-2.5" style={{ color: "var(--text-primary)" }}>Copy</span></div>
          <Badges keys={["Cmd", "C"]} />
        </button>
        <button type="button" onClick={handleDuplicate} className={item}>
          <div className="flex items-center"><CopyPlus size={15} style={{ color: "var(--text-muted)" }} /><span className="text-sm ml-2.5" style={{ color: "var(--text-primary)" }}>Duplicate</span></div>
          <Badges keys={["Cmd", "D"]} />
        </button>
        <button type="button" className={item}>
          <div className="flex items-center"><Pencil size={15} style={{ color: "var(--text-muted)" }} /><span className="text-sm ml-2.5" style={{ color: "var(--text-primary)" }}>Rename</span></div>
          <Badges keys={["R"]} />
        </button>
        <button type="button" className={item}>
          <div className="flex items-center"><EyeOff size={15} style={{ color: "var(--text-muted)" }} /><span className="text-sm ml-2.5" style={{ color: "var(--text-primary)" }}>Disable Node</span></div>
        </button>

        <div className="h-px my-1" style={{ background: "var(--toolbar-border)" }} />

        <button type="button" onClick={handleDelete} className={item}>
          <div className="flex items-center"><Trash2 size={15} className="text-red-500" /><span className="text-sm text-red-500 ml-2.5">Delete</span></div>
        </button>
      </div>
    </>
  );
}
