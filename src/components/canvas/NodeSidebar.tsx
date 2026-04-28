"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Layers,
  FolderOpen,
  Search,
  Type,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Crop,
  Film,
  type LucideIcon,
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
}

function NodeRow({ type, label, icon: Icon }: NodeRowProps) {
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
  }, [screenToFlowPosition, addNode]);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl mx-1 cursor-pointer hover:bg-[#1a1a1a] transition-colors group"
    >
      <div
        className="w-7 h-7 rounded-lg flex-none flex items-center justify-center"
        style={{ background: color }}
      >
        <Icon size={13} className="text-white" />
      </div>
      <span className="text-sm text-[#c5c5c5] group-hover:text-[#e5e5e5] transition-colors truncate">
        {label}
      </span>
    </div>
  );
}

interface NodeSidebarProps {
  onOpenAssets?: () => void;
}

export default function NodeSidebar({ onOpenAssets }: NodeSidebarProps) {
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

  const navBase =
    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm w-full text-left transition-colors";
  const activeNav = `${navBase} bg-[#1a1a1a] text-[#e5e5e5]`;
  const inactiveNav = `${navBase} text-[#888888] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]`;

  const filtered = NODE_DEFINITIONS.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-[220px] flex-none flex flex-col bg-[#0f0f0f] border-r border-[#1a1a1a] h-full overflow-hidden transition-[width] duration-200">
      <div className="px-2 py-3 flex flex-col gap-0.5 border-b border-[#1a1a1a]">
        <button
          type="button"
          className={inactiveNav}
          onClick={() => router.push("/dashboard")}
        >
          <Home size={15} />
          Home
        </button>
        <button type="button" className={activeNav}>
          <Layers size={15} />
          Node Editor
        </button>
        <button type="button" className={inactiveNav} onClick={onOpenAssets}>
          <FolderOpen size={15} />
          Assets
        </button>
      </div>

      <div className="px-3 py-2.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#272727] rounded-xl px-3 h-8">
          <Search size={13} className="text-[#525252] flex-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent text-sm text-[#e5e5e5] placeholder-[#525252] outline-none min-w-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider px-4 pb-1.5">
          Quick Access
        </p>
        <div className="flex flex-col">
          {filtered.map((def) => (
            <NodeRow key={def.type} {...def} />
          ))}
        </div>
      </div>

      <div className="mt-auto border-t p-2" style={{ borderColor: "var(--toolbar-border)" }}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 px-3 py-2.5 mx-1 rounded-xl hover:bg-[#1a1a1a] transition-colors cursor-pointer w-full"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1c1c1e] border border-[#272727] flex items-center justify-center text-sm text-white font-medium flex-none">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-[#e5e5e5] font-medium truncate max-w-[120px]">{username}</span>
              <span className="text-xs text-[#525252]">Free</span>
            </div>
          </button>
          {showProfile && (
            <UserProfilePopup onClose={() => setShowProfile(false)} userInitial={initial} />
          )}
        </div>
      </div>
    </aside>
  );
}
