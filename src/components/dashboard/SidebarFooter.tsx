"use client";

import { useUser } from "@clerk/nextjs";
import { useUIStore } from "@/store/ui";
import SidebarProfile from "./SidebarProfile";

type Props = {
  collapsed: boolean;
};

export default function SidebarFooter({ collapsed }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const { openAuthModal } = useUIStore();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="w-8 h-8 rounded-full bg-[#1c1c1e] animate-pulse flex-none" />
        {!collapsed && (
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-[#1c1c1e] rounded animate-pulse w-24" />
            <div className="h-2.5 bg-[#1c1c1e] rounded animate-pulse w-12" />
          </div>
        )}
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        className="w-full flex items-center justify-center py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-xl transition-colors"
      >
        {collapsed ? "→" : "Sign in"}
      </button>
    );
  }

  return <SidebarProfile collapsed={collapsed} />;
}