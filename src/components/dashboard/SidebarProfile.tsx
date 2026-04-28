"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SidebarProfile() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const initial = mounted
    ? (user?.firstName?.[0] ?? user?.username?.[0] ?? "U").toUpperCase()
    : "U";
  const name = mounted ? (user?.username ?? user?.firstName ?? "User") : "User";

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 mx-1 rounded-xl hover:bg-[var(--input-bg)] transition-colors cursor-pointer">
      <div className="w-9 h-9 rounded-xl bg-[#1c1c1e] border border-[#272727] flex items-center justify-center text-sm text-white font-medium flex-shrink-0">
        {initial}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate max-w-[120px]" style={{ color: "var(--text-primary)" }}>{name}</span>
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>Free</span>
      </div>
    </div>
  );
}
