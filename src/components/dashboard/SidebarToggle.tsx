"use client";

import { PanelLeft } from "lucide-react";

export default function SidebarToggle() {
  return (
    <button
      type="button"
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--input-bg)] transition-colors mb-2 mt-1 mx-auto"
      style={{ color: "var(--text-muted)" }}
    >
      <PanelLeft size={16} />
    </button>
  );
}
