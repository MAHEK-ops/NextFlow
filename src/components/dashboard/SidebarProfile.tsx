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

export default function SidebarProfile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

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
      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 w-[220px] z-50 animate-profile-dropdown"
          role="menu"
          aria-label="Profile menu"
        >
          <div className="bg-[#111111] border border-[#272727] rounded-2xl p-2 shadow-2xl">
            <p className="text-xs text-[#525252] px-2 py-1.5 font-medium tracking-wide">
              Workspaces
            </p>

            <div
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#1a1a1a] mb-0.5"
              role="menuitem"
            >
              <div className="w-6 h-6 rounded-lg bg-[#272727] flex items-center justify-center text-xs text-[#e5e5e5] font-semibold flex-none">
                D
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[#e5e5e5] font-medium leading-tight">Default Workspace</p>
                <p className="text-xs text-[#525252] leading-tight">Free</p>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#1a1a1a] transition-colors"
              role="menuitem"
            >
              <Plus size={14} className="text-[#525252]" />
              <span className="text-sm text-[#525252]">Add workspace</span>
            </button>

            <div className="h-px bg-[#1f1f1f] my-1.5" />

            <div
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#1a1a1a] mb-0.5"
              role="menuitem"
            >
              <div className="w-2 h-2 rounded-full bg-[#22c55e] flex-none mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm text-[#e5e5e5] font-medium leading-tight">86 Credits remaining</p>
                <p className="text-xs text-[#525252] leading-tight">100 per day</p>
              </div>
            </div>

            <div className="h-px bg-[#1f1f1f] my-1.5" />

            {MENU_ITEMS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                role="menuitem"
              >
                <Icon size={15} className="text-[#525252]" />
                <span className="text-sm text-[#e5e5e5]">{label}</span>
              </button>
            ))}

            <div className="h-px bg-[#1f1f1f] my-1.5" />

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors"
              role="menuitem"
            >
              <LogOut size={15} className="text-[#525252]" />
              <span className="text-sm text-[#e5e5e5]">Log out</span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 mx-0 rounded-xl hover:bg-[var(--input-bg)] transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-[#272727] flex items-center justify-center text-sm text-white font-medium flex-shrink-0">
          {initial}
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-sm font-medium truncate max-w-[120px]" style={{ color: "var(--text-primary)" }}>
            {name}
          </span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>Free</span>
        </div>
      </button>
    </div>
  );
}
