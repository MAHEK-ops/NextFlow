import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { WorkflowRunRecord, NodeExecutionRecord, RunStatus, RunScope } from "@/types/workflow";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const workflow = await db.workflow.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!workflow || workflow.userId !== userId) {
    return NextResponse.json({ error: "Workflow not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const rows = await db.workflowRun.findMany({
    where: { workflowId: params.id, userId },
    include: { executions: true },
    orderBy: { createdAt: "desc" },
  });

  const runs: WorkflowRunRecord[] = rows.map((run) => ({
    id: run.id,
    workflowId: run.workflowId,
    userId: run.userId,
    status: run.status as RunStatus,
    scope: run.scope as RunScope,
    duration: run.duration,
    createdAt: run.createdAt.toISOString(),
    executions: run.executions.map(
      (exec): NodeExecutionRecord => ({
        id: exec.id,
        runId: exec.runId,
        nodeId: exec.nodeId,
        nodeType: exec.nodeType,
        status: exec.status,
        inputs: exec.inputs as Record<string, unknown>,
        outputs: exec.outputs as Record<string, unknown>,
        duration: exec.duration,
        error: exec.error,
        createdAt: exec.createdAt.toISOString(),
      })
    ),
  }));

  return NextResponse.json({ runs });
}
