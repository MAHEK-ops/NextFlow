"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Loader2 } from "lucide-react";
import Uppy from "@uppy/core";
import Transloadit, { type Result as TransloaditResult } from "@uppy/transloadit";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { UploadImageNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;
const TRANSLOADIT_KEY = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY ?? "";
type UppyInstance = InstanceType<typeof Uppy>;

function UploadImageNode({ id, data, selected }: NodeProps<UploadImageNodeData>) {
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
          steps: { exported: { use: ":original", robot: "/image/resize", format: "preserve" } },
        },
      },
    });
    uppy.on("upload", () => { setUploading(true); setError(null); });
    uppy.on("transloadit:result", (_s: string, result: TransloaditResult) => {
      updateNodeData(id, { imageUrl: result.ssl_url ?? result.url, fileName: result.name });
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
        {data.imageUrl ? (
          <div>
            <img src={data.imageUrl} alt={data.fileName ?? "uploaded image"}
              className="w-full max-h-[120px] object-cover rounded-xl" />
            <p className="mt-1.5 text-xs truncate" style={{ color: "var(--text-muted)" }}>{data.fileName}</p>
            <button type="button" onClick={openPicker} disabled={uploading}
              className="nodrag mt-2 w-full text-xs transition-colors disabled:opacity-50 hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-muted)" }}>
              {uploading ? "Uploading..." : "Replace image"}
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
                Upload image
              </button>
            )}
          </div>
        )}
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden" onChange={handleFileChange} />
      <Handle type="source" position={Position.Right} id="output" data-handletype="image"
        style={{ background: HC.image, borderColor: "var(--node-bg)", width: 12, height: 12, border: "2px solid var(--node-bg)" }} />
    </NodeWrapper>
  );
}

export default memo(UploadImageNode);
