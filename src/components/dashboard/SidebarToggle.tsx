"use client";

import { PanelLeft } from "lucide-react";

export default function SidebarToggle() {
  return (
    <button
      type="button"
      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#525252] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors mb-2 mt-1 mx-auto"
    >
      <PanelLeft size={16} />
    </button>
  );
}
