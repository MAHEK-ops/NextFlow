"use client";

import { useState } from "react";
import { Type, Cpu, ImagePlus, VideoIcon, Crop, Film, LogIn, type LucideIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { NODE_COLORS, type NodeType } from "@/types/workflow";
import UserProfilePopup from "./UserProfilePopup";

const NODE_DEFINITIONS: Array<{ type: NodeType; label: string; icon: LucideIcon }> = [
  { type: "text", label: "Text", icon: Type },
  { type: "llm", label: "LLM", icon: Cpu },
  { type: "upload-image", label: "Upload Image", icon: ImagePlus },
  { type: "upload-video", label: "Upload Video", icon: VideoIcon },
  { type: "crop-image", label: "Crop Image", icon: Crop },
  { type: "extract-frame", label: "Extract Frame", icon: Film },
];

function NodeButton({ type, label, icon: Icon }: { type: NodeType; label: string; icon: LucideIcon }) {
  const color = NODE_COLORS[type];

  function onDragStart(event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData("nodeType", type);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-[#1a1a1a] hover:bg-[#222222] transition-colors text-left cursor-grab active:cursor-grabbing"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <Icon size={14} style={{ color }} className="flex-none" />
      <span className="text-sm text-white">{label}</span>
    </button>
  );
}

function ProfileButton() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initial = (
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "U"
  ).toUpperCase();

  if (!isSignedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/sign-in")}
        className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center cursor-pointer hover:border-[#3a3a3a] transition-colors"
      >
        <LogIn size={14} className="text-[#525252]" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#272727] flex items-center justify-center text-xs text-[#e5e5e5] font-medium cursor-pointer hover:border-[#3a3a3a] transition-colors"
      >
        {initial}
      </button>
      {open && (
        <UserProfilePopup
          onClose={() => setOpen(false)}
          userInitial={initial}
        />
      )}
    </div>
  );
}

export default function NodeSidebar() {
  return (
    <aside className="w-[220px] flex-none flex flex-col bg-[#111111] border-r border-[#1f1f1f]">
      <p className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
        Nodes
      </p>
      <div className="border-b border-[#1f1f1f]" />
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {NODE_DEFINITIONS.map((def) => (
          <NodeButton key={def.type} {...def} />
        ))}
      </div>
      <div className="mt-auto pb-4 flex flex-col items-center">
        <ProfileButton />
      </div>
    </aside>
  );
}
