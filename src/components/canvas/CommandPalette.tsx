"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useReactFlow } from "reactflow";
import { Play, Trash2, Type, Cpu, ImagePlus, VideoIcon, Crop, Film, type LucideIcon } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow";
import { NODE_COLORS, type NodeType, type NodeData } from "@/types/workflow";

interface CommandPaletteProps {
  workflowId: string;
  onRun: () => void;
}

interface NodeDef {
  type: NodeType;
  label: string;
  icon: LucideIcon;
}

const NODE_DEFS: NodeDef[] = [
  { type: "text", label: "Text Node", icon: Type },
  { type: "llm", label: "LLM Node", icon: Cpu },
  { type: "upload-image", label: "Upload Image Node", icon: ImagePlus },
  { type: "upload-video", label: "Upload Video Node", icon: VideoIcon },
  { type: "crop-image", label: "Crop Image Node", icon: Crop },
  { type: "extract-frame", label: "Extract Frame Node", icon: Film },
];

const DEFAULT_NODE_DATA: Record<NodeType, NodeData> = {
  text: { type: "text", label: "Text", text: "" },
  llm: { type: "llm", label: "LLM", model: "gemini-1.5-flash", systemPrompt: "", result: null, streaming: false, error: null },
  "upload-image": { type: "upload-image", label: "Upload Image", imageUrl: null, fileName: null },
  "upload-video": { type: "upload-video", label: "Upload Video", videoUrl: null, fileName: null },
  "crop-image": { type: "crop-image", label: "Crop Image", xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100, outputUrl: null, error: null },
  "extract-frame": { type: "extract-frame", label: "Extract Frame", timestamp: "0", outputUrl: null, error: null },
};

export default function CommandPalette({ onRun }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);
  const clearCanvas = useWorkflowStore((s) => s.clearCanvas);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  function handleAddNode(type: NodeType) {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode({
      id: crypto.randomUUID(),
      type,
      position,
      data: DEFAULT_NODE_DATA[type],
    });
    close();
  }

  function handleRun() {
    close();
    onRun();
  }

  function handleClear() {
    clearCanvas();
    close();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <Command
        className="w-full max-w-[480px] bg-[#1a1a1a] border border-[#272727] rounded-xl shadow-2xl overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <Command.Input
          autoFocus
          placeholder="Search commands..."
          className="w-full bg-transparent text-white text-sm placeholder:text-[#525252] px-4 py-3 outline-none border-b border-[#272727]"
        />
        <Command.List className="max-h-[320px] overflow-y-auto">
          <Command.Empty className="px-4 py-6 text-sm text-[#525252] text-center">
            No commands found
          </Command.Empty>

          <Command.Group
            heading="Add Node"
            className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#525252]"
          >
            {NODE_DEFS.map(({ type, label, icon: Icon }) => (
              <Command.Item
                key={type}
                value={`add ${label}`}
                onSelect={() => handleAddNode(type)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-[#252525] aria-selected:bg-[#252525] outline-none"
              >
                <Icon size={14} style={{ color: NODE_COLORS[type] }} className="flex-none" />
                {label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Separator className="h-px bg-[#272727] my-1" />

          <Command.Group
            heading="Workflow"
            className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#525252]"
          >
            <Command.Item
              value="run workflow"
              onSelect={handleRun}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-[#252525] aria-selected:bg-[#252525] outline-none"
            >
              <Play size={14} className="flex-none text-[#7c3aed]" />
              Run Workflow
            </Command.Item>
            <Command.Item
              value="clear canvas"
              onSelect={handleClear}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-[#252525] aria-selected:bg-[#252525] outline-none"
            >
              <Trash2 size={14} className="flex-none text-[#ef4444]" />
              Clear Canvas
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
