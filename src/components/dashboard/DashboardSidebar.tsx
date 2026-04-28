"use client";

import Link from "next/link";
import { useState } from "react";
import SidebarFooter from "./SidebarFooter";

const ICONS = {
  home: "https://optim-images.krea.ai/https---s-krea-ai-icons-HomeIcon-png-128.webp",
  train: "https://optim-images.krea.ai/https---s-krea-ai-icons-Train-png-128.webp",
  node: "https://optim-images.krea.ai/https---s-krea-ai-icons-NodeEditor-png-128.webp",
  assets: "https://optim-images.krea.ai/https---s-krea-ai-icons-Assets-png-128.webp",
  image: "https://optim-images.krea.ai/https---s-krea-ai-icons-imageV4-png-128.webp",
  video: "https://optim-images.krea.ai/https---s-krea-ai-icons-videoV2-png-128.webp",
  enhance: "https://optim-images.krea.ai/https---s-krea-ai-icons-Enhance-png-128.webp",
  banana: "https://optim-images.krea.ai/https---s-krea-ai-icons-NanoBanana-png-128.webp",
  realtime: "https://optim-images.krea.ai/https---s-krea-ai-icons-realtimeV2-png-128.webp",
  edit: "https://optim-images.krea.ai/https---s-krea-ai-icons-Edit-png-128.webp",
  lipsync: "https://optim-images.krea.ai/https---s-krea-ai-icons-lipsync-png-128.webp",
  motion: "https://optim-images.krea.ai/https---s-krea-ai-icons-MotionTransfer-png-128.webp",
  threeD: "https://optim-images.krea.ai/https---s-krea-ai-icons-ThreeD-png-128.webp",
  restyle: "https://optim-images.krea.ai/https---s-krea-ai-icons-VideoRestyle2-png-128.webp",
};

function Item({
  icon,
  label,
  active,
  collapsed,
}: {
  icon: string;
  label: string;
  active?: boolean;
  collapsed: boolean;
}) {
  return (
    <div
      className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"
        } py-1.5 mx-1 rounded-lg text-[13px] cursor-pointer transition-all
      ${active
          ? "bg-white/10 text-white font-medium"
          : "text-white/80 hover:text-white hover:bg-white/5"
        }`}
    >
      <img src={icon} className="w-[18px] h-[18px]" />
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showMore, setShowMore] = useState(false);

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-[230px]"
        } transition-all duration-300 flex flex-col h-full border-r border-white/10 bg-[#0B0B0F]`}
    >
      {/* TOP TOGGLE */}
      <div className="flex items-center px-3 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex items-center justify-center size-7 w-12 h-full text-white/60 hover:bg-white/10 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>

          <span className="sr-only">Toggle Sidebar</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mt-7">
        {/* MAIN */}
        <div className="flex flex-col gap-0.5">
          <Item icon={ICONS.home} label="Home" collapsed={collapsed} />
          <Item icon={ICONS.train} label="Train Lora" collapsed={collapsed} />
          <Item
            icon={ICONS.node}
            label="Node Editor"
            active
            collapsed={collapsed}
          />
          <Item icon={ICONS.assets} label="Assets" collapsed={collapsed} />
        </div>

        {/* TOOLS */}
        {!collapsed && (
          <p className="px-4 mt-6 mb-2 text-[12px] text-white/50 tracking-wide">
            Tools
          </p>
        )}

        <div className="flex flex-col gap-0.5">
          <Item icon={ICONS.image} label="Image" collapsed={collapsed} />
          <Item icon={ICONS.video} label="Video" collapsed={collapsed} />
          <Item icon={ICONS.enhance} label="Enhancer" collapsed={collapsed} />
          <Item icon={ICONS.banana} label="Nano Banana" collapsed={collapsed} />
          <Item icon={ICONS.realtime} label="Realtime" collapsed={collapsed} />
          <Item icon={ICONS.edit} label="Edit" collapsed={collapsed} />

          {/* MORE */}
          {showMore && (
            <>
              <Item icon={ICONS.lipsync} label="Video Lipsync" collapsed={collapsed} />
              <Item icon={ICONS.motion} label="Motion Transfer" collapsed={collapsed} />
              <Item icon={ICONS.threeD} label="3D Objects" collapsed={collapsed} />
              <Item icon={ICONS.restyle} label="Video Restyle" collapsed={collapsed} />
            </>
          )}

          {/* TOGGLE MORE */}
          <div
            onClick={() => setShowMore(!showMore)}
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"
              } py-1.5 mx-1 text-[13px] text-white/80 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer`}
          >
            <span className="text-lg">...</span>
            {!collapsed && (showMore ? "Less" : "More")}
          </div>
        </div>

        {/* SESSIONS */}
        {!collapsed && (
          <p className="px-4 mt-4 mb-2 text-[11px] text-white/50 tracking-wide">
            Sessions
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-transparent p-2">
        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
}