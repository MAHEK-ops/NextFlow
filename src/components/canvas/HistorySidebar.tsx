"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Clock, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { WorkflowRunRecord, RunScope, NodeExecutionRecord } from "@/types/workflow";

interface HistorySidebarProps {
  workflowId: string;
  onClose?: () => void;
}

function formatDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

function runBadgeClass(status: string): string {
  if (status === "success") return "bg-[#166534]/30 text-[#4ade80]";
  if (status === "failed") return "bg-[#7f1d1d]/30 text-[#f87171]";
  return "bg-[#713f12]/30 text-[#fbbf24]";
}

function runBadgeLabel(status: string): string {
  if (status === "success") return "Success";
  if (status === "failed") return "Failed";
  return "Partial";
}

function nodeDotClass(status: string): string {
  if (status === "success") return "bg-[#4ade80]";
  if (status === "failed") return "bg-[#f87171]";
  return "bg-[#fbbf24]";
}

function scopeLabel(scope: RunScope): string {
  if (scope === "full") return "Full Workflow";
  if (scope === "partial") return "Selected Nodes";
  return "Single Node";
}

function NodeRow({ exec, name }: { exec: NodeExecutionRecord; name: string }) {
  return (
    <div className="relative mb-3 last:mb-0">
      <div className={`absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#111111] ${nodeDotClass(exec.status)}`} />
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-[#c5c5c5] font-medium truncate">{name}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-[10px] font-medium ${exec.status === "success" ? "text-[#4ade80]" : "text-[#f87171]"}`}>
              {exec.status === "success" ? "Success" : "Failed"}
            </span>
            <span className="text-[10px] text-[#525252]">{exec.duration}ms</span>
          </div>
        </div>
        {exec.error && (
          <p className="text-[10px] text-[#f87171] mt-1 leading-relaxed break-words">
            {exec.error}
          </p>
        )}
        {exec.status === "success" && exec.outputs && Object.keys(exec.outputs).length > 0 && (
          <p className="text-[10px] text-[#525252] mt-0.5 truncate">
            {JSON.stringify(exec.outputs).slice(0, 50)}
          </p>
        )}
      </div>
    </div>
  );
}

function RunCard({
  run,
  expanded,
  onToggle,
}: {
  run: WorkflowRunRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  const nodeNameMap = useMemo(() => {
    const snapshot = run.nodeSnapshot as Array<{ id: string; data?: { label?: string }; type?: string }> | null | undefined;
    if (!snapshot) return {} as Record<string, string>;
    return Object.fromEntries(snapshot.map((n) => [n.id, n.data?.label ?? n.type ?? n.id.slice(-6)]));
  }, [run.nodeSnapshot]);

  const succeeded = run.executions.filter((e) => e.status === "success").length;

  return (
    <div className="border-b border-[#1a1a1a]">
      <div className="px-3 py-2.5 cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-[#e5e5e5]">
            Run #{run.id.slice(-4)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${runBadgeClass(run.status)}`}>
            {runBadgeLabel(run.status)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#525252]">
          <Clock size={10} />
          <span>{formatDate(run.createdAt)}</span>
          <span>·</span>
          <span>{scopeLabel(run.scope)}</span>
          <span>·</span>
          <span>{run.duration > 0 ? `${(run.duration / 1000).toFixed(1)}s` : "0.0s"}</span>
        </div>
        {run.executions.length > 0 && (
          <p className={`text-[10px] mt-1 font-medium ${run.status === "success" ? "text-[#4ade80]" : "text-[#fbbf24]"}`}>
            {succeeded} of {run.executions.length} nodes succeeded
          </p>
        )}
      </div>
      {expanded && (
        <div className="relative pl-6 pr-3 py-2">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[#2a2a2a]" />
          {run.executions.map((exec) => (
            <NodeRow key={exec.id} exec={exec} name={nodeNameMap[exec.nodeId] ?? exec.nodeType} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistorySidebar({ workflowId, onClose }: HistorySidebarProps) {
  const [runs, setRuns] = useState<WorkflowRunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchRuns() {
      try {
        const res = await fetch(`/api/workflows/${workflowId}/runs`);
        if (!res.ok) return;
        const data = (await res.json()) as { runs: WorkflowRunRecord[] };
        setRuns(data.runs);
      } catch {
        // silently ignore network errors during polling
      } finally {
        setLoading(false);
      }
    }

    fetchRuns();
    const interval = setInterval(fetchRuns, 3000);
    return () => clearInterval(interval);
  }, [workflowId]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="w-[260px] flex-none flex flex-col border-l" style={{ background: "var(--sidebar-bg)", borderColor: "var(--toolbar-border)" }}>
      <div className="h-12 flex items-center px-4 border-b" style={{ borderColor: "var(--toolbar-border)" }}>
        <span className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>Workflow History</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--input-bg)] transition-colors cursor-pointer"
          >
            <X size={13} style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : runs.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No runs yet</p>
          </div>
        ) : (
          runs.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              expanded={expandedIds.has(run.id)}
              onToggle={() => toggleExpand(run.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
