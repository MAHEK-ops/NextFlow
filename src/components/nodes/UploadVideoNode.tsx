"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Loader2 } from "lucide-react";
import Uppy from "@uppy/core";
import Transloadit, { type Result as TransloaditResult } from "@uppy/transloadit";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { UploadVideoNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;
const TRANSLOADIT_KEY = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY ?? "";
type UppyInstance = InstanceType<typeof Uppy>;

function UploadVideoNode({ id, data, selected }: NodeProps<UploadVideoNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uppyRef = useRef<UppyInstance | null>(null);

  useEffect(() => {
    const uppy = new Uppy({ autoProceed: true }).use(Transloadit, {
      assemblyOptions: {
        params: {
          auth: { key: TRANSLOADIT_KEY },
          steps: { exported: { use: ":original", robot: "/video/encode", preset: "iphone-high" } },
        },
      },
    });
    uppy.on("upload", () => { setUploading(true); setError(null); });
    uppy.on("transloadit:result", (_s: string, result: TransloaditResult) => {
      updateNodeData(id, { videoUrl: result.ssl_url ?? result.url, fileName: result.name });
    });
    uppy.on("transloadit:complete", () => setUploading(false));
    uppy.on("upload-error", (_f, err: Error) => { setUploading(false); setError(err.message); });
    uppyRef.current = uppy;
    return () => { uppy.close(); };
  }, [id, updateNodeData]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uppyRef.current) return;
    try {
      uppyRef.current.cancelAll();
      uppyRef.current.addFile({ name: file.name, type: file.type, data: file });
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
    e.target.value = "";
  }, []);

  const openPicker = useCallback(() => fileInputRef.current?.click(), []);

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected}>
      <div className="px-3 py-2.5">
        {data.videoUrl ? (
          <div>
            <video src={data.videoUrl} controls className="w-full max-h-[120px] rounded-xl object-cover" />
            <p className="mt-1.5 text-xs truncate" style={{ color: "var(--text-muted)" }}>{data.fileName}</p>
            <button type="button" onClick={openPicker} disabled={uploading}
              className="nodrag mt-2 w-full text-xs transition-colors disabled:opacity-50 hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-muted)" }}>
              {uploading ? "Uploading..." : "Replace video"}
            </button>
          </div>
        ) : (
          <div className="border border-dashed rounded-xl p-4 flex flex-col items-center gap-2" style={{ borderColor: "var(--input-border)" }}>
            {uploading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            ) : (
              <button type="button" onClick={openPicker}
                className="nodrag text-sm transition-colors hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-muted)" }}>
                Upload video
              </button>
            )}
          </div>
        )}
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
      <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
        className="hidden" onChange={handleFileChange} />
      <Handle type="source" position={Position.Right} id="output" data-handletype="video"
        style={{ background: HC.video, borderColor: "var(--node-bg)", width: 12, height: 12, border: "2px solid var(--node-bg)" }} />
    </NodeWrapper>
  );
}

export default memo(UploadVideoNode);
