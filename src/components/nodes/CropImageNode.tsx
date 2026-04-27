"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Crop } from "lucide-react";
import { NODE_COLORS } from "@/types/workflow";
import type { CropImageNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";

const ACCENT = NODE_COLORS["crop-image"];

function CropImageNode({ id, data }: NodeProps<CropImageNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useWorkflowStore((s) => s.edges);
  const isConnected = (handleId: string) =>
    edges.some((e) => e.target === id && e.targetHandle === handleId);

  return (
    <div className="min-w-[240px] bg-[#1a1a1a] border border-[#272727] rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderLeft: `4px solid ${ACCENT}` }}
      >
        <Crop size={13} style={{ color: ACCENT }} className="flex-none" />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>

      <div className="relative px-3 pb-3 pt-3">
        <Handle
          type="target"
          position={Position.Left}
          id="image_url"
          data-handletype="image"
          style={{ top: "15%" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="x_percent"
          data-handletype="text"
          style={{ top: "30%" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="y_percent"
          data-handletype="text"
          style={{ top: "45%" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="width_percent"
          data-handletype="text"
          style={{ top: "60%" }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="height_percent"
          data-handletype="text"
          style={{ top: "75%" }}
        />

        <div className="flex flex-col gap-3 ml-3">
          <span className="text-xs text-[#525252]">Image</span>
          <span className="text-xs text-[#525252]">X %</span>
          <span className="text-xs text-[#525252]">Y %</span>
          <span className="text-xs text-[#525252]">Width %</span>
          <span className="text-xs text-[#525252]">Height %</span>
        </div>
      </div>

      <div className="px-3 pb-3 flex flex-col gap-1.5">
        {(
          [
            ["X", "xPercent", data.xPercent, "x_percent"],
            ["Y", "yPercent", data.yPercent, "y_percent"],
            ["Width", "widthPercent", data.widthPercent, "width_percent"],
            ["Height", "heightPercent", data.heightPercent, "height_percent"],
          ] as const
        ).map(([label, field, value, handleId]) => (
          <div key={field} className="flex items-center justify-between">
            <span className="text-xs text-[#525252]">{label}</span>
            <input
              type="number"
              className={`nodrag bg-[#111111] text-white text-sm border border-[#272727] rounded p-1 w-16 text-right focus:outline-none focus:ring-1 focus:ring-[#7c3aed] ${isConnected(handleId) ? "opacity-40 pointer-events-none" : ""}`}
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(e) => updateNodeData(id, { [field]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>

      {data.outputUrl !== null && (
        <div className="px-3 pb-3">
          <img
            src={data.outputUrl}
            alt="cropped output"
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

export default memo(CropImageNode);
