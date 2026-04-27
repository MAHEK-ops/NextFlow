import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
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

  const parsed = CreateWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid request body",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  const workflow = await db.workflow.create({
    data: {
      userId,
      name: parsed.data.name,
      nodes: [],
      edges: [],
    },
    select: { id: true, name: true },
  });

  return NextResponse.json(workflow, { status: 201 });
}
