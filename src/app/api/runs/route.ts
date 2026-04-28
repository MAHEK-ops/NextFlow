export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { runWorkflow } from "@/lib/workflow-engine";
import { executeLlmNode } from "@/lib/execute-llm";
import { executeCropNode } from "@/lib/execute-crop";
import { executeExtractFrameNode } from "@/lib/execute-extract-frame";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const RunRequestSchema = z.object({
  workflowId: z.string(),
  scope: z.enum(["full", "partial", "single"]),
  selectedNodeIds: z.array(z.string()).optional(),
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
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

  const parsed = RunRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid request body",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  const { workflowId, scope, selectedNodeIds, nodes: rawNodes, edges: rawEdges } = parsed.data;
  const nodes = rawNodes as WorkflowNode[];
  const edges = rawEdges as WorkflowEdge[];

  const nodeMap = new Map<string, WorkflowNode>(nodes.map((n) => [n.id, n]));
  const nodeStartTimes = new Map<string, number>();
  const nodeExecutionIds = new Map<string, string>();
  const nodeInputsMap = new Map<string, Record<string, unknown>>();

  let runId: string;
  try {
    const workflowRun = await db.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: "running",
        scope,
        duration: 0,
      },
    });
    runId = workflowRun.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create run record";
    return NextResponse.json({ error: message, code: "DB_ERROR" }, { status: 500 });
  }

  try {
    const { status, duration } = await runWorkflow(
      nodes,
      edges,
      { scope, selectedNodeIds },
      {
        onNodeStart: async (nodeId) => {
          nodeStartTimes.set(nodeId, Date.now());
          const node = nodeMap.get(nodeId);
          const record = await db.nodeExecution.create({
            data: {
              runId,
              nodeId,
              nodeType: node?.type ?? "unknown",
              status: "running",
              inputs: {},
              outputs: {},
              duration: 0,
            },
          });
          nodeExecutionIds.set(nodeId, record.id);
        },

        onNodeComplete: async (nodeId, outputs) => {
          const execId = nodeExecutionIds.get(nodeId);
          const startTime = nodeStartTimes.get(nodeId) ?? Date.now();
          const inputs = nodeInputsMap.get(nodeId) ?? {};
          if (execId) {
            await db.nodeExecution.update({
              where: { id: execId },
              data: {
                status: "success",
                inputs: inputs as Prisma.InputJsonValue,
                outputs: outputs as Prisma.InputJsonValue,
                duration: Date.now() - startTime,
              },
            });
          }
        },

        onNodeError: async (nodeId, error) => {
          const execId = nodeExecutionIds.get(nodeId);
          const startTime = nodeStartTimes.get(nodeId) ?? Date.now();
          const inputs = nodeInputsMap.get(nodeId) ?? {};
          if (execId) {
            await db.nodeExecution.update({
              where: { id: execId },
              data: {
                status: "failed",
                inputs: inputs as Prisma.InputJsonValue,
                error,
                duration: Date.now() - startTime,
              },
            });
          }
        },

        executeNode: async (node, inputs) => {
          nodeInputsMap.set(node.id, inputs);
          const data = node.data;
          switch (data.type) {
            case "text":
              return { output: data.text };
            case "upload-image":
              return { output: data.imageUrl };
            case "upload-video":
              return { output: data.videoUrl };
            case "llm":
              return executeLlmNode(data, inputs);
            case "crop-image":
              return executeCropNode(data, inputs);
            case "extract-frame":
              return executeExtractFrameNode(data, inputs);
            case "group":
              return {};
          }
        },
      }
    );

    await db.workflowRun.update({
      where: { id: runId },
      data: { status, duration },
    });

    return NextResponse.json({ runId, status, duration });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Workflow execution failed";
    try {
      await db.workflowRun.update({
        where: { id: runId },
        data: { status: "failed", duration: 0 },
      });
    } catch {
      // best-effort update
    }
    return NextResponse.json({ error: message, code: "EXECUTION_ERROR" }, { status: 500 });
  }
}
