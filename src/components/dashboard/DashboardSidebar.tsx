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
  const row = "flex items-center gap-3 px-3 py-2.5 rounded-xl mx-1 text-sm transition-colors w-full text-left";
  const inactiveRow = `${row} text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--input-bg)]`;
  const activeRow = `${row} bg-[var(--input-bg)] text-[var(--text-primary)] font-medium`;
  const toolRow = `${row} text-[var(--text-muted)]`;

  return (
    <aside className="w-[220px] flex-none flex flex-col h-full border-r" style={{ background: "var(--sidebar-bg)", borderColor: "var(--toolbar-border)" }}>
      <SidebarToggle />

      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-0.5 py-1">
          <Link href="/dashboard" className={inactiveRow}>
            <div className="w-8 h-8 rounded-xl bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
              <Home size={16} className="text-white" />
            </div>
            Home
          </Link>

          <div className={inactiveRow}>
            <div className="w-8 h-8 rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2 flex-shrink-0">
              <div className="bg-[#ea4335]" />
              <div className="bg-[#4285f4]" />
              <div className="bg-[#fbbc05]" />
              <div className="bg-[#34a853]" />
            </div>
            Train Lora
          </div>

          <Link href="/dashboard" className={activeRow}>
            <div className="w-8 h-8 rounded-xl bg-[#3b5bdb] flex items-center justify-center flex-shrink-0">
              <GitBranch size={16} className="text-white" />
            </div>
            Node Editor
          </Link>

          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#1e40af] flex items-center justify-center flex-shrink-0">
              <FolderOpen size={16} className="text-white" />
            </div>
            Assets
          </div>
        </nav>

        <p className="text-xs font-medium px-4 mt-4 mb-2" style={{ color: "var(--text-muted)" }}>Tools</p>
        <nav className="flex flex-col gap-0.5">
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#0c4a6e] flex items-center justify-center flex-shrink-0">
              <ImageIcon size={16} className="text-white" />
            </div>
            Image
          </div>
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#78350f] flex items-center justify-center flex-shrink-0">
              <VideoIcon size={16} className="text-white" />
            </div>
            Video
          </div>
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            Enhancer
          </div>
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#854d0e] flex items-center justify-center flex-shrink-0">
              <Star size={16} className="text-white" />
            </div>
            Nano Banana
          </div>
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#0c4a6e] flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            Realtime
          </div>
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#4c1d95] flex items-center justify-center flex-shrink-0">
              <Pen size={16} className="text-white" />
            </div>
            Edit
          </div>
          <div className="flex items-center gap-2 px-3 py-2 mx-1 text-sm" style={{ color: "var(--text-muted)" }}>
            <MoreHorizontal size={15} style={{ color: "var(--text-muted)" }} />
            More
          </div>
        </nav>

        <p className="text-xs font-medium px-4 mt-4 mb-2" style={{ color: "var(--text-muted)" }}>Sessions</p>
      </div>

      <div className="border-t p-2" style={{ borderColor: "var(--toolbar-border)" }}>
        <SidebarProfile />
      </div>
    </aside>
  );
}
