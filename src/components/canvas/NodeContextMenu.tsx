"use client";

import { toast } from "sonner";
import { useWorkflowStore } from "@/store/workflow";
import type { RunStatus } from "@/types/workflow";

interface NodeContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function NodeContextMenu({ nodeId, x, y, onClose }: NodeContextMenuProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const addNode = useWorkflowStore((s) => s.addNode);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const setExecutingNodeIds = useWorkflowStore((s) => s.setExecutingNodeIds);
  const setRunStatus = useWorkflowStore((s) => s.setRunStatus);

  async function handleRunNode() {
    if (!workflowId) return;
    onClose();
    setExecutingNodeIds(new Set([nodeId]));
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          scope: "single",
          selectedNodeIds: [nodeId],
          nodes,
          edges,
        }),
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
      const message = err instanceof Error ? err.message : "Network error";
      toast.error("Node failed: " + message);
      setRunStatus("failed");
    } finally {
      setExecutingNodeIds(new Set());
    }
  }

  function handleDuplicate() {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) { onClose(); return; }
    addNode({
      ...node,
      id: crypto.randomUUID(),
      position: { x: node.position.x + 20, y: node.position.y + 20 },
    });
    onClose();
  }

  function handleDelete() {
    removeNode(nodeId);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-[#1a1a1a] border border-[#272727] rounded-lg shadow-xl py-1 min-w-[160px]"
        style={{ left: x, top: y }}
      >
        <button
          type="button"
          onClick={() => void handleRunNode()}
          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#252525] transition-colors"
        >
          Run Node
        </button>
        <button
          type="button"
          onClick={handleDuplicate}
          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#252525] transition-colors"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#252525] transition-colors"
        >
          Delete
        </button>
      </div>
    </>
  );
}
