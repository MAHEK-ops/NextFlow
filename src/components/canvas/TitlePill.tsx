"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={ref}>

      {/* PILL */}
      <div
        className="
          flex items-center gap-2
          h-11 px-4
          rounded-full
          bg-[#1a1a1a]/80
          backdrop-blur-md
          border border-[#2a2a2a]
          shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
          hover:bg-[#202020]
          transition-all
        "
      >
        {/* KREA ICON */}
        <div className="flex items-center justify-center w-6 h-6 text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.34 1.266c1.766-.124 3.324 1.105 3.551 2.802.216 1.612-.887 3.171-2.545 3.536-.415.092-.877.066-1.317.122a4.63 4.63 0 0 0-2.748 1.34l-.008.004-.01-.001-.006-.005-.003-.009q0-.009.005-.016a.04.04 0 0 0 .007-.022 438 438 0 0 1-.01-4.541c.003-1.68 1.33-3.086 3.085-3.21" />
            <path d="M8.526 15.305c-2.247-.018-3.858-2.23-3.076-4.3a3.31 3.31 0 0 1 2.757-2.11c.384-.04.845-.03 1.215-.098 1.9-.353 3.368-1.806 3.665-3.657.066-.41.031-.9.128-1.335.449-2.016 2.759-3.147 4.699-2.236 1.011.476 1.69 1.374 1.857 2.447q.051.33.034.818c-.22 5.842-5.21 10.519-11.279 10.47m2.831.93a.04.04 0 0 1-.021-.02l-.001-.006.002-.006q0-.003.003-.004l.006-.003q3.458-.792 5.992-3.185.045-.042.083.007c.27.357.554.74.78 1.106a10.6 10.6 0 0 1 1.585 4.89q.037.53.023.819c-.084 1.705-1.51 3.08-3.31 3.09-1.592.01-2.992-1.077-3.294-2.597-.072-.36-.05-.858-.11-1.238q-.282-1.755-1.715-2.84zm-3.369 6.64c-1.353-.235-2.441-1.286-2.684-2.593a5 5 0 0 1-.05-.817V15.14q0-.021.016-.007c.884.786 1.814 1.266 3.028 1.346l.326.01c1.581.051 2.92 1.087 3.229 2.592.457 2.225-1.557 4.195-3.865 3.793" />
          </svg>
        </div>

        {/* CHEVRON BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen((prev) => !prev);
          }}
          className="ml-1 flex items-center justify-center"
        >
          <ChevronDown size={16} className="text-[#8a8a8a]" />
        </button>

        {/* TITLE */}
        {isEditingName ? (
          <input
            autoFocus
            type="text"
            value={workflowName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              onWorkflowNameChange(e.target.value);
              onScheduleSave();
            }}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditingName(false);
            }}
            className="bg-transparent text-sm font-medium outline-none w-36 text-white"
          />
        ) : (
          <span
            className="text-sm font-medium text-white truncate max-w-[140px] cursor-text"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
              setDropdownOpen(false);
            }}
          >
            {workflowName || "Untitled"}
          </span>
        )}

        {/* SAVE STATE */}
        {saveState !== "idle" && (
          <span className="text-[10px] text-[#6b6b6b]">
            {saveState === "saving" ? "saving" : "saved"}
          </span>
        )}

      </div>

      {/* DROPDOWN */}
      {dropdownOpen && (
        <div className="absolute top-12 left-0 z-50">
          <TitleDropdown
            onClose={() => setDropdownOpen(false)}
            onImport={onImport}
            onExport={onExport}
          />
        </div>
      )}
    </div>
  );
}