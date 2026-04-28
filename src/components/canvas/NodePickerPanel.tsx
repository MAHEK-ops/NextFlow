"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ChevronRight,
  Type,
  Image,
  Video,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useReactFlow } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import { DEFAULT_NODE_DATA } from "@/lib/node-defaults";
import type { NodeType, WorkflowNode } from "@/types/workflow";

interface NodeItem {
  type: NodeType;
  label: string;
}

interface Category {
  label: string;
  icon: LucideIcon;
  items: NodeItem[];
}

const CATEGORIES: Category[] = [
  { label: "Text", icon: Type, items: [{ type: "text", label: "Text Node" }] },
  {
    label: "Image",
    icon: Image,
    items: [
      { type: "upload-image", label: "Upload Image" },
      { type: "crop-image", label: "Crop Image" },
    ],
  },
  {
    label: "Video",
    icon: Video,
    items: [
      { type: "upload-video", label: "Upload Video" },
      { type: "extract-frame", label: "Extract Frame" },
    ],
  },
  { label: "AI", icon: Sparkles, items: [{ type: "llm", label: "LLM Node" }] },
];

interface Props {
  onClose: () => void;
}

export default function NodePickerPanel({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);

  const addNodeAtCenter = useCallback(
    (nodeType: NodeType) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        position,
        data: DEFAULT_NODE_DATA[nodeType],
      };
      addNode(newNode);
      onClose();
    },
    [addNode, screenToFlowPosition, onClose]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.toLowerCase();
  const filtered = CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => item.label.toLowerCase().includes(q)),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div ref={panelRef} className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
      <div className="rounded-2xl overflow-hidden shadow-2xl w-[280px] max-h-[480px] flex flex-col border" style={{ background: "var(--toolbar-bg)", borderColor: "var(--toolbar-border)" }}>
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl px-3 h-9 border" style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}>
            <Search size={14} className="flex-none" style={{ color: "var(--text-muted)" }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes or models..."
              className="bg-transparent text-sm outline-none flex-1"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pb-2">
          {filtered.map((cat) => (
            <div key={cat.label}>
              <div className="flex items-center gap-2 px-3 py-2 mt-1">
                <cat.icon size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{cat.label}</span>
              </div>
              {cat.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addNodeAtCenter(item.type)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--input-bg)] cursor-pointer transition-colors mx-1 rounded-xl"
                  style={{ width: "calc(100% - 8px)", color: "var(--text-primary)" }}
                >
                  <span className="text-sm">{item.label}</span>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No results</p>
          )}
        </div>
      </div>
    </div>
  );
}
