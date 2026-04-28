"use client";

import { useMemo } from "react";
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
      className="relative aspect-square rounded-xl overflow-hidden border cursor-grab transition-colors group hover:border-[#3a3a3a]"
      style={{ borderColor: "var(--toolbar-border)" }}
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </div>
  );
}

export default function AssetsPanel({ onClose }: Props) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const storedAssets = useWorkflowStore((s) => s.assetUrls);

  const allAssets = useMemo(() => {
    const urls: string[] = [];
    nodes.forEach((node) => {
      const d = node.data as unknown as Record<string, unknown>;
      if (d.imageUrl && typeof d.imageUrl === "string") urls.push(d.imageUrl);
      if (d.outputUrl && typeof d.outputUrl === "string") urls.push(d.outputUrl);
      if (d.result && typeof d.result === "string" && d.result.startsWith("http")) urls.push(d.result);
    });
    return [...new Set([...storedAssets, ...urls])];
  }, [nodes, storedAssets]);

  return (
    <aside
      className="w-[150px] flex-none flex flex-col h-full border-l"
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
        {allAssets.length === 0 ? (
          <p className="text-xs text-center mt-8 px-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Uploaded images appear here
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {allAssets.map((url, i) => (
              <AssetThumbnail key={i} url={url} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
