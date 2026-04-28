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
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newNode: WorkflowNode = { id: crypto.randomUUID(), type, position, data: DEFAULT_NODE_DATA[type] };
    addNode(newNode);
  }, [screenToFlowPosition, addNode, type]);

  return (
    <div
      role="button" tabIndex={0} draggable
      onDragStart={onDragStart} onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
      className={`flex items-center gap-3 py-2 rounded-xl mx-1 cursor-pointer transition-colors group hover:bg-[var(--input-bg)] ${collapsed ? "justify-center px-1" : "px-3"}`}
    >
      <div className="w-9 h-9 rounded-2xl flex-none flex items-center justify-center" style={{ background: color }}>
        <Icon size={17} className="text-white" />
      </div>
      {!collapsed && (
        <span className="text-sm font-medium truncate transition-colors" style={{ color: "var(--text-primary)" }}>{label}</span>
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

  useEffect(() => { setMounted(true); }, []);

  const initial = mounted
    ? (user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase()
    : "U";
  const username = mounted ? (user?.username ?? user?.firstName ?? "User") : "User";

  const navBase = `flex items-center ${collapsed ? "justify-center px-1" : "gap-3 px-3"} py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors`;
  const activeNav = `${navBase} bg-[var(--input-bg)]`;
  const inactiveNav = `${navBase} hover:bg-[var(--input-bg)]`;

  const filtered = NODE_DEFINITIONS.filter((n) => n.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside
      className={`${collapsed ? "w-12" : "w-[240px]"} flex-none flex flex-col h-full border-r overflow-hidden transition-[width] duration-200`}
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--toolbar-border)" }}
    >
      <div className="flex items-center px-2 py-2">
        <button
          type="button" onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--input-bg)]"
          style={{ color: "var(--text-muted)" }}
        >
          <PanelLeft size={16} />
        </button>
      </div>

      <div className="px-2 pb-2 flex flex-col gap-0.5">
        <button type="button" className={inactiveNav} onClick={() => router.push("/dashboard")}
          style={{ color: "var(--text-primary)" }}>
          <div className="w-9 h-9 rounded-2xl bg-[#1c1c1e] flex items-center justify-center flex-none">
            <Home size={18} className="text-white" />
          </div>
          {!collapsed && "Home"}
        </button>
        <button type="button" className={activeNav} style={{ color: "var(--text-primary)" }}>
          <div className="w-9 h-9 rounded-2xl bg-[#3b5bdb] flex items-center justify-center flex-none">
            <Layers size={18} className="text-white" />
          </div>
          {!collapsed && "Node Editor"}
        </button>
        <button type="button" className={inactiveNav} onClick={onOpenAssets}
          style={{ color: "var(--text-primary)" }}>
          <div className="w-9 h-9 rounded-2xl bg-[#1e40af] flex items-center justify-center flex-none">
            <FolderOpen size={18} className="text-white" />
          </div>
          {!collapsed && "Assets"}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 pb-2.5">
          <div className="flex items-center gap-2 rounded-xl px-3 h-8 border" style={{ background: "var(--input-bg)", borderColor: "var(--input-border)" }}>
            <Search size={13} className="flex-none" style={{ color: "var(--text-muted)" }} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nodes..."
              className="flex-1 bg-transparent text-sm outline-none min-w-0"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-2">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-wider px-4 pb-1.5" style={{ color: "var(--text-faint)" }}>
            Quick Access
          </p>
        )}
        <div className="flex flex-col">
          {filtered.map((def) => <NodeRow key={def.type} {...def} collapsed={collapsed} />)}
        </div>
      </div>

      <div className="mt-auto border-t p-2" style={{ borderColor: "var(--toolbar-border)" }}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-3 py-2.5 mx-1 rounded-xl hover:bg-[var(--input-bg)] transition-colors cursor-pointer w-full`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#1c1c1e] border border-[#272727] flex items-center justify-center text-sm text-white font-medium flex-none">
              {initial}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate max-w-[140px]" style={{ color: "var(--text-primary)" }}>{username}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Free</span>
              </div>
            )}
          </button>
          {showProfile && <UserProfilePopup onClose={() => setShowProfile(false)} userInitial={initial} />}
        </div>
      </div>
    </aside>
  );
}
