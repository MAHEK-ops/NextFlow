"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { CropImageNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;
const HS = { width: 12, height: 12, border: "2px solid var(--node-bg)" };

const INPUTS = [
  { id: "image_url", label: "Image", color: HC.image },
  { id: "x_percent", label: "X %", color: HC.text },
  { id: "y_percent", label: "Y %", color: HC.text },
  { id: "width_percent", label: "Width %", color: HC.text },
  { id: "height_percent", label: "Height %", color: HC.text },
] as const;

function CropImageNode({ id, data, selected }: NodeProps<CropImageNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useWorkflowStore((s) => s.edges);
  const isConnected = (handleId: string) =>
    edges.some((e) => e.target === id && e.targetHandle === handleId);

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected}>
      <div className="relative">
        {INPUTS.map(({ id: hid, color }, i) => (
          <Handle key={hid} type="target" position={Position.Left} id={hid} data-handletype={hid === "image_url" ? "image" : "text"}
            style={{ ...HS, background: color, borderColor: "var(--node-bg)", top: 18 + i * 36 }} />
        ))}

        <div className="px-3 py-2.5 flex flex-col">
          {INPUTS.map(({ id: hid, label }) => (
            <div key={hid} className="h-9 flex items-center">
              <span className="text-xs pl-2" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="px-3 pb-3 flex flex-col gap-1.5">
          {(
            [
              ["X", "xPercent", data.xPercent, "x_percent"],
              ["Y", "yPercent", data.yPercent, "y_percent"],
              ["Width", "widthPercent", data.widthPercent, "width_percent"],
              ["Height", "heightPercent", data.heightPercent, "height_percent"],
            ] as const
          ).map(([lbl, field, value, handleId]) => (
            <div key={field} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{lbl}</span>
              <input type="number"
                className={`nodrag text-sm rounded-lg p-1 w-16 text-right focus:outline-none focus:ring-1 focus:ring-[#7c3aed] border ${isConnected(handleId) ? "opacity-40 pointer-events-none" : ""}`}
                style={{ background: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--input-border)" }}
                min={0} max={100} step={1} value={value}
                onChange={(e) => updateNodeData(id, { [field]: Number(e.target.value) })} />
            </div>
          ))}
        </div>

        {data.outputUrl !== null && (
          <div className="px-3 pb-3">
            <img src={data.outputUrl} alt="cropped output" className="w-full max-h-[100px] object-cover rounded-xl" />
          </div>
        )}
        {data.error !== null && <p className="px-3 pb-3 text-xs text-red-400">{data.error}</p>}
      </div>

      <Handle type="source" position={Position.Right} id="output" data-handletype="image"
        style={{ background: HC.image, borderColor: "var(--node-bg)", width: 12, height: 12, border: "2px solid var(--node-bg)" }} />
    </NodeWrapper>
  );
}

export default memo(CropImageNode);
