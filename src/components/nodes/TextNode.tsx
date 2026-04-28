"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { TextNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;

function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected}>
      <div className="px-3 py-2.5">
        <textarea
          className="nodrag w-full min-h-[80px] resize-y bg-[#1a1a1a] text-[#e5e5e5] text-sm border border-[#272727] focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] rounded-xl p-2 placeholder:text-[#525252]"
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
        style={{ background: HC.text, borderColor: "#1a1a1a", width: 12, height: 12, border: "2px solid #1a1a1a" }}
      />
    </NodeWrapper>
  );
}

export default memo(TextNode);
