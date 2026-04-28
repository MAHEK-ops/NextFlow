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
          draggable={false}
          className="nodrag nopan w-full min-h-[80px] resize-y text-sm focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] rounded-xl p-2 border placeholder:text-[var(--text-muted)]"
          style={{ background: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--input-border)" }}
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
        style={{ background: HC.text, borderColor: "var(--node-bg)", width: 12, height: 12, border: "2px solid var(--node-bg)" }}
      />
    </NodeWrapper>
  );
}

export default memo(TextNode);
