"use client";

import { memo, useCallback, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Loader2, Trash2, Copy, Pencil, Download, Maximize2, Upload } from "lucide-react";
import { HANDLE_COLORS } from "@/lib/node-defaults";
import type { UploadImageNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import NodeWrapper from "./NodeWrapper";

const HC = HANDLE_COLORS;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      console.log('Upload started', file.name, file.size);

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        console.log('Calling upload...');

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        console.log('Response status:', res.status);

        if (!res.ok) throw new Error("Upload failed");

        const responseData = (await res.json()) as { url: string };

        console.log('Result:', { url: responseData.url.slice(0, 30) });

        updateNodeData(id, { imageUrl: responseData.url, fileName: file.name });
        addAssetUrl(responseData.url);
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setLoading(false);
      }

      e.target.value = "";
    },
    [id, updateNodeData, addAssetUrl]
  );

  const overlay =
    selected && data.imageUrl ? (
      <ImageActionBar id={id} imageUrl={data.imageUrl} />
    ) : undefined;

  return (
    <NodeWrapper nodeId={id} label={data.label} selected={selected} overlay={overlay}>
      <div className="px-3 py-2.5">
        {data.imageUrl ? (
          <div>
            <div className="rounded-xl overflow-hidden">
              <img
                src={data.imageUrl}
                alt={data.fileName ?? "uploaded image"}
                className="w-full object-cover rounded-xl"
                style={{ height: "160px", objectFit: "cover" }}
              />
            </div>
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
              {loading ? "Uploading..." : "Replace image"}
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-[#2a2a2a] cursor-pointer hover:border-[#3a3a3a] transition-colors w-full">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            {loading ? (
              <Loader2 size={20} className="text-[#525252] animate-spin" />
            ) : (
              <>
                <Upload size={20} className="text-[#3a3a3a]" />
                <span className="text-xs text-[#525252]">Click to upload image</span>
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
        data-handletype="image"
        style={{
          background: HC.image,
          borderColor: "var(--node-bg)",
          width: 12,
          height: 12,
          border: "2px solid var(--node-bg)",
        }}
      />
    </NodeWrapper>
  );
}

export default memo(UploadImageNode);
