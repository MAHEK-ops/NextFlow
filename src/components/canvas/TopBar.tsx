"use client";

import { useState, useRef, useEffect } from "react";
import {
  PanelLeft,
  Workflow,
  ChevronDown,
  Moon,
  Gem,
  Wand2,
  LayoutGrid,
  Clock,
} from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

interface TopBarProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onScheduleSave: () => void;
  saveState: SaveState;
  onToggleSidebar: () => void;
  showVersionHistory: boolean;
  onToggleVersionHistory: () => void;
}

export default function TopBar({
  workflowName,
  onWorkflowNameChange,
  onScheduleSave,
  saveState,
  onToggleSidebar,
  showVersionHistory,
  onToggleVersionHistory,
}: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="h-[52px] flex-none flex items-center justify-between px-3 bg-[#0a0a0a] border-b border-[#1a1a1a]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#525252] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          <PanelLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5 h-8 px-3 bg-[#141414] border border-[#272727] rounded-xl hover:bg-[#1a1a1a] transition-colors">
          <Workflow size={14} className="text-[#525252] flex-none" />
          <input
            type="text"
            value={workflowName}
            onChange={(e) => {
              onWorkflowNameChange(e.target.value);
              onScheduleSave();
            }}
            className="bg-transparent text-sm text-[#e5e5e5] font-medium focus:outline-none w-32 min-w-0 cursor-text"
            placeholder="Untitled"
          />
          {saveState !== "idle" && (
            <span className="text-[10px] text-[#3a3a3a] flex-none">
              {saveState === "saving" ? "saving" : "saved"}
            </span>
          )}
          <ChevronDown size={14} className="text-[#525252] flex-none" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#141414] border border-[#272727] text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          <Moon size={15} />
        </button>

        <button
          type="button"
          className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-[#141414] border border-[#272727] text-sm text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          <Gem size={14} className="text-[#525252]" />
          Share
        </button>

        <button
          type="button"
          className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-[#141414] border border-[#272727] text-sm text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          <Wand2 size={14} className="text-[#525252]" />
          Turn workflow into app
        </button>

        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center h-8 bg-[#141414] border border-[#272727] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={onToggleVersionHistory}
              className="w-8 h-8 flex items-center justify-center border-r border-[#272727] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              {showVersionHistory ? (
                <Clock size={15} className="text-white" />
              ) : (
                <LayoutGrid size={15} className="text-[#e5e5e5]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-6 h-8 flex items-center justify-center text-[#525252] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute top-10 right-0 z-50 bg-[#141414] border border-[#272727] rounded-xl p-1 shadow-xl min-w-[200px]">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1f1f1f] cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <LayoutGrid size={14} className="text-[#525252]" />
                  <span className="text-sm text-[#e5e5e5] ml-2">Assets</span>
                </div>
                <span className="text-xs text-[#525252] font-mono">⌥⌘A</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleVersionHistory();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1f1f1f] cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <Clock size={14} className="text-[#525252]" />
                  <span className="text-sm text-[#e5e5e5] ml-2">Version History</span>
                </div>
                <span className="text-xs text-[#525252] font-mono">⌥⌘S</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
