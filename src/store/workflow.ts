import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { current } from "immer";
import type { WorkflowNode, WorkflowEdge, NodeData, RunStatus } from "@/types/workflow";

interface UndoSnapshot {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const MAX_UNDO = 50;

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  workflowId: string | null;
  workflowName: string;
  runStatus: RunStatus | null;
  executingNodeIds: Set<string>;
  failedNodeIds: Set<string>;
  undoStack: UndoSnapshot[];
  redoStack: UndoSnapshot[];
  activeTool: string;
  assetUrls: string[];
}

interface WorkflowActions {
  setNodes: (nodes: WorkflowNode[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  removeNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  setEdges: (edges: WorkflowEdge[]) => void;
  addEdge: (edge: WorkflowEdge) => void;
  removeEdge: (edgeId: string) => void;

  setWorkflowId: (id: string) => void;
  setWorkflowName: (name: string) => void;
  loadWorkflow: (id: string, name: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;

  setRunStatus: (status: RunStatus | null) => void;
  setExecutingNodeIds: (ids: Set<string>) => void;
  setFailedNodeIds: (ids: Set<string>) => void;
  resetExecutionState: () => void;

  setActiveTool: (tool: string) => void;
  addAssetUrl: (url: string) => void;
  groupSelectedNodes: () => void;
  ungroupNodes: (groupId: string) => void;

  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
}

type WorkflowStore = WorkflowState & WorkflowActions;

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  workflowId: null,
  workflowName: "Untitled Workflow",
  runStatus: null,
  executingNodeIds: new Set(),
  failedNodeIds: new Set(),
  undoStack: [],
  redoStack: [],
  activeTool: "select",
  assetUrls: [],
};

function snapshot(nodes: WorkflowNode[], edges: WorkflowEdge[]): UndoSnapshot {
  return { nodes, edges };
}

export const useWorkflowStore = create<WorkflowStore>()(
  immer((set, get) => ({
    ...initialState,

    setNodes: (nodes) =>
      set((state) => { state.nodes = nodes as typeof state.nodes; }),

    addNode: (node) =>
      set((state) => {
        const snap = snapshot(current(state.nodes) as WorkflowNode[], current(state.edges) as WorkflowEdge[]);
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.nodes.push(node as typeof state.nodes[0]);
      }),

    updateNodeData: (nodeId, data) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) Object.assign(node.data, data);
      }),

    removeNode: (nodeId) =>
      set((state) => {
        const all = current(state.nodes) as WorkflowNode[];
        const allEdges = current(state.edges) as WorkflowEdge[];

        const snap = snapshot(all, allEdges);
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];

        const target = all.find((n) => n.id === nodeId);

        if (target?.type === "group") {
          // detach children and restore their absolute positions before removing the group
          const detached = all.map((n): WorkflowNode => {
            if (n.parentId !== nodeId) return n;
            const { parentId: _p, extent: _e, ...rest } = n;
            return {
              ...rest,
              position: {
                x: target.position.x + n.position.x,
                y: target.position.y + n.position.y,
              },
            };
          });
          state.nodes = detached.filter((n) => n.id !== nodeId) as typeof state.nodes;
        } else {
          state.nodes = all.filter((n) => n.id !== nodeId) as typeof state.nodes;
        }

        state.edges = allEdges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        ) as typeof state.edges;
      }),

    deleteNode: (nodeId) => get().removeNode(nodeId),

    setEdges: (edges) =>
      set((state) => { state.edges = edges as typeof state.edges; }),

    addEdge: (edge) =>
      set((state) => {
        const snap = snapshot(current(state.nodes) as WorkflowNode[], current(state.edges) as WorkflowEdge[]);
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.edges.push(edge as typeof state.edges[0]);
      }),

    removeEdge: (edgeId) =>
      set((state) => {
        const snap = snapshot(current(state.nodes) as WorkflowNode[], current(state.edges) as WorkflowEdge[]);
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.edges = state.edges.filter((e) => e.id !== edgeId);
      }),

    setWorkflowId: (id) =>
      set((state) => { state.workflowId = id; }),

