"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function VersionHistoryPanel({ onClose }: Props) {
  return (
    <div className="absolute top-0 right-0 h-full w-[280px] bg-[#0d0d0d] border-l border-[#1a1a1a] z-20 flex flex-col">
      <div className="h-12 flex items-center px-4 border-b border-[#1a1a1a]">
        <span className="text-sm font-medium text-[#e5e5e5] flex-1">Version History</span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer"
        >
          <X size={13} className="text-[#525252]" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-[#525252] text-center leading-relaxed">
          No version history yet. Versions are captured as you edit your workflow.
        </p>
      </div>
    </div>
  );
}
