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

  const btn = "rounded-lg bg-[#141414]/90 backdrop-blur-sm border border-[#272727] text-[#e5e5e5] hover:bg-[#1a1a1a]/90 transition-colors";

  return (
    <>
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`w-8 h-8 flex items-center justify-center ${btn}`}
      >
        {mounted ? (theme === "dark" ? <Moon size={15} /> : <Sun size={15} />) : <Moon size={15} />}
      </button>

      <button type="button" className={`h-8 px-3 flex items-center gap-1.5 text-sm ${btn}`}>
        <Gem size={14} className="text-[#525252]" />
        Share
      </button>

      <button type="button" className={`h-8 px-3 flex items-center gap-1.5 text-sm ${btn}`}>
        <Hammer size={14} className="text-[#525252]" />
        Turn workflow into app
      </button>

      <div className="relative" ref={dropdownRef}>
        <div className={`flex items-center h-8 ${btn} overflow-hidden`}>
          <button
            type="button"
            onClick={onToggleVersionHistory}
            className="w-8 h-8 flex items-center justify-center border-r border-[#272727] hover:bg-[#1a1a1a]/90 transition-colors"
          >
            {showVersionHistory ? <Clock size={15} className="text-white" /> : <Image size={15} className="text-[#e5e5e5]" />}
          </button>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-6 h-8 flex items-center justify-center text-[#525252] hover:bg-[#1a1a1a]/90 transition-colors"
          >
            <ChevronDown size={13} />
          </button>
        </div>

        {dropdownOpen && (
          <div className="absolute top-10 right-0 z-50 bg-[#141414] border border-[#272727] rounded-xl p-1 shadow-xl min-w-[200px]">
            <button
              type="button"
              onClick={() => { onOpenAssets(); setDropdownOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Image size={14} className="text-[#525252]" />
                <span className="text-sm text-[#e5e5e5]">Assets</span>
              </div>
              <span className="text-xs text-[#525252] font-mono">⌥⌘A</span>
            </button>
            <button
              type="button"
              onClick={() => { onToggleVersionHistory(); setDropdownOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#525252]" />
                <span className="text-sm text-[#e5e5e5]">Workflow History</span>
              </div>
              <span className="text-xs text-[#525252] font-mono">⌥⌘S</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
