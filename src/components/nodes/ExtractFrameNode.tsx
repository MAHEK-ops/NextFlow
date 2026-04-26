"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Film } from "lucide-react";
import { NODE_COLORS } from "@/types/workflow";
import type { ExtractFrameNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";

const ACCENT = NODE_COLORS["extract-frame"];

function ExtractFrameNode({ id, data }: NodeProps<ExtractFrameNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <div className="min-w-[240px] bg-[#1a1a1a] border border-[#272727] rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderLeft: `4px solid ${ACCENT}` }}
      >
        <Film size={13} style={{ color: ACCENT }} className="flex-none" />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>

      <div className="relative px-3 pb-3 pt-3">
        <Handle
          type="target"
          position={Position.Left}
          id="video_url"
          data-handletype="video"
          style={{ top: "30%" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="timestamp"
          data-handletype="text"
          style={{ top: "70%" }}
        />

        <div className="flex flex-col gap-3 ml-3">
          <span className="text-xs text-[#525252]">Video</span>
          <span className="text-xs text-[#525252]">Timestamp</span>
        </div>
      </div>

      <div className="px-3 pb-3 flex flex-col gap-1.5">
        <span className="text-xs text-[#525252]">Timestamp (s or %)</span>
        <input
          type="text"
          className="nodrag w-full bg-[#111111] text-white text-sm border border-[#272727] rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          placeholder="0"
          value={data.timestamp}
          onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
        />
      </div>

      {data.outputUrl !== null && (
        <div className="px-3 pb-3">
          <img
            src={data.outputUrl}
            alt="extracted frame"
            className="w-full max-h-[100px] object-cover rounded"
          />
        </div>
      )}

      {data.error !== null && (
        <div className="px-3 pb-3">
          <p className="text-xs text-red-400">{data.error}</p>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        data-handletype="image"
      />
    </div>
  );
}

export default memo(ExtractFrameNode);
