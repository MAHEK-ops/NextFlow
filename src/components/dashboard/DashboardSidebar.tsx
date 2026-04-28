import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  Home,
  GitBranch,
  FolderOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";

export default async function DashboardSidebar() {
  const user = await currentUser();
  const initial = (
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "U"
  ).toUpperCase();
  const displayName = user?.username ?? user?.firstName ?? "User";

  const row = "flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 text-sm transition-colors";
  const inactiveRow = `${row} text-[#888888] hover:text-white hover:bg-[#1a1a1a]`;
  const activeRow = `${row} bg-[#1a1a1a] text-white`;
  const toolRow = `${row} text-[#525252]`;

  return (
    <aside className="w-[220px] flex-none flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a]">
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="flex flex-col gap-0.5">
          <Link href="/dashboard" className={inactiveRow}>
            <div className="w-7 h-7 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-none">
              <Home size={14} className="text-white" />
            </div>
            Home
          </Link>
          <Link href="/dashboard" className={activeRow}>
            <div className="w-7 h-7 rounded-xl bg-[#3b5bdb] flex items-center justify-center flex-none">
              <GitBranch size={14} className="text-white" />
            </div>
            Node Editor
          </Link>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-xl bg-[#1e3a5f] flex items-center justify-center flex-none">
              <FolderOpen size={14} className="text-white" />
            </div>
            Assets
          </div>
        </nav>

        <p className="text-xs text-[#3a3a3a] font-medium px-6 mt-4 mb-1">Tools</p>
        <nav className="flex flex-col gap-0.5">
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-xl bg-[#0ea5e9] flex items-center justify-center flex-none">
              <ImageIcon size={14} className="text-white" />
            </div>
            Image
          </div>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-xl bg-[#f97316] flex items-center justify-center flex-none">
              <VideoIcon size={14} className="text-white" />
            </div>
            Video
          </div>
          <div className={toolRow}>
            <div className="w-7 h-7 rounded-xl bg-[#272727] flex items-center justify-center flex-none">
              <Sparkles size={14} className="text-white" />
            </div>
            Enhancer
          </div>
          <div className={`${toolRow} gap-2`}>
            <div className="w-7 h-7 flex items-center justify-center flex-none">
              <MoreHorizontal size={15} className="text-[#3a3a3a]" />
            </div>
            <span className="text-[#3a3a3a]">More</span>
          </div>
        </nav>

        <p className="text-xs text-[#3a3a3a] font-medium px-6 mt-4 mb-1">Sessions</p>
      </div>

      <div className="border-t border-[#1a1a1a] p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-[#1a1a1a] border border-[#272727] flex items-center justify-center text-sm text-white font-medium flex-shrink-0">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-[#e5e5e5] font-medium truncate">{displayName}</span>
            <span className="text-[10px] text-[#525252]">Free</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
