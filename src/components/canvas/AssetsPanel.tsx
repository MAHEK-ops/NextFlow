"use client";

import { useState } from "react";
import { Image, Search, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function AssetsPanel({ onClose }: Props) {
  const [query, setQuery] = useState("");

  return (
    <div className="absolute top-0 right-0 h-full w-[320px] flex flex-col z-20 border-l" style={{ background: "var(--sidebar-bg)", borderColor: "var(--toolbar-border)" }}>
      <div className="h-12 flex items-center px-4 gap-2 border-b" style={{ borderColor: "var(--toolbar-border)" }}>
        <Image size={15} style={{ color: "var(--text-muted)" }} />
        <span className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>Assets</span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--input-bg)] transition-colors cursor-pointer"
        >
          <X size={13} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div className="px-3 py-3 border-b" style={{ borderColor: "var(--toolbar-border)" }}>
        <div className="flex items-center gap-2 rounded-xl px-3 h-9 border" style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}>
          <Search size={14} className="flex-none" style={{ color: "var(--text-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets..."
            className="bg-transparent text-sm outline-none flex-1"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-center leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Your uploaded assets will appear here.
        </p>
      </div>
    </div>
  );
}
