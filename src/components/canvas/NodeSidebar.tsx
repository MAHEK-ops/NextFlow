"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Search, PanelLeft } from "lucide-react";
import { useReactFlow } from "reactflow";
import UserProfilePopup from "./UserProfilePopup";
import { type NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import { DEFAULT_NODE_DATA } from "@/lib/node-defaults";
import type { WorkflowNode } from "@/types/workflow";
import { extractFrameTask } from "@/trigger/extract-frame-task";
import SidebarFooter from "../dashboard/SidebarFooter";

/* KREA ICONS */
const ICONS = {
  home: "https://optim-images.krea.ai/https---s-krea-ai-icons-HomeIcon-png-128.webp",
  train: "https://optim-images.krea.ai/https---s-krea-ai-icons-Train-png-128.webp",
  node: "https://optim-images.krea.ai/https---s-krea-ai-icons-NodeEditor-png-128.webp",
  assets: "https://optim-images.krea.ai/https---s-krea-ai-icons-Assets-png-128.webp",

  text: "https://optim-images.krea.ai/https---s-krea-ai-icons-Edit-png-128.webp",
  image: "https://optim-images.krea.ai/https---s-krea-ai-icons-imageV4-png-128.webp",
  video: "https://optim-images.krea.ai/https---s-krea-ai-icons-videoV2-png-128.webp",
  cropImage: "https://optim-images.krea.ai/https---s-krea-ai-icons-NanoBanana-png-128.webp",
  extractFrame: "https://optim-images.krea.ai/https---s-krea-ai-icons-realtimeV2-png-128.webp",
};

const NODE_DEFINITIONS: { type: NodeType; label: string; icon: string }[] = [
  { type: "text", label: "Text", icon: ICONS.text },
  { type: "llm", label: "Run Any LLM", icon: ICONS.node },
  { type: "upload-image", label: "Upload Image", icon: ICONS.image },
  { type: "upload-video", label: "Upload Video", icon: ICONS.video },
  { type: "crop-image", label: "Crop Image", icon: ICONS.cropImage },
  { type: "extract-frame", label: "Extract Frame from Video", icon: ICONS.extractFrame },
];

interface NodeDef {
  type: NodeType;
  label: string;
  icon: string;
}

function NodeRow({ def, collapsed }: { def: NodeDef; collapsed: boolean }) {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);

  const handleClick = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: def.type,
      position,
      data: DEFAULT_NODE_DATA[def.type],
    };

    addNode(newNode);
  }, [screenToFlowPosition, addNode, def.type]);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("nodeType", def.type);
        e.dataTransfer.setData("application/reactflow-nodetype", def.type);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
      hover:bg-[#151515] transition`}
    >
      <img src={def.icon} className="w-5 h-5 opacity-90" />

      {!collapsed && (
        <span className="text-sm text-[#b3b3b3] hover:text-white">
          {def.label}
        </span>
      )}
    </div>
  );
}

interface NodeSidebarProps {
  onOpenAssets?: () => void;
  onToggle: () => void;
  collapsed: boolean;
}

export default function NodeSidebar({ onOpenAssets, onToggle, collapsed }: NodeSidebarProps) {
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  useEffect(() => setMounted(true), []);

  const initial = mounted
    ? (user?.firstName?.[0] ??
      user?.emailAddresses?.[0]?.emailAddress?.[0] ??
      "U").toUpperCase()
    : "U";

  const username = mounted
    ? user?.username ?? user?.firstName ?? "User"
    : "User";

  const filtered = NODE_DEFINITIONS.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`${collapsed ? "w-14" : "w-[240px]"} bg-black flex flex-col h-screen`}>

      {/* Toggle */}
      <div className="px-3 py-3">
        <button onClick={onToggle}>
          <PanelLeft size={16} className="text-[#6b6b6b]" />
        </button>
      </div>

      {/* NAV */}
      <div className="px-3 space-y-3">
        <div onClick={() => router.push("/dashboard")} className="flex items-center gap-3 cursor-pointer">
          <img src={ICONS.home} className="w-5 h-5 opacity-70" />
          {!collapsed && <span className="text-[#9ca3af]">Home</span>}
        </div>

        <div className="flex items-center gap-3 bg-[#1a1a1a] px-3 py-2 rounded-xl">
          <img src={ICONS.node} className="w-5 h-5" />
          {!collapsed && <span className="text-white">Node Editor</span>}
        </div>

        <div onClick={onOpenAssets} className="flex items-center gap-3 cursor-pointer">
          <img src={ICONS.assets} className="w-5 h-5 opacity-70" />
          {!collapsed && <span className="text-[#9ca3af]">Assets</span>}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">

        {/* SEARCH */}
        {!collapsed && (
          <div className="px-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a2a2a]">
              <Search size={14} className="text-[#6b6b6b]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes..."
                className="bg-transparent text-sm text-white outline-none w-full"
              />
            </div>
          </div>
        )}

        {/* QUICK ACCESS */}
        {!collapsed && (
          <p className="text-xs text-[#6b6b6b] px-4 mt-4">QUICK ACCESS</p>
        )}

        <div className="mt-2 space-y-1 px-2">
          {filtered.map((def, i) => (
            <NodeRow key={i} def={def} collapsed={collapsed} />
          ))}
        </div>

      </div>

      {/* FOOTER (NOW FIXED AT BOTTOM) */}
      <div className="p-2">
        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
}