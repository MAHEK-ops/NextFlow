"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type ShortcutRow = { action: string; keys: string[] };
type Section = { title: string; shortcuts: ShortcutRow[] };

const SECTIONS: Section[] = [
  {
    title: "General",
    shortcuts: [
      { action: "Undo", keys: ["Cmd", "Z"] },
      { action: "Redo", keys: ["Cmd", "Shift", "Z"] },
      { action: "Save", keys: ["Cmd", "S"] },
      { action: "Select all", keys: ["Cmd", "A"] },
      { action: "Deselect all", keys: ["Esc"] },
      { action: "Multi-select", keys: ["Shift", "Click"] },
      { action: "Pan canvas", keys: ["Space", "Drag"] },
      { action: "Cut edges (Scissor)", keys: ["X", "Drag"] },
    ],
  },
  {
    title: "Node Creation",
    shortcuts: [
      { action: "New node", keys: ["T"] },
      { action: "Image node", keys: ["I"] },
      { action: "Video node", keys: ["V"] },
      { action: "LLM node", keys: ["L"] },
      { action: "Crop image node", keys: ["C"] },
      { action: "Extract frame node", keys: ["E"] },
    ],
  },
  {
    title: "Node Operations",
    shortcuts: [
      { action: "Duplicate", keys: ["Cmd", "D"] },
      { action: "Delete", keys: ["Delete"] },
    ],
  },
  {
    title: "Execution",
    shortcuts: [{ action: "Run workflow", keys: ["Cmd", "Enter"] }],
  },
  {
    title: "View",
    shortcuts: [
      { action: "Zoom in", keys: ["+"] },
      { action: "Zoom out", keys: ["-"] },
    ],
  },
];

export default function KeyboardShortcutsModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-[#111111] border border-[#272727] rounded-2xl p-8 w-[520px] max-h-[85vh] overflow-y-auto shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center hover:bg-[#272727] transition-colors cursor-pointer"
        >
          <X size={14} className="text-[#737373]" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-1">Keyboard Shortcuts</h2>
        <p className="text-sm text-[#525252] mb-8">
          Quickly navigate and create with these shortcuts.
        </p>

        {SECTIONS.map((section, i) => (
          <div key={section.title}>
            <h3 className={`text-sm font-semibold text-white mb-3${i > 0 ? " mt-6" : ""}`}>
              {section.title}
            </h3>
            {section.shortcuts.map((row) => (
              <div key={row.action} className="flex justify-between items-center py-1.5">
                <span className="text-sm text-[#737373]">{row.action}</span>
                <div className="flex items-center gap-1">
                  {row.keys.map((key) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-xs text-[#e5e5e5] font-mono"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
