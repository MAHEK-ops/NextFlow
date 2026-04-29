"use client";

import { useEffect, useRef } from "react";
import {
  TrendingUp,
  Coins,
  Settings,
  BarChart2,
  LogOut,
  Plus,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

interface Props {
  onClose: () => void;
  userInitial: string;
}

const MENU_ITEMS = [
  { icon: TrendingUp, label: "Upgrade plan" },
  { icon: Coins, label: "Buy credits" },
  { icon: Settings, label: "Settings" },
  { icon: BarChart2, label: "Usage Statistics" },
];

export default function UserProfilePopup({ onClose, userInitial }: Props) {
  const { signOut } = useClerk();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute bottom-0 left-full ml-2 z-50"
    >
      <div className="bg-[#111111] border border-[#272727] rounded-2xl p-2 w-[220px] shadow-2xl">
        <p className="text-xs text-[#525252] px-2 py-1.5 font-medium">Workspaces</p>

        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#1a1a1a] mb-1">
          <div className="w-6 h-6 rounded-lg bg-[#272727] flex items-center justify-center text-xs text-[#e5e5e5] font-medium flex-none">
            D
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[#e5e5e5] font-medium">Default Workspace</p>
            <p className="text-xs text-[#525252]">Free</p>
          </div>
        </div>

        <button
          type="button"
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#1a1a1a] cursor-pointer transition-colors"
        >
          <Plus size={14} className="text-[#525252]" />
          <span className="text-sm text-[#525252]">Add workspace</span>
        </button>

        <div className="h-px bg-[#1f1f1f] my-1" />

        <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-[#1a1a1a] mb-1">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] flex-none" />
          <div className="min-w-0">
            <p className="text-sm text-[#e5e5e5]">100 Credits remaining</p>
            <p className="text-xs text-[#525252]">100 per day</p>
          </div>
        </div>

        <div className="h-px bg-[#1f1f1f] my-1" />

        {MENU_ITEMS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#1a1a1a] cursor-pointer transition-colors"
          >
            <Icon size={15} className="text-[#525252]" />
            <span className="text-sm text-[#e5e5e5]">{label}</span>
          </button>
        ))}

        <div className="h-px bg-[#1f1f1f] my-1" />

        <button
          type="button"
          onClick={() => void signOut({ redirectUrl: "/dashboard" })}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#1a1a1a] cursor-pointer transition-colors"
        >
          <LogOut size={15} className="text-[#525252]" />
          <span className="text-sm text-[#e5e5e5]">Log out</span>
        </button>
      </div>
    </div>
  );
}
