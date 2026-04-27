import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

export function exportWorkflowAsJson(
  name: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): void {
  const data = { name, nodes, edges, exportedAt: new Date().toISOString() };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.json`;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

export function parseWorkflowJson(raw: string): {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (
      typeof data !== "object" ||
      data === null ||
      !Array.isArray((data as Record<string, unknown>).nodes) ||
      !Array.isArray((data as Record<string, unknown>).edges)
    ) {
      return null;
    }
    const obj = data as { name?: unknown; nodes: WorkflowNode[]; edges: WorkflowEdge[] };
    return {
      name: typeof obj.name === "string" ? obj.name : "Imported Workflow",
      nodes: obj.nodes,
      edges: obj.edges,
    };
  } catch {
    return null;
  }
}
