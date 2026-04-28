import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <DashboardSidebar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
