"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import { GEMINI_MODELS } from "@/types/workflow";
import type { LLMNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;

const HS = { width: 12, height: 12, border: "2px solid #1a1a1a" };

function LLMNode({ id, data, selected }: NodeProps<LLMNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected} minWidth={280}>
      <div className="relative">
        <Handle type="target" position={Position.Left} id="system_prompt" data-handletype="text"
          style={{ ...HS, background: HC.text, borderColor: "#1a1a1a", top: 18 }} />
        <Handle type="target" position={Position.Left} id="user_message" data-handletype="text"
          style={{ ...HS, background: HC.text, borderColor: "#1a1a1a", top: 54 }} />
        <Handle type="target" position={Position.Left} id="images" data-handletype="image"
          style={{ ...HS, background: HC.image, borderColor: "#1a1a1a", top: 90 }} />

        <div className="px-3 py-2.5 flex flex-col">
          <div className="h-9 flex items-center"><span className="text-xs text-[#888888] pl-2">System Prompt</span></div>
          <div className="h-9 flex items-center"><span className="text-xs text-[#888888] pl-2">User Message</span></div>
          <div className="h-9 flex items-center"><span className="text-xs text-[#888888] pl-2">Images</span></div>
        </div>

        <div className="px-3 pb-3 flex flex-col gap-2">
          <select
            className="nodrag w-full bg-[#1a1a1a] text-[#e5e5e5] text-sm border border-[#272727] rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            value={data.model}
            onChange={(e) => updateNodeData(id, { model: e.target.value })}
          >
            {GEMINI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          {data.streaming && (
            <div className="bg-[#1a1a1a] rounded-xl p-2 animate-pulse">
              <span className="text-xs text-[#525252]">Generating...</span>
            </div>
          )}
          {!data.streaming && data.result !== null && (
            <div className="bg-[#1a1a1a] rounded-xl p-2 max-h-[150px] overflow-y-auto">
              <p className="text-sm text-[#e5e5e5] whitespace-pre-wrap">{data.result}</p>
            </div>
          )}
          {!data.streaming && data.error !== null && (
            <p className="text-xs text-red-400">{data.error}</p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" data-handletype="text"
        style={{ background: HC.text, borderColor: "#1a1a1a", width: 12, height: 12, border: "2px solid #1a1a1a" }} />
    </NodeWrapper>
  );
}

export default memo(LLMNode);
