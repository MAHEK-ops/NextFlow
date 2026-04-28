"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { ExtractFrameNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;
const HS = { width: 12, height: 12, border: "2px solid var(--node-bg)" };

function ExtractFrameNode({ id, data, selected }: NodeProps<ExtractFrameNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected} error={data.error}>
      <div className="relative">
        <Handle type="target" position={Position.Left} id="video_url" data-handletype="video"
          style={{ ...HS, background: HC.video, borderColor: "var(--node-bg)", top: 18 }} />
        <Handle type="target" position={Position.Left} id="timestamp" data-handletype="text"
          style={{ ...HS, background: HC.text, borderColor: "var(--node-bg)", top: 54 }} />

        <div className="px-3 py-2.5 flex flex-col">
          <div className="h-9 flex items-center"><span className="text-xs pl-2" style={{ color: "var(--text-muted)" }}>Video</span></div>
          <div className="h-9 flex items-center"><span className="text-xs pl-2" style={{ color: "var(--text-muted)" }}>Timestamp</span></div>
        </div>

        <div className="px-3 pb-3 flex flex-col gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Timestamp (s or %)</span>
          <input type="text"
            className="nodrag w-full text-sm rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] border placeholder:text-[var(--text-muted)]"
            style={{ background: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--input-border)" }}
            placeholder="0" value={data.timestamp}
            onChange={(e) => updateNodeData(id, { timestamp: e.target.value })} />
        </div>

        {data.outputUrl !== null && (
          <div className="px-3 pb-3">
            <img src={data.outputUrl} alt="extracted frame" className="w-full max-h-[100px] object-cover rounded-xl" />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="output" data-handletype="image"
        style={{ background: HC.image, borderColor: "var(--node-bg)", width: 12, height: 12, border: "2px solid var(--node-bg)" }} />
    </NodeWrapper>
  );
}

export default memo(ExtractFrameNode);
