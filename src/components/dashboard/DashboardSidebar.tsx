import Link from "next/link";
import SidebarProfile from "./SidebarProfile";
import {
  Home,
  GitBranch,
  FolderOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Star,
  Zap,
  Pen,
  MoreHorizontal,
} from "lucide-react";
import SidebarToggle from "./SidebarToggle";

export default function DashboardSidebar() {
  const row = "flex items-center gap-2.5 px-3 py-2 rounded-xl mx-1 text-sm transition-colors w-full text-left";
  const inactiveRow = `${row} text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--input-bg)]`;
  const activeRow = `${row} bg-[var(--input-bg)] text-[var(--text-primary)] font-medium`;
  const toolRow = `${row} text-[var(--text-muted)]`;

  return (
    <aside className="w-[220px] flex-none flex flex-col h-full border-r" style={{ background: "var(--sidebar-bg)", borderColor: "var(--toolbar-border)" }}>
      <SidebarToggle />

      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-0.5 py-1">
          <Link href="/dashboard" className={inactiveRow}>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
              <Home size={15} className="text-white" />
            </div>
            Home
          </Link>

          <div className={inactiveRow}>
            <div className="w-7 h-7 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 flex-shrink-0">
              <div className="bg-[#ea4335]" />
              <div className="bg-[#4285f4]" />
              <div className="bg-[#fbbc05]" />
              <div className="bg-[#34a853]" />
            </div>
            Train Lora
          </div>

          <Link href="/dashboard" className={activeRow}>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
              <GitBranch size={15} className="text-white" />
            </div>
            Node Editor
          </Link>

          <div className={toolRow}>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
              <FolderOpen size={15} className="text-white" />
            </div>
            Assets
          </div>
        </nav>

        <p className="text-xs font-medium px-4 mt-4 mb-2" style={{ color: "var(--text-faint)" }}>Tools</p>
        <nav className="flex flex-col gap-0.5">
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-lg bg-[#0c4a6e] flex items-center justify-center flex-shrink-0">
              <ImageIcon size={15} className="text-white" />
            </div>
            Image
          </div>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-lg bg-[#78350f] flex items-center justify-center flex-shrink-0">
              <VideoIcon size={15} className="text-white" />
            </div>
            Video
          </div>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-lg bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            Enhancer
          </div>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-lg bg-[#854d0e] flex items-center justify-center flex-shrink-0">
              <Star size={15} className="text-white" />
            </div>
            Nano Banana
          </div>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-lg bg-[#0c4a6e] flex items-center justify-center flex-shrink-0">
              <Zap size={15} className="text-white" />
            </div>
            Realtime
          </div>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-lg bg-[#4c1d95] flex items-center justify-center flex-shrink-0">
              <Pen size={15} className="text-white" />
            </div>
            Edit
          </div>
          <div className="flex items-center gap-2 px-3 py-2 mx-1 text-sm" style={{ color: "var(--text-muted)" }}>
            <MoreHorizontal size={15} style={{ color: "var(--text-muted)" }} />
            More
          </div>
        </nav>

        <p className="text-xs font-medium px-4 mt-4 mb-2" style={{ color: "var(--text-faint)" }}>Sessions</p>
      </div>

      <div className="border-t p-2 overflow-visible" style={{ borderColor: "var(--toolbar-border)" }}>
        <SidebarProfile />
      </div>
    </aside>
  );
}
