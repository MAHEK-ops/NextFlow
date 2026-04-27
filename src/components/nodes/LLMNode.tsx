"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Cpu } from "lucide-react";
import { NODE_COLORS, GEMINI_MODELS } from "@/types/workflow";
import type { LLMNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";

const ACCENT = NODE_COLORS["llm"];

function LLMNode({ id, data }: NodeProps<LLMNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useWorkflowStore((s) => s.edges);
  const isConnected = (handleId: string) =>
    edges.some((e) => e.target === id && e.targetHandle === handleId);

  return (
    <div className="min-w-[280px] bg-[#1a1a1a] border border-[#272727] rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderLeft: `4px solid ${ACCENT}` }}
      >
        <Cpu size={13} style={{ color: ACCENT }} className="flex-none" />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>

      <div className="relative px-3 pb-3 pt-3">
        <Handle
          type="target"
          position={Position.Left}
          id="system_prompt"
          data-handletype="text"
          style={{ top: "25%" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="user_message"
          data-handletype="text"
          style={{ top: "50%" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="images"
          data-handletype="image"
          style={{ top: "75%" }}
        />

        <div className="flex flex-col gap-3 ml-3">
          <span className="text-xs text-[#525252] flex items-center gap-1">
            System Prompt
            {isConnected("system_prompt") && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            )}
          </span>
          <span className="text-xs text-[#525252] flex items-center gap-1">
            User Message
            {isConnected("user_message") && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            )}
          </span>
          <span className="text-xs text-[#525252] flex items-center gap-1">
            Images
            {isConnected("images") && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            )}
          </span>
        </div>
      </div>

      <div className="px-3 pb-3 flex flex-col gap-2">
        <select
          className="nodrag w-full bg-[#111111] text-white text-sm border border-[#272727] rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          value={data.model}
          onChange={(e) => updateNodeData(id, { model: e.target.value })}
        >
          {GEMINI_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>

        {data.streaming && (
          <div className="bg-[#111111] rounded p-2 animate-pulse">
            <span className="text-xs text-[#525252]">Generating...</span>
          </div>
        )}

        {!data.streaming && data.result !== null && (
          <div className="bg-[#111111] rounded p-2 max-h-[150px] overflow-y-auto">
            <p className="text-sm text-white whitespace-pre-wrap">{data.result}</p>
          </div>
        )}

        {!data.streaming && data.error !== null && (
          <p className="text-xs text-red-400">{data.error}</p>
        )}
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

export default memo(LLMNode);
