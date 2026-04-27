"use client";

import {
  Command,
  RotateCcw,
  RotateCw,
  ZoomIn,
  MousePointer2,
  Hand,
  Scissors,
  Asterisk,
  Link2,
  Map,
} from "lucide-react";
import { useReactFlow } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import { useUser } from "@clerk/nextjs";

export type ActiveTool = "select" | "pan";

interface Props {
  activeTool: ActiveTool;
  setActiveTool: (t: ActiveTool) => void;
  showMinimap: boolean;
  setShowMinimap: (v: boolean) => void;
  onOpenShortcuts: () => void;
}

const iconBtn =
  "w-8 h-8 flex items-center justify-center rounded-xl text-[#525252] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors cursor-pointer";
const activeIconBtn =
  "w-8 h-8 flex items-center justify-center rounded-xl bg-[#272727] text-[#e5e5e5] transition-colors cursor-pointer";
const leftBtn =
  "h-8 px-2 flex items-center gap-1.5 rounded-lg text-[#525252] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] text-xs transition-colors cursor-pointer";

export default function CanvasToolbar({
  activeTool,
  setActiveTool,
  showMinimap,
  setShowMinimap,
  onOpenShortcuts,
}: Props) {
  const { zoomIn } = useReactFlow();
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const { user } = useUser();

  const avatarLetter = (
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "U"
  ).toUpperCase();

  return (
    <>
      <div className="absolute bottom-6 left-4 z-10 flex items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center text-xs text-white font-medium select-none">
          {avatarLetter}
        </div>
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
          <button type="button" onClick={() => zoomIn()} className={iconBtn} title="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool("select")}
            className={activeTool === "select" ? activeIconBtn : iconBtn}
            title="Select"
          >
            <MousePointer2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool("pan")}
            className={activeTool === "pan" ? activeIconBtn : iconBtn}
            title="Pan"
          >
            <Hand size={16} />
          </button>
          <button type="button" className={iconBtn} title="Scissors">
            <Scissors size={16} />
          </button>
          <button type="button" className={iconBtn} title="Multi-select">
            <Asterisk size={16} />
          </button>
          <button type="button" className={iconBtn} title="Connect">
            <Link2 size={16} />
          </button>
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
