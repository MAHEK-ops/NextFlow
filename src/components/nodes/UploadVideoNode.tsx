"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Video, Loader2 } from "lucide-react";
import Uppy from "@uppy/core";
import Transloadit, { type Result as TransloaditResult } from "@uppy/transloadit";
import { NODE_COLORS } from "@/types/workflow";
import type { UploadVideoNodeData } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";

const ACCENT = NODE_COLORS["upload-video"];

const TRANSLOADIT_KEY = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY ?? "";

type UppyInstance = InstanceType<typeof Uppy>;

function UploadVideoNode({ id, data }: NodeProps<UploadVideoNodeData>) {
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
          steps: {
            exported: {
              use: ":original",
              robot: "/video/encode",
              preset: "iphone-high",
            },
          },
        },
      },
    });

    uppy.on("upload", () => {
      setUploading(true);
      setError(null);
    });

    uppy.on("transloadit:result", (_stepName: string, result: TransloaditResult) => {
      const url = result.ssl_url ?? result.url;
      updateNodeData(id, { videoUrl: url, fileName: result.name });
    });

    uppy.on("transloadit:complete", () => {
      setUploading(false);
    });

    uppy.on("upload-error", (_file, err: Error) => {
      setUploading(false);
      setError(err.message);
    });

    uppyRef.current = uppy;

    return () => {
      uppy.close();
    };
  }, [id, updateNodeData]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uppyRef.current) return;
    try {
      uppyRef.current.cancelAll();
      uppyRef.current.addFile({
        name: file.name,
        type: file.type,
        data: file,
      });
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
    e.target.value = "";
  }, []);

  const openPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="min-w-[240px] bg-[#1a1a1a] border border-[#272727] rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderLeft: `4px solid ${ACCENT}` }}
      >
        <Video size={13} style={{ color: ACCENT }} className="flex-none" />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>

      <div className="px-3 pb-3 pt-2">
        {data.videoUrl ? (
          <div>
            <video
              src={data.videoUrl}
              controls
              className="w-full max-h-[120px] rounded object-cover"
            />
            <p className="mt-1.5 text-xs text-[#525252] truncate">{data.fileName}</p>
            <button
              type="button"
              onClick={openPicker}
              disabled={uploading}
              className="nodrag mt-2 w-full text-xs text-[#525252] hover:text-white transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Replace video"}
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-[#272727] rounded p-4 flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 size={18} className="text-[#525252] animate-spin" />
            ) : (
              <button
                type="button"
                onClick={openPicker}
                className="nodrag text-sm text-[#525252] hover:text-white transition-colors"
              >
                Upload video
              </button>
            )}
          </div>
        )}

        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
        className="hidden"
        onChange={handleFileChange}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        data-handletype="video"
      />
    </div>
  );
}

export default memo(UploadVideoNode);
