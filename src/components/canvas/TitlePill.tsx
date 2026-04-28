"use client";

import { useState, useRef, useEffect } from "react";
import { Workflow, ChevronDown } from "lucide-react";
import TitleDropdown from "./TitleDropdown";

type SaveState = "idle" | "saving" | "saved";

interface TitlePillProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onScheduleSave: () => void;
  saveState: SaveState;
  onImport: () => void;
  onExport: () => void;
}

export default function TitlePill({
  workflowName,
  onWorkflowNameChange,
  onScheduleSave,
  saveState,
  onImport,
  onExport,
}: TitlePillProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-2xl transition-colors hover:bg-[var(--input-bg)] border"
        style={{ background: "var(--toolbar-bg)", borderColor: "var(--toolbar-border)" }}
      >
        <div className="w-5 h-5 rounded-md bg-[#3b5bdb] flex items-center justify-center flex-none">
          <Workflow size={12} className="text-white" />
        </div>
        {isEditingName ? (
          <input
            autoFocus
            type="text"
            value={workflowName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { onWorkflowNameChange(e.target.value); onScheduleSave(); }}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => { if (e.key === "Enter") setIsEditingName(false); }}
            className="bg-transparent text-sm font-medium focus:outline-none w-32 min-w-0 cursor-text"
            style={{ color: "var(--text-primary)" }}
          />
        ) : (
          <span
            className="text-sm font-medium w-32 min-w-0 truncate text-left"
            style={{ color: "var(--text-primary)" }}
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditingName(true); setDropdownOpen(false); }}
          >
            {workflowName || "Untitled"}
          </span>
        )}
        {saveState !== "idle" && (
          <span className="text-[10px] flex-none" style={{ color: "var(--text-faint)" }}>
            {saveState === "saving" ? "saving" : "saved"}
          </span>
        )}
        <ChevronDown size={14} className="flex-none" style={{ color: "var(--text-muted)" }} />
      </button>
      {dropdownOpen && (
        <TitleDropdown
          onClose={() => setDropdownOpen(false)}
          onImport={onImport}
          onExport={onExport}
        />
      )}
    </div>
  );
}
