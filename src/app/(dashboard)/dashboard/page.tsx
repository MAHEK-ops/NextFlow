import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import NewWorkflowButton from "@/components/dashboard/NewWorkflowButton";

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
    <main className="min-h-screen bg-canvas text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <NewWorkflowButton />
        </div>

        {workflows.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No workflows yet. Create one to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {workflows.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/workflow/${w.id}`}
                  className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg hover:border-border-strong transition-colors"
                >
                  <span className="font-medium">{w.name}</span>
                  <span className="text-foreground-tertiary text-xs">
                    {new Date(w.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
