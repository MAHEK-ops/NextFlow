import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nodes: z.array(z.unknown()).optional(),
  edges: z.array(z.unknown()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const workflow = await db.workflow.findUnique({ where: { id: params.id } });

  if (!workflow || workflow.userId !== userId) {
    return NextResponse.json({ error: "Workflow not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    id: workflow.id,
    userId: workflow.userId,
    name: workflow.name,
    nodes: workflow.nodes as unknown as WorkflowNode[],
    edges: workflow.edges as unknown as WorkflowEdge[],
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const existing = await db.workflow.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Workflow not found", code: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const parsed = UpdateWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid request body",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  const { name, nodes, edges } = parsed.data;

  const updated = await db.workflow.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(nodes !== undefined && { nodes: nodes as Prisma.InputJsonValue }),
      ...(edges !== undefined && { edges: edges as Prisma.InputJsonValue }),
    },
    select: { id: true, name: true, updatedAt: true },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const existing = await db.workflow.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Workflow not found", code: "NOT_FOUND" }, { status: 404 });
  }

  await db.workflow.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
