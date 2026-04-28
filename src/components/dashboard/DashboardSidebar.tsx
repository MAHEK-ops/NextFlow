import Link from "next/link";
import SidebarProfile from "./SidebarProfile";
import {
  Home,
  Layers,
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
  const inactiveRow = `${row} text-[#888888] hover:text-white hover:bg-[#1a1a1a]`;
  const activeRow = `${row} bg-[#1a1a1a] text-white font-medium`;
  const toolRow = `${row} text-[#888888]`;

  return (
    <aside className="w-[220px] flex-none flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a]">
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 via-yellow-400 to-green-400 flex items-center justify-center flex-shrink-0">
              <Layers size={16} className="text-white" />
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
            <div className="w-8 h-8 rounded-xl bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
              <FolderOpen size={16} className="text-white" />
            </div>
            Assets
          </div>
        </nav>

        <p className="text-xs text-[#3a3a3a] font-medium px-4 mt-4 mb-2">Tools</p>
        <nav className="flex flex-col gap-0.5">
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#1a3a5c] flex items-center justify-center flex-shrink-0">
              <ImageIcon size={16} className="text-white" />
            </div>
            Image
          </div>
          <div className={toolRow}>
            <div className="w-8 h-8 rounded-xl bg-[#7c3a00] flex items-center justify-center flex-shrink-0">
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
            <div className="w-8 h-8 rounded-xl bg-[#a16207] flex items-center justify-center flex-shrink-0">
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
          <div className="flex items-center gap-2 px-3 py-2 mx-1 text-sm text-[#3a3a3a]">
            <MoreHorizontal size={15} className="text-[#3a3a3a]" />
            More
          </div>
        </nav>

        <p className="text-xs text-[#3a3a3a] font-medium px-4 mt-4 mb-2">Sessions</p>
      </div>

      <div className="border-t border-[#1a1a1a] p-2">
        <SidebarProfile />
      </div>
    </aside>
  );
}
