"use client";

import {
  Command,
  RotateCcw,
  RotateCw,
  Plus,
  MousePointer2,
  Hand,
  Scissors,
  Sparkles,
  Link2,
  Map,
} from "lucide-react";
import { useWorkflowStore } from "@/store/workflow";

export type ActiveTool = "select" | "pan";

interface Props {
  activeTool: ActiveTool;
  setActiveTool: (t: ActiveTool) => void;
  showMinimap: boolean;
  setShowMinimap: (v: boolean) => void;
  onOpenShortcuts: () => void;
  showNodePicker: boolean;
  onToggleNodePicker: () => void;
}

const iconBtn = "w-10 h-10 flex items-center justify-center rounded-xl text-[#999999] hover:text-[#cccccc] hover:bg-[var(--input-bg)] transition-colors cursor-pointer";
const activeIconBtn = "w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--input-bg)] text-white transition-colors cursor-pointer";
const borderedBtn = "w-9 h-9 flex items-center justify-center rounded-xl border border-[#333333] bg-[var(--toolbar-bg)] text-[#aaaaaa] hover:text-[#e5e5e5] hover:bg-[var(--input-bg)] transition-colors cursor-pointer";
const shortcutsBtn = "h-9 px-3 flex items-center gap-1.5 rounded-xl border border-[#333333] bg-[var(--toolbar-bg)] text-[#aaaaaa] hover:text-[#e5e5e5] hover:bg-[var(--input-bg)] text-xs transition-colors cursor-pointer";

function Tip({ label, keys }: { label: string; keys?: string[] }) {
  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap hidden group-hover:flex pointer-events-none z-50">
      <div className="bg-[#e5e5e5] text-[#111111] text-xs rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 font-medium shadow-lg">
        {label}
        {keys?.map((k) => (
          <span key={k} className="bg-[#c5c5c5] text-[#111111] text-xs rounded px-1.5 py-0.5 font-mono font-semibold">{k}</span>
        ))}
      </div>
    </div>
  );
}

export default function CanvasToolbar({
  activeTool, setActiveTool, showMinimap, setShowMinimap,
  onOpenShortcuts, showNodePicker, onToggleNodePicker,
}: Props) {
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);

  return (
    <>
      <div className="absolute bottom-6 left-4 z-10 flex items-center gap-2">
        <button type="button" onClick={undo} className={borderedBtn} title="Undo">
          <RotateCcw size={16} />
        </button>
        <button type="button" onClick={redo} className={borderedBtn} title="Redo">
          <RotateCw size={16} />
        </button>
        <button type="button" onClick={onOpenShortcuts} className={shortcutsBtn}>
          <Command size={13} />
          <span>Keyboard shortcuts</span>
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="border rounded-2xl px-3 py-2 flex items-center gap-1 shadow-xl" style={{ background: "var(--toolbar-bg)", borderColor: "var(--toolbar-border)" }}>
          <div className="relative group">
            <button type="button" onClick={onToggleNodePicker} className={showNodePicker ? activeIconBtn : iconBtn}>
              <Plus size={18} />
            </button>
            <Tip label="New Node" keys={["N"]} />
          </div>
          <div className="relative group">
            <button type="button" onClick={() => setActiveTool("select")} className={activeTool === "select" ? activeIconBtn : iconBtn}>
              <MousePointer2 size={18} />
            </button>
            <Tip label="Draw Selection" keys={["Cmd", "Drag"]} />
          </div>
          <div className="relative group">
            <button type="button" onClick={() => setActiveTool("pan")} className={activeTool === "pan" ? activeIconBtn : iconBtn}>
              <Hand size={18} />
            </button>
            <Tip label="Pan" keys={["Space", "Drag"]} />
          </div>
          <div className="relative group">
            <button type="button" className={iconBtn}><Scissors size={18} /></button>
            <Tip label="Cut Connections" keys={["X", "Drag"]} />
          </div>
          <div className="relative group">
            <button type="button" className={iconBtn}><Sparkles size={18} /></button>
            <Tip label="Agent" keys={["Cmd", "I"]} />
          </div>
          <div className="relative group">
            <button type="button" className={iconBtn}><Link2 size={18} /></button>
            <Tip label="Presets" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-4 z-10">
        <button type="button" onClick={() => setShowMinimap(!showMinimap)} className={showMinimap ? activeIconBtn : iconBtn}>
          <Map size={18} />
        </button>
      </div>
    </>
  );
}
