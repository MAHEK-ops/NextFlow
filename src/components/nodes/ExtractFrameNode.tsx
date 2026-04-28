"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { ExtractFrameNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;
const HS = { width: 12, height: 12, border: "2px solid #1a1a1a" };

function ExtractFrameNode({ id, data, selected }: NodeProps<ExtractFrameNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected}>
      <div className="relative">
        <Handle type="target" position={Position.Left} id="video_url" data-handletype="video"
          style={{ ...HS, background: HC.video, borderColor: "#1a1a1a", top: 18 }} />
        <Handle type="target" position={Position.Left} id="timestamp" data-handletype="text"
          style={{ ...HS, background: HC.text, borderColor: "#1a1a1a", top: 54 }} />

        <div className="px-3 py-2.5 flex flex-col">
          <div className="h-9 flex items-center"><span className="text-xs text-[#888888] pl-2">Video</span></div>
          <div className="h-9 flex items-center"><span className="text-xs text-[#888888] pl-2">Timestamp</span></div>
        </div>

        <div className="px-3 pb-3 flex flex-col gap-1.5">
          <span className="text-xs text-[#525252]">Timestamp (s or %)</span>
          <input type="text"
            className="nodrag w-full bg-[#1a1a1a] text-[#e5e5e5] text-sm border border-[#272727] rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            placeholder="0" value={data.timestamp}
            onChange={(e) => updateNodeData(id, { timestamp: e.target.value })} />
        </div>

        {data.outputUrl !== null && (
          <div className="px-3 pb-3">
            <img src={data.outputUrl} alt="extracted frame" className="w-full max-h-[100px] object-cover rounded-xl" />
          </div>
        )}
        {data.error !== null && <p className="px-3 pb-3 text-xs text-red-400">{data.error}</p>}
      </div>

      <Handle type="source" position={Position.Right} id="output" data-handletype="image"
        style={{ background: HC.image, borderColor: "#1a1a1a", width: 12, height: 12, border: "2px solid #1a1a1a" }} />
    </NodeWrapper>
  );
}

export default memo(ExtractFrameNode);
