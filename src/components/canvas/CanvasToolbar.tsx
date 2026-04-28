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

const iconBtn =
  "w-8 h-8 flex items-center justify-center rounded-xl text-[#525252] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer";
const activeIconBtn =
  "w-8 h-8 flex items-center justify-center rounded-xl bg-[#272727] text-[#e5e5e5] transition-colors cursor-pointer";
const leftBtn =
  "h-8 px-2 flex items-center gap-1.5 rounded-lg text-[#525252] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] text-xs transition-colors cursor-pointer";

function Tip({ label, keys }: { label: string; keys?: string[] }) {
  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap hidden group-hover:flex pointer-events-none z-50">
      <div className="bg-[#e5e5e5] text-[#111111] text-xs rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 font-medium shadow-lg">
        {label}
        {keys?.map((k) => (
          <span key={k} className="bg-[#c5c5c5] text-[#111111] text-xs rounded px-1.5 py-0.5 font-mono font-semibold">
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CanvasToolbar({
  activeTool,
  setActiveTool,
  showMinimap,
  setShowMinimap,
  onOpenShortcuts,
  showNodePicker,
  onToggleNodePicker,
}: Props) {
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);

  return (
    <>
      <div className="absolute bottom-6 left-4 z-10 flex items-center gap-1">
        <button type="button" onClick={undo} className={leftBtn} title="Undo">
          <RotateCcw size={16} />
        </button>
        <button type="button" onClick={redo} className={leftBtn} title="Redo">
          <RotateCw size={16} />
        </button>
        <button type="button" onClick={onOpenShortcuts} className={leftBtn}>
          <Command size={14} />
          <span>Keyboard shortcuts</span>
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-[#141414] border border-[#272727] rounded-2xl px-2 py-1.5 flex items-center gap-0.5 shadow-xl">
          <div className="relative group">
            <button
              type="button"
              onClick={onToggleNodePicker}
              className={showNodePicker ? activeIconBtn : iconBtn}
            >
              <Plus size={16} />
            </button>
            <Tip label="New Node" keys={["N"]} />
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => setActiveTool("select")}
              className={activeTool === "select" ? activeIconBtn : iconBtn}
            >
              <MousePointer2 size={16} />
            </button>
            <Tip label="Draw Selection" keys={["Cmd", "Drag"]} />
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => setActiveTool("pan")}
              className={activeTool === "pan" ? activeIconBtn : iconBtn}
            >
              <Hand size={16} />
            </button>
            <Tip label="Pan" keys={["Space", "Drag"]} />
          </div>

          <div className="relative group">
            <button type="button" className={iconBtn}>
              <Scissors size={16} />
            </button>
            <Tip label="Cut Connections" keys={["X", "Drag"]} />
          </div>

          <div className="relative group">
            <button type="button" className={iconBtn}>
              <Sparkles size={16} />
            </button>
            <Tip label="Agent" keys={["Cmd", "I"]} />
          </div>

          <div className="relative group">
            <button type="button" className={iconBtn}>
              <Link2 size={16} />
            </button>
            <Tip label="Presets" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-4 z-10">
        <button
          type="button"
          onClick={() => setShowMinimap(!showMinimap)}
          title="Toggle minimap"
          className={showMinimap ? activeIconBtn : iconBtn}
        >
          <Map size={16} />
        </button>
      </div>
    </>
  );
}
