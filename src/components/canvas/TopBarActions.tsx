"use client";

import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Gem, Hammer, Image, Clock, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";

interface TopBarActionsProps {
  showVersionHistory: boolean;
  onToggleVersionHistory: () => void;
  onOpenAssets: () => void;
}

export default function TopBarActions({
  showVersionHistory,
  onToggleVersionHistory,
  onOpenAssets,
}: TopBarActionsProps) {
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const btn = "rounded-lg border transition-colors";
  const btnStyle = { background: "var(--topbar-bg)", borderColor: "var(--toolbar-border)", color: "var(--text-primary)" };
  const hoverCls = "hover:bg-[var(--input-bg)]";

  return (
    <>
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`w-8 h-8 flex items-center justify-center ${btn} ${hoverCls}`}
        style={btnStyle}
      >
        {mounted ? (theme === "dark" ? <Moon size={15} className="icon-filled" /> : <Sun size={15} className="icon-filled" />) : <Moon size={15} className="icon-filled" />}
      </button>

      <button type="button" className={`h-8 px-3 flex items-center gap-1.5 text-sm ${btn} ${hoverCls}`} style={btnStyle}>
        <Gem size={14} style={{ color: "var(--text-muted)" }} />
        Share
      </button>

      <button type="button" className={`h-8 px-3 flex items-center gap-1.5 text-sm ${btn} ${hoverCls}`} style={btnStyle}>
        <Hammer size={14} style={{ color: "var(--text-muted)" }} />
        Turn workflow into app
      </button>

      <div className="relative" ref={dropdownRef}>
        <div className={`flex items-center h-8 ${btn} overflow-hidden`} style={btnStyle}>
          <button
            type="button"
            onClick={onToggleVersionHistory}
            className={`w-8 h-8 flex items-center justify-center border-r ${hoverCls} transition-colors`}
            style={{ borderColor: "var(--toolbar-border)" }}
          >
            {showVersionHistory
              ? <Clock size={15} style={{ color: "var(--text-primary)" }} />
              : <Image size={15} style={{ color: "var(--text-primary)" }} />}
          </button>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-6 h-8 flex items-center justify-center ${hoverCls} transition-colors`}
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronDown size={13} />
          </button>
        </div>

        {dropdownOpen && (
          <div className="absolute top-10 right-0 z-50 rounded-xl p-1 shadow-xl min-w-[200px] border" style={{ background: "var(--topbar-bg)", borderColor: "var(--toolbar-border)" }}>
            <button
              type="button"
              onClick={() => { onOpenAssets(); setDropdownOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${hoverCls} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Image size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>Assets</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>⌥⌘A</span>
            </button>
            <button
              type="button"
              onClick={() => { onToggleVersionHistory(); setDropdownOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${hoverCls} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>Workflow History</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>⌥⌘S</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
