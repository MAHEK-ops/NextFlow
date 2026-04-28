import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import WorkflowShell from "@/components/canvas/WorkflowShell";

export const dynamic = "force-dynamic";

interface WorkflowPageProps {
  params: { id: string };
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const workflow = await db.workflow.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, name: true },
  });

  if (!workflow || workflow.userId !== userId) {
    notFound();
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]">
      <WorkflowShell workflowId={workflow.id} initialName={workflow.name} />
    </div>
  );
}
