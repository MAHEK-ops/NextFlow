import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Home, Layers, Image, Video, Zap } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <aside className="w-[220px] flex-none flex flex-col bg-[#0f0f0f] border-r border-[#1a1a1a] h-full">
        <div className="flex-1 overflow-y-auto py-3">
          <nav className="px-2 flex flex-col gap-0.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] transition-colors text-sm"
            >
              <Home size={15} />
              Home
            </Link>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1a1a1a] text-white text-sm cursor-default">
              <Layers size={15} />
              Node Editor
            </div>
          </nav>

          <div className="mt-4 px-3">
            <p className="text-[10px] uppercase tracking-wider text-[#3a3a3a] px-1 mb-1">Tools</p>
            <nav className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#525252] text-sm cursor-not-allowed">
                <Image size={15} />
                Image
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#525252] text-sm cursor-not-allowed">
                <Video size={15} />
                Video
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#525252] text-sm cursor-not-allowed">
                <Zap size={15} />
                Enhancer
              </div>
            </nav>
          </div>
        </div>

        <div className="p-3 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <UserButton afterSignOutUrl="/sign-in" />
            <span className="text-xs text-[#525252] truncate">My Account</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}