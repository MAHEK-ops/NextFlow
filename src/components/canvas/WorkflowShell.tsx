"use client";

import NodeSidebar from "./NodeSidebar";
import WorkflowCanvas from "./WorkflowCanvas";
import HistorySidebar from "./HistorySidebar";

interface WorkflowShellProps {
  initialName: string;
}

export default function WorkflowShell({ initialName }: WorkflowShellProps) {
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
          className="px-3 py-1.5 bg-[#6d28d9] hover:bg-[#7c3aed] text-white text-sm font-medium rounded-md transition-colors"
        >
          Run
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar />
        <WorkflowCanvas />
        <HistorySidebar />
      </div>
    </div>
  );
}
