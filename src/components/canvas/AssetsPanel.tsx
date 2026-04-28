"use client";

import { X } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow";

interface Props {
  onClose: () => void;
}

function AssetThumbnail({ url }: { url: string }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("assetUrl", url);
        e.dataTransfer.setData("nodeType", "upload-image");
      }}
      className="relative aspect-video rounded-xl overflow-hidden border cursor-grab transition-colors group hover:border-[#3a3a3a]"
      style={{ borderColor: "var(--toolbar-border)" }}
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </div>
  );
}

export default function AssetsPanel({ onClose }: Props) {
  const assetUrls = useWorkflowStore((s) => s.assetUrls);

  return (
    <div
      className="absolute top-0 right-0 h-full w-[200px] flex flex-col z-20 border-l"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--toolbar-border)" }}
    >
      <div className="h-12 flex items-center px-4 gap-2 border-b flex-none" style={{ borderColor: "var(--toolbar-border)" }}>
        <span className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>Assets</span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--input-bg)] transition-colors cursor-pointer"
        >
          <X size={13} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        {assetUrls.length === 0 ? (
          <p className="text-xs text-center mt-8 px-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Uploaded images appear here
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {assetUrls.map((url, i) => (
              <AssetThumbnail key={i} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
