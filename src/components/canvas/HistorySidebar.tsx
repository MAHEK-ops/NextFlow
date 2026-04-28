"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronRight, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { WorkflowRunRecord, RunStatus, RunScope, NodeExecutionRecord } from "@/types/workflow";

interface HistorySidebarProps {
  workflowId: string;
  onClose?: () => void;
}

const STATUS_STYLES: Record<RunStatus, { bg: string; text: string; label: string }> = {
  success: { bg: "#14532d", text: "#4ade80", label: "Success" },
  failed: { bg: "#450a0a", text: "#f87171", label: "Failed" },
  partial: { bg: "#422006", text: "#facc15", label: "Partial" },
  running: { bg: "#2e1065", text: "#a78bfa", label: "Running" },
};

const SCOPE_LABELS: Record<RunScope, string> = {
  full: "Full",
  partial: "Partial",
  single: "Single",
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status as RunStatus] ?? STATUS_STYLES.failed;
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function StatusBadge({ status }: { status: string }) {
  const style = getStatusStyle(status);
  return (
    <span
      className="text-[11px] font-medium px-1.5 py-0.5 rounded"
      style={{ background: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function NodeEntry({ exec }: { exec: NodeExecutionRecord }) {
  return (
    <div className="ml-2 pl-2 border-l border-[#2a2a2a] py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#a3a3a3] truncate">{exec.nodeType}</span>
        <StatusBadge status={exec.status} />
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[11px] text-[#525252]">{formatDuration(exec.duration)}</span>
        {exec.error && (
          <span className="text-[11px] text-[#f87171] truncate">{exec.error}</span>
        )}
      </div>
    </div>
  );
}

function RunEntry({
  run,
  index,
  expanded,
  onToggle,
}: {
  run: WorkflowRunRecord;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Chevron = expanded ? ChevronDown : ChevronRight;
  const timestamp = formatDistanceToNow(new Date(run.createdAt), { addSuffix: true });

  return (
    <div className="w-full bg-[#1a1a1a] rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-[#1f1f1f] transition-colors"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Chevron className="w-3 h-3 text-[#525252] flex-none" />
            <span className="text-sm text-white font-medium">#{index + 1}</span>
          </div>
          <StatusBadge status={run.status} />
        </div>
        <div className="flex items-center justify-between pl-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#525252]">{formatDuration(run.duration)}</span>
            <span className="text-xs text-[#525252]">{SCOPE_LABELS[run.scope]}</span>
          </div>
          <span className="text-xs text-[#525252]">{timestamp}</span>
        </div>
      </button>

      {expanded && run.executions.length > 0 && (
        <div className="px-3 pb-3 flex flex-col gap-1">
          {run.executions.map((exec) => (
            <NodeEntry key={exec.id} exec={exec} />
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <aside className="w-[260px] flex-none flex flex-col bg-[#111111] border-l border-[#1f1f1f]">
      <div className="h-12 flex items-center px-4 border-b border-[#1f1f1f]">
        <span className="text-sm font-medium text-[#e5e5e5] flex-1">Workflow History</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X size={13} className="text-[#525252]" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-[#525252] animate-spin" />
          </div>
        ) : runs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[#525252]">No runs yet</p>
          </div>
        ) : (
          runs.map((run, i) => (
            <RunEntry
              key={run.id}
              run={run}
              index={runs.length - 1 - i}
              expanded={expandedIds.has(run.id)}
              onToggle={() => toggleExpand(run.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
