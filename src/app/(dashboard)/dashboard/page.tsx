import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <DashboardClient workflows={[]} isSignedIn={false} />;
  }

  const workflows = await db.workflow.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true, previewSvg: true },
  });

  const serialized = workflows.map((w) => ({
    id: w.id,
    name: w.name,
    updatedAt: w.updatedAt.toISOString(),
    previewSvg: w.previewSvg ?? null,
  }));

  return <DashboardClient workflows={serialized} isSignedIn={true} />;
}
