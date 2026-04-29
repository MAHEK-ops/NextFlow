"use client";

import { memo, useCallback, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Loader2, Upload } from "lucide-react";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { UploadVideoNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;

function UploadVideoNode({ id, data, selected }: NodeProps<UploadVideoNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const responseData = (await res.json()) as { url: string };
        updateNodeData(id, { videoUrl: responseData.url, fileName: file.name });
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setLoading(false);
      }

      e.target.value = "";
    },
    [id, updateNodeData]
  );

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected}>
      <div className="px-3 py-2.5" style={{ minWidth: 0, maxWidth: "100%" }}>
        {data.videoUrl ? (
          <div>
            <video
              src={data.videoUrl}
              controls
              className="rounded-xl"
              style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }}
            />
            <p className="mt-1.5 text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {data.fileName}
            </p>
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              disabled={loading}
              className="nodrag mt-2 w-full text-xs transition-colors disabled:opacity-50 hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-muted)" }}
            >
              {loading ? "Uploading..." : "Replace video"}
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-[#2a2a2a] cursor-pointer hover:border-[#3a3a3a] transition-colors w-full">
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
              className="hidden"
              onChange={handleFileChange}
            />
            {loading ? (
              <Loader2 size={20} className="text-[#525252] animate-spin" />
            ) : (
              <>
                <Upload size={20} className="text-[#3a3a3a]" />
                <span className="text-xs text-[#525252]">Click to upload video</span>
              </>
            )}
          </label>
        )}
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        data-handletype="video"
        style={{
          background: HC.video,
          borderColor: "var(--node-bg)",
          width: 12,
          height: 12,
          border: "2px solid var(--node-bg)",
        }}
      />
    </NodeWrapper>
  );
}

export default memo(UploadVideoNode);
