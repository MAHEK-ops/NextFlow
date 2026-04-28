"use client";

import { useState } from "react";
import { Image, Search, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function AssetsPanel({ onClose }: Props) {
  const [query, setQuery] = useState("");

  return (
    <div className="absolute top-0 right-0 h-full w-[320px] bg-[#0d0d0d] border-l border-[#1a1a1a] flex flex-col z-20">
      <div className="h-12 flex items-center px-4 gap-2 border-b border-[#1a1a1a]">
        <Image size={15} className="text-[#525252]" />
        <span className="text-sm font-medium text-[#e5e5e5] flex-1">Assets</span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          <X size={13} className="text-[#525252]" />
        </button>
      </div>

      <div className="px-3 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#272727] rounded-xl px-3 h-9">
          <Search size={14} className="text-[#525252] flex-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets..."
            className="bg-transparent text-sm text-[#e5e5e5] placeholder-[#525252] outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-[#525252] text-center leading-relaxed">
          Your uploaded assets will appear here.
        </p>
      </div>
    </div>
  );
}
