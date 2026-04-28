import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
