import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AuthModal from "@/components/auth/AuthModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <DashboardSidebar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <AuthModal />
    </div>
  );
}
