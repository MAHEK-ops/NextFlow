"use client";

import type { RunStatus, RunScope } from "@/types/workflow";

const MOCK_RUNS = [
  { id: "1", number: 1, status: "success", duration: 1240, scope: "full", createdAt: "2 min ago" },
  { id: "2", number: 2, status: "failed", duration: 830, scope: "full", createdAt: "10 min ago" },
  { id: "3", number: 3, status: "partial", duration: 2100, scope: "partial", createdAt: "1 hr ago" },
] as const;

type MockRun = (typeof MOCK_RUNS)[number];

const STATUS_STYLES: Record<RunStatus, { bg: string; text: string; label: string }> = {
  success: { bg: "#14532d", text: "#4ade80", label: "Success" },
  failed: { bg: "#450a0a", text: "#f87171", label: "Failed" },
  partial: { bg: "#422006", text: "#facc15", label: "Partial" },
  running: { bg: "#2e1065", text: "#a78bfa", label: "Running" },
};

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function StatusBadge({ status }: { status: RunStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="text-[11px] font-medium px-1.5 py-0.5 rounded"
      style={{ background: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function ScopeBadge({ scope }: { scope: RunScope }) {
  const labels: Record<RunScope, string> = {
    full: "Full",
    partial: "Partial",
    single: "Single",
  };
  return <span className="text-xs text-[#525252]">{labels[scope]}</span>;
}

function RunEntry({ run }: { run: MockRun }) {
  return (
    <div className="w-full bg-[#1a1a1a] hover:bg-[#1f1f1f] rounded-md p-3 cursor-pointer transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-white font-medium">#{run.number}</span>
        <StatusBadge status={run.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#525252]">{formatDuration(run.duration)}</span>
          <ScopeBadge scope={run.scope} />
        </div>
        <span className="text-xs text-[#525252]">{run.createdAt}</span>
      </div>
    </div>
  );
}

export default function HistorySidebar() {
  const runs: MockRun[] = [...MOCK_RUNS];

  return (
    <aside className="w-[260px] flex-none flex flex-col bg-[#111111] border-l border-[#1f1f1f]">
      <p className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
        History
      </p>
      <div className="border-b border-[#1f1f1f]" />
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {runs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[#525252]">No runs yet</p>
          </div>
        ) : (
          runs.map((run) => <RunEntry key={run.id} run={run} />)
        )}
      </div>
    </aside>
  );
}
