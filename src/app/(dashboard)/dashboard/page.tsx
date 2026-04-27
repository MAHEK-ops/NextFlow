import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import NewWorkflowButton from "@/components/dashboard/NewWorkflowButton";
import LoadSampleButton from "@/components/dashboard/LoadSampleButton";
import DeleteWorkflowButton from "@/components/dashboard/DeleteWorkflowButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const workflows = await db.workflow.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-white">Your Workflows</h1>
            <p className="text-sm text-[#525252] mt-1">Build and run AI pipelines visually</p>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <LoadSampleButton />
            <NewWorkflowButton />
          </div>
        </div>

        {workflows.length === 0 ? (
          <div className="border border-dashed border-[#272727] rounded-xl p-12 flex flex-col items-center gap-4">
            <p className="text-sm text-[#525252]">No workflows yet</p>
            <NewWorkflowButton label="Create your first workflow" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workflows.map((w) => (
              <div
                key={w.id}
                className="relative rounded-xl bg-[#111111] border border-[#1f1f1f] hover:border-[#272727] transition-colors"
              >
                <Link href={`/workflow/${w.id}`} className="block p-4 pr-10">
                  <p className="text-sm font-medium text-white">{w.name}</p>
                  <p className="text-xs text-[#525252] mt-1">
                    Updated {formatDistanceToNow(new Date(w.updatedAt), { addSuffix: true })}
                  </p>
                </Link>
                <div className="absolute top-3 right-3">
                  <DeleteWorkflowButton workflowId={w.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
