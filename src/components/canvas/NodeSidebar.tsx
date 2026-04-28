"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home, Layers, FolderOpen, Search, Type, Sparkles,
  Image as ImageIcon, Video as VideoIcon, Crop, Film,
  PanelLeft, type LucideIcon,
} from "lucide-react";
import { useReactFlow } from "reactflow";
import UserProfilePopup from "./UserProfilePopup";
import { NODE_COLORS, type NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflow";
import { DEFAULT_NODE_DATA } from "@/lib/node-defaults";
import type { WorkflowNode } from "@/types/workflow";

interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: LucideIcon;
}

const NODE_DEFINITIONS: NodeDefinition[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "llm", label: "Run Any LLM", icon: Sparkles },
  { type: "upload-image", label: "Upload Image", icon: ImageIcon },
  { type: "upload-video", label: "Upload Video", icon: VideoIcon },
  { type: "crop-image", label: "Crop Image", icon: Crop },
  { type: "extract-frame", label: "Extract Frame from Video", icon: Film },
];

interface NodeRowProps {
  type: NodeType;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
}

function NodeRow({ type, label, icon: Icon, collapsed }: NodeRowProps) {
  const color = NODE_COLORS[type];
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);

  function onDragStart(event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData("nodeType", type);
    event.dataTransfer.effectAllowed = "move";
  }

  const handleClick = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type,
      position,
      data: DEFAULT_NODE_DATA[type],
    };

    addNode(newNode);
  }, [screenToFlowPosition, addNode, type]);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
      className={`flex items-center gap-3 py-2 rounded-xl mx-2 cursor-pointer transition-all group
      hover:bg-[#1a1a1a]
      ${collapsed ? "justify-center px-1" : "px-3"}`}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-none transition-all"
        style={{
          background: color,
          boxShadow: "0 0 0 rgba(0,0,0,0)",
        }}
      >
        <Icon size={16} className="text-white" />
      </div>

      {/* Label */}
      {!collapsed && (
        <span className="text-sm text-[#e5e5e5] group-hover:text-white transition-colors truncate">
          {label}
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

export default function NodeSidebar({
  onOpenAssets,
  onToggle,
  collapsed,
}: NodeSidebarProps) {
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <aside
      className={`${collapsed ? "w-14" : "w-[260px]"} flex flex-col h-full border-r transition-all duration-200`}
      style={{
        background: "#0d0d0d",
        borderColor: "#1f1f1f",
      }}
    >
      {/* Toggle */}
      <div className="flex items-center px-3 py-3">
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition"
        >
          <PanelLeft size={16} className="text-[#a3a3a3]" />
        </button>
      </div>

      {/* Top nav */}
      <div className="flex flex-col gap-1 px-2">
        {[
          { icon: Home, label: "Home", onClick: () => router.push("/dashboard") },
          { icon: Layers, label: "Node Editor", active: true },
          { icon: FolderOpen, label: "Assets", onClick: onOpenAssets },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
              ${item.active ? "bg-[#1a1a1a] text-white" : "text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-[#1c1c1e] flex items-center justify-center">
              <item.icon size={16} className="text-white" />
            </div>
            {!collapsed && item.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 mt-3">
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-[#111111] border border-[#262626] focus-within:border-[#3a3a3a] transition">
            <Search size={14} className="text-[#6b6b6b]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nodes..."
              className="bg-transparent text-sm text-white placeholder:text-[#6b6b6b] outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* Section label */}
      {!collapsed && (
        <p className="text-[10px] uppercase tracking-wider text-[#525252] px-4 mt-4 mb-2">
          Quick Access
        </p>
      )}

      {/* Nodes */}
      <div className="flex-1 overflow-y-auto pb-2">
        {filtered.map((def) => (
          <NodeRow key={def.type} {...def} collapsed={collapsed} />
        ))}
      </div>

      {/* Bottom Profile */}
      <div className="border-t border-[#1f1f1f] p-2">
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            } px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition w-full`}
          >
            <div className="w-9 h-9 rounded-full bg-[#1c1c1e] border border-[#2a2a2a] flex items-center justify-center text-sm text-white font-medium">
              {initial}
            </div>

            {!collapsed && (
              <div className="flex flex-col text-left">
                <span className="text-sm text-white truncate max-w-[140px]">
                  {username}
                </span>
                <span className="text-xs text-[#6b6b6b]">Free</span>
              </div>
            )}
          </button>

          {showProfile && (
            <UserProfilePopup
              onClose={() => setShowProfile(false)}
              userInitial={initial}
            />
          )}
        </div>
      </div>
    </aside>
  );
}