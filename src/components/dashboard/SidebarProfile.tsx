"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { TrendingUp, Coins, Settings, BarChart2, LogOut, Plus } from "lucide-react";

const MENU_ITEMS = [
  { icon: TrendingUp, label: "Upgrade plan" },
  { icon: Coins, label: "Buy credits" },
  { icon: Settings, label: "Settings" },
  { icon: BarChart2, label: "Usage Statistics" },
];

type Props = {
  collapsed: boolean;
};

export default function SidebarProfile({ collapsed }: Props) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const initial = mounted
    ? (user?.firstName?.[0] ?? user?.username?.[0] ?? "U").toUpperCase()
    : "U";

  const name = mounted ? (user?.username ?? user?.firstName ?? "User") : "User";

  async function handleSignOut() {
    await signOut();
    window.location.href = "/sign-in";
  }

  return (
    <div ref={containerRef} className="relative">
      {/* DROPDOWN */}
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-[220px] z-50">
          <div className="bg-[#111111] border border-[#272727] rounded-2xl p-2 shadow-2xl">
            <p className="text-xs text-[#525252] px-2 py-1.5 font-medium tracking-wide">
              Workspaces
            </p>

            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#1a1a1a] mb-0.5">
              <div className="w-6 h-6 rounded-lg bg-[#272727] flex items-center justify-center text-xs text-[#e5e5e5] font-semibold">
                D
              </div>
              <div>
                <p className="text-sm text-[#e5e5e5] font-medium">Default Workspace</p>
                <p className="text-xs text-[#525252]">Free</p>
              </div>
            </div>

            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#1a1a1a]">
              <Plus size={14} className="text-[#525252]" />
              <span className="text-sm text-[#525252]">Add workspace</span>
            </button>

            <div className="h-px bg-[#1f1f1f] my-1.5" />

            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#1a1a1a] mb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <div>
                <p className="text-sm text-[#e5e5e5] font-medium">86 Credits remaining</p>
                <p className="text-xs text-[#525252]">100 per day</p>
              </div>
            </div>

            <div className="h-px bg-[#1f1f1f] my-1.5" />

            {MENU_ITEMS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#1a1a1a]"
              >
                <Icon size={15} className="text-[#525252]" />
                <span className="text-sm text-[#e5e5e5]">{label}</span>
              </button>
            ))}

            <div className="h-px bg-[#1f1f1f] my-1.5" />

            <button
              onClick={() => void handleSignOut()}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#1a1a1a]"
            >
              <LogOut size={15} className="text-[#525252]" />
              <span className="text-sm text-[#e5e5e5]">Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* PROFILE BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"
          } py-2 rounded-lg hover:bg-white/5 transition`}
      >
        {/* SQUARE AVATAR */}
        <div className="w-7 h-7 rounded-lg bg-[#1c1c1e] border border-white/10 flex items-center justify-center text-xs text-white font-medium">
          {initial}
        </div>

        {/* TEXT (hide when collapsed) */}
        {!collapsed && (
          <div className="flex flex-col text-left">
            <span className="text-sm text-white font-medium truncate max-w-[120px]">
              {name}
            </span>
            <span className="text-xs text-white/50">Free</span>
          </div>
        )}
      </button>
    </div>
  );
}