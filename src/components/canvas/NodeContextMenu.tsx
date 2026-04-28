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

const badge = "px-1.5 py-0.5 bg-[#1f1f1f] border border-[#2a2a2a] rounded text-xs text-[#888888] font-mono";
const item = "w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1a1a1a] cursor-pointer transition-colors";

function Badges({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => <span key={k} className={badge}>{k}</span>)}
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
      <div className="fixed z-50 bg-[#111111] border border-[#272727] rounded-2xl p-1.5 shadow-2xl w-[220px]" style={{ left: x, top: y }}>
        <button type="button" onClick={() => void handleRunNode()} className={item}>
          <div className="flex items-center"><Play size={15} className="text-[#888888]" /><span className="text-sm text-[#e5e5e5] ml-2.5">Run Node</span></div>
          <Badges keys={["Cmd", "Enter"]} />
        </button>
        <button type="button" className={item}>
          <div className="flex items-center"><AlignLeft size={15} className="text-[#888888]" /><span className="text-sm text-[#e5e5e5] ml-2.5">Open Text Editor</span></div>
        </button>

        <div className="h-px bg-[#1f1f1f] my-1" />

        <button type="button" className={item}>
          <div className="flex items-center"><Copy size={15} className="text-[#888888]" /><span className="text-sm text-[#e5e5e5] ml-2.5">Copy</span></div>
          <Badges keys={["Cmd", "C"]} />
        </button>
        <button type="button" onClick={handleDuplicate} className={item}>
          <div className="flex items-center"><CopyPlus size={15} className="text-[#888888]" /><span className="text-sm text-[#e5e5e5] ml-2.5">Duplicate</span></div>
          <Badges keys={["Cmd", "D"]} />
        </button>
        <button type="button" className={item}>
          <div className="flex items-center"><Pencil size={15} className="text-[#888888]" /><span className="text-sm text-[#e5e5e5] ml-2.5">Rename</span></div>
          <Badges keys={["R"]} />
        </button>
        <button type="button" className={item}>
          <div className="flex items-center"><EyeOff size={15} className="text-[#888888]" /><span className="text-sm text-[#e5e5e5] ml-2.5">Disable Node</span></div>
        </button>

        <div className="h-px bg-[#1f1f1f] my-1" />

        <button type="button" onClick={handleDelete} className={item}>
          <div className="flex items-center"><Trash2 size={15} className="text-red-500" /><span className="text-sm text-red-500 ml-2.5">Delete</span></div>
        </button>
      </div>
    </>
  );
}
