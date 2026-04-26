"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Type } from "lucide-react";
import { NODE_COLORS } from "@/types/workflow";
import type { TextNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";

const ACCENT = NODE_COLORS.text;

function TextNode({ id, data }: NodeProps<TextNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <div className="min-w-[240px] bg-[#1a1a1a] border border-[#272727] rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderLeft: `4px solid ${ACCENT}` }}
      >
        <Type size={13} style={{ color: ACCENT }} className="flex-none" />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>

      <div className="px-3 pb-3 pt-2">
        <textarea
          className="nodrag w-full min-h-[80px] resize-y bg-[#111111] text-white text-sm border border-[#272727] focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] rounded p-2 placeholder:text-[#525252]"
          placeholder="Enter text..."
          value={data.text}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        data-handletype="text"
      />
    </div>
  );
}

export default memo(TextNode);
