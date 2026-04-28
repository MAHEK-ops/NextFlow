"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import { GEMINI_MODELS } from "@/types/workflow";
import type { LLMNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;

const HS = { width: 12, height: 12, border: "2px solid var(--node-bg)" };

function LLMNode({ id, data, selected }: NodeProps<LLMNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected} minWidth={280} error={data.error}>
      <div className="relative">
        <Handle type="target" position={Position.Left} id="system_prompt" data-handletype="text"
          style={{ ...HS, background: HC.text, borderColor: "var(--node-bg)", top: 18 }} />
        <Handle type="target" position={Position.Left} id="user_message" data-handletype="text"
          style={{ ...HS, background: HC.text, borderColor: "var(--node-bg)", top: 54 }} />
        <Handle type="target" position={Position.Left} id="images" data-handletype="image"
          style={{ ...HS, background: HC.image, borderColor: "var(--node-bg)", top: 90 }} />

        <div className="px-3 py-2.5 flex flex-col">
          <div className="h-9 flex items-center"><span className="text-xs pl-2" style={{ color: "var(--text-muted)" }}>System Prompt</span></div>
          <div className="h-9 flex items-center"><span className="text-xs pl-2" style={{ color: "var(--text-muted)" }}>User Message</span></div>
          <div className="h-9 flex items-center"><span className="text-xs pl-2" style={{ color: "var(--text-muted)" }}>Images</span></div>
        </div>

        <div className="px-3 pb-3 flex flex-col gap-2">
          <select
            draggable={false}
            className="nodrag nopan w-full text-sm rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] border"
            style={{ background: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--input-border)" }}
            value={data.model}
            onChange={(e) => updateNodeData(id, { model: e.target.value })}
          >
            {GEMINI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          {data.streaming && (
            <div className="rounded-xl p-2 animate-pulse" style={{ background: "var(--input-bg)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Generating...</span>
            </div>
          )}
          {!data.streaming && data.result !== null && (
            <div className="rounded-xl p-2 max-h-[150px] overflow-y-auto" style={{ background: "var(--input-bg)" }}>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{data.result}</p>
            </div>
          )}

        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" data-handletype="text"
        style={{ background: HC.text, borderColor: "var(--node-bg)", width: 12, height: 12, border: "2px solid var(--node-bg)" }} />
    </NodeWrapper>
  );
}

export default memo(LLMNode);
