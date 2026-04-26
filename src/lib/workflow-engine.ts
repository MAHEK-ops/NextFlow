import type { WorkflowNode, WorkflowEdge, ExecutionLayer, RunOptions, RunStatus } from "@/types/workflow";

export function detectCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const node of nodes) adj.set(node.id, []);
  for (const edge of edges) adj.get(edge.source)?.push(edge.target);

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string): boolean {
    visited.add(id);
    inStack.add(id);
    for (const neighbor of adj.get(id) ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (inStack.has(neighbor)) {
        return true;
      }
    }
    inStack.delete(id);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) return true;
  }
  return false;
}

export function buildExecutionLayers(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ExecutionLayer[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const nodeMap = new Map<string, WorkflowNode>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adj.set(node.id, []);
    nodeMap.set(node.id, node);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const layers: ExecutionLayer[] = [];
  let queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0);

  while (queue.length > 0) {
    layers.push({ nodes: queue });
    const next: WorkflowNode[] = [];
    for (const node of queue) {
      for (const neighborId of adj.get(node.id) ?? []) {
        const deg = (inDegree.get(neighborId) ?? 0) - 1;
        inDegree.set(neighborId, deg);
        if (deg === 0) {
          const neighbor = nodeMap.get(neighborId);
          if (neighbor) next.push(neighbor);
        }
      }
    }
    queue = next;
  }

  return layers;
}

export function resolveNodeInputs(
  node: WorkflowNode,
  edges: WorkflowEdge[],
  outputs: Map<string, Record<string, unknown>>
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  for (const edge of edges) {
    if (edge.target !== node.id) continue;
    const sourceOutputs = outputs.get(edge.source);
    if (!sourceOutputs) continue;
    const sourceHandle = edge.sourceHandle ?? "output";
    const targetHandle = edge.targetHandle ?? "input";
    inputs[targetHandle] = sourceOutputs[sourceHandle];
  }
  return inputs;
}

export async function runWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: RunOptions,
  callbacks: {
    onNodeStart: (nodeId: string) => void;
    onNodeComplete: (nodeId: string, outputs: Record<string, unknown>) => void;
    onNodeError: (nodeId: string, error: string) => void;
    executeNode: (node: WorkflowNode, inputs: Record<string, unknown>) => Promise<Record<string, unknown>>;
  }
): Promise<{ status: RunStatus; duration: number }> {
  if (detectCycle(nodes, edges)) {
    throw new Error("Workflow contains a cycle and cannot be executed");
  }

  const layers = buildExecutionLayers(nodes, edges);
  const outputs = new Map<string, Record<string, unknown>>();
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  const targetIds =
    options.scope !== "full" && options.selectedNodeIds
      ? new Set(options.selectedNodeIds)
      : null;

  for (const layer of layers) {
    const layerNodes = targetIds
      ? layer.nodes.filter((n) => targetIds.has(n.id))
      : layer.nodes;

    if (layerNodes.length === 0) continue;

    await Promise.all(
      layerNodes.map(async (node) => {
        callbacks.onNodeStart(node.id);
        try {
          const inputs = resolveNodeInputs(node, edges, outputs);
          const nodeOutputs = await callbacks.executeNode(node, inputs);
          outputs.set(node.id, nodeOutputs);
          callbacks.onNodeComplete(node.id, nodeOutputs);
          successCount++;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          callbacks.onNodeError(node.id, message);
          failCount++;
        }
      })
    );
  }

  const duration = Date.now() - startTime;

  let status: RunStatus;
  if (failCount === 0) {
    status = "success";
  } else if (successCount === 0) {
    status = "failed";
  } else {
    status = "partial";
  }

  return { status, duration };
}