    setWorkflowName: (name) =>
      set((state) => { state.workflowName = name; }),

    loadWorkflow: (id, name, nodes, edges) =>
      set((state) => {
        state.workflowId = id;
        state.workflowName = name;
        state.nodes = nodes as typeof state.nodes;
        state.edges = edges as typeof state.edges;
        state.runStatus = null;
        state.executingNodeIds = new Set();
        state.failedNodeIds = new Set();
        state.undoStack = [];
        state.redoStack = [];
      }),

    setRunStatus: (status) =>
      set((state) => { state.runStatus = status; }),

    setExecutingNodeIds: (ids) =>
      set((state) => { state.executingNodeIds = ids; }),

    setFailedNodeIds: (ids) =>
      set((state) => { state.failedNodeIds = ids; }),

    resetExecutionState: () =>
      set((state) => {
        state.runStatus = null;
        state.executingNodeIds = new Set();
        state.failedNodeIds = new Set();
      }),

    setActiveTool: (tool) =>
      set((state) => { state.activeTool = tool; }),

    addAssetUrl: (url) =>
      set((state) => { state.assetUrls.push(url); }),

    groupSelectedNodes: () =>
      set((state) => {
        const all = current(state.nodes) as WorkflowNode[];
        const sel = all.filter((n) => n.selected && !n.parentId);
        if (sel.length < 2) return;
        let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
        for (const n of sel) {
          x0 = Math.min(x0, n.position.x);
          y0 = Math.min(y0, n.position.y);
          x1 = Math.max(x1, n.position.x + (n.width ?? 240));
          y1 = Math.max(y1, n.position.y + (n.height ?? 100));
        }
        const P = 24, gid = crypto.randomUUID(), gx = x0 - P, gy = y0 - P;
        const group: WorkflowNode = {
          id: gid, type: "group",
          position: { x: gx, y: gy },
          style: { width: x1 - x0 + P * 2, height: y1 - y0 + P * 2 },
          data: { type: "group", label: "Group 1" },
          selected: true,
        };
        const kids = sel.map((n) => ({
          ...n, parentId: gid, extent: "parent" as const, selected: false,
          position: { x: n.position.x - gx, y: n.position.y - gy },
        }));
        state.nodes = [group, ...all.filter((n) => !n.selected || n.parentId), ...kids] as typeof state.nodes;
      }),

    ungroupNodes: (groupId) =>
      set((state) => {
        const all = current(state.nodes) as WorkflowNode[];
        const group = all.find((n) => n.id === groupId);
        if (!group) return;
        const ungrouped = all
          .filter((n) => n.parentId === groupId)
          .map(({ parentId: _p, extent: _e, ...rest }) => ({
            ...rest,
            position: { x: rest.position.x + group.position.x, y: rest.position.y + group.position.y },
            selected: true,
          }));
        state.nodes = [
          ...all.filter((n) => n.id !== groupId && n.parentId !== groupId),
          ...ungrouped,
        ] as typeof state.nodes;
      }),

    clearCanvas: () =>
      set((state) => {
        const snap = snapshot(current(state.nodes) as WorkflowNode[], current(state.edges) as WorkflowEdge[]);
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.nodes = [];
        state.edges = [];
      }),

    undo: () =>
      set((state) => {
        const snap = state.undoStack.pop();
        if (!snap) return;
        state.redoStack.push(snapshot(current(state.nodes) as WorkflowNode[], current(state.edges) as WorkflowEdge[]));
        state.nodes = snap.nodes as typeof state.nodes;
        state.edges = snap.edges as typeof state.edges;
      }),

    redo: () =>
      set((state) => {
        const snap = state.redoStack.pop();
        if (!snap) return;
        state.undoStack.push(snapshot(current(state.nodes) as WorkflowNode[], current(state.edges) as WorkflowEdge[]));
        state.nodes = snap.nodes as typeof state.nodes;
        state.edges = snap.edges as typeof state.edges;
      }),
  }))
);

export const useWorkflow = useWorkflowStore;
