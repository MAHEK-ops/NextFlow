"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Loader2, Trash2, Copy, Pencil, Download, Maximize2 } from "lucide-react";
import Uppy from "@uppy/core";
import Transloadit, { type Result as TransloaditResult } from "@uppy/transloadit";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { UploadImageNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;
const TRANSLOADIT_KEY = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY ?? "";
type UppyInstance = InstanceType<typeof Uppy>;

function ImageActionBar({ id, imageUrl }: { id: string; imageUrl: string }) {
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const actions = [
    {
      icon: Trash2,
      label: "Delete",
      cls: "hover:text-red-400",
      onClick: () => deleteNode(id),
    },
    { icon: Copy, label: "Copy", cls: "", onClick: () => undefined },
    { icon: Pencil, label: "Edit", cls: "", onClick: () => undefined },
    {
      icon: Download,
      label: "Download",
      cls: "",
      onClick: () => {
        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = "image";
        a.click();
      },
    },
    { icon: Maximize2, label: "Expand", cls: "", onClick: () => undefined },
  ];

  return (
    <div className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-auto z-10">
      <div
        className="flex items-center gap-0.5 rounded-xl px-1.5 py-1 shadow-lg border"
        style={{ background: "var(--toolbar-bg)", borderColor: "var(--toolbar-border)" }}
      >
        {actions.map(({ icon: Icon, label, onClick, cls }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            title={label}
            className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--input-bg)] transition-colors ${cls}`}
            style={{ color: "var(--text-muted)" }}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadImageNode({ id, data, selected }: NodeProps<UploadImageNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const addAssetUrl = useWorkflowStore((s) => s.addAssetUrl);
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
      const url = result.ssl_url ?? result.url;
      updateNodeData(id, { imageUrl: url, fileName: result.name });
      addAssetUrl(url);
    });
    uppy.on("transloadit:complete", () => setUploading(false));
    uppy.on("upload-error", (_f, err: Error) => { setUploading(false); setError(err.message); });
    uppyRef.current = uppy;
    return () => { uppy.close(); };
  }, [id, updateNodeData, addAssetUrl]);

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

  const overlay = selected && data.imageUrl
    ? <ImageActionBar id={id} imageUrl={data.imageUrl} />
    : undefined;

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected} overlay={overlay}>
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
