"use client";

import { useState, useRef, useEffect } from "react";
import {
  PanelLeft,
  Workflow,
  ChevronDown,
  Moon,
  Sun,
  Gem,
  Hammer,
  Image,
  Clock,
} from "lucide-react";
import { useTheme } from "next-themes";
import TitleDropdown from "./TitleDropdown";

type SaveState = "idle" | "saving" | "saved";

interface TopBarProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onScheduleSave: () => void;
  saveState: SaveState;
  onToggleSidebar: () => void;
  showVersionHistory: boolean;
  onToggleVersionHistory: () => void;
  onOpenAssets: () => void;
  onImport: () => void;
  onExport: () => void;
}

export default function TopBar({
  workflowName,
  onWorkflowNameChange,
  onScheduleSave,
  saveState,
  onToggleSidebar,
  showVersionHistory,
  onToggleVersionHistory,
  onOpenAssets,
  onImport,
  onExport,
}: TopBarProps) {
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [titleDropdownOpen, setTitleDropdownOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!titleDropdownOpen) return;
    function handler(e: MouseEvent) {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(e.target as Node))
        setTitleDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [titleDropdownOpen]);

  return (
    <div className="h-[52px] flex-none flex items-center justify-between px-3 border-b" style={{ background: "var(--topbar-bg)", borderColor: "var(--topbar-border)" }}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#525252] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          <PanelLeft size={16} />
        </button>

        <div className="relative" ref={titleDropdownRef}>
          <button
            type="button"
            onClick={() => setTitleDropdownOpen(!titleDropdownOpen)}
            className="flex items-center gap-1.5 h-8 px-3 bg-[#141414] border border-[#272727] rounded-xl hover:bg-[#1a1a1a] transition-colors"
          >
            <Workflow size={14} className="text-[#525252] flex-none" />
            {isEditingName ? (
              <input
                autoFocus
                type="text"
                value={workflowName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { onWorkflowNameChange(e.target.value); onScheduleSave(); }}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setIsEditingName(false); }}
                className="bg-transparent text-sm text-[#e5e5e5] font-medium focus:outline-none w-32 min-w-0 cursor-text"
              />
            ) : (
              <span
                className="text-sm text-[#e5e5e5] font-medium w-32 min-w-0 truncate text-left"
                onDoubleClick={(e) => { e.stopPropagation(); setIsEditingName(true); setTitleDropdownOpen(false); }}
              >
                {workflowName || "Untitled"}
              </span>
            )}
            {saveState !== "idle" && (
              <span className="text-[10px] text-[#3a3a3a] flex-none">
                {saveState === "saving" ? "saving" : "saved"}
              </span>
            )}
            <ChevronDown size={14} className="text-[#525252] flex-none" />
          </button>
          {titleDropdownOpen && (
            <TitleDropdown
              onClose={() => setTitleDropdownOpen(false)}
              onImport={onImport}
              onExport={onExport}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#141414] border border-[#272727] text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          {mounted ? (theme === "dark" ? <Moon size={15} /> : <Sun size={15} />) : <Moon size={15} />}
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
          <Hammer size={14} className="text-[#525252]" />
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
                <Image size={15} className="text-[#e5e5e5]" />
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
                onClick={() => { onOpenAssets(); setDropdownOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1f1f1f] cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <Image size={14} className="text-[#525252]" />
                  <span className="text-sm text-[#e5e5e5] ml-2">Assets</span>
                </div>
                <span className="text-xs text-[#525252] font-mono">⌥⌘A</span>
              </button>
              <button
                type="button"
                onClick={() => { onToggleVersionHistory(); setDropdownOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1f1f1f] cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <Clock size={14} className="text-[#525252]" />
                  <span className="text-sm text-[#e5e5e5] ml-2">Workflow History</span>
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
