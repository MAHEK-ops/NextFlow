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
}

interface WorkflowActions {
  setNodes: (nodes: WorkflowNode[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  removeNode: (nodeId: string) => void;

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
};

function snapshot(nodes: WorkflowNode[], edges: WorkflowEdge[]): UndoSnapshot {
  return { nodes, edges };
}

export const useWorkflowStore = create<WorkflowStore>()(
  immer((set) => ({
    ...initialState,

    setNodes: (nodes) =>
      set((state) => {
        state.nodes = nodes as typeof state.nodes;
      }),

    addNode: (node) =>
      set((state) => {
        const snap = snapshot(
          current(state.nodes) as WorkflowNode[],
          current(state.edges) as WorkflowEdge[]
        );
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.nodes.push(node as typeof state.nodes[0]);
      }),

    updateNodeData: (nodeId, data) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          Object.assign(node.data, data);
        }
      }),

    removeNode: (nodeId) =>
      set((state) => {
        const snap = snapshot(
          current(state.nodes) as WorkflowNode[],
          current(state.edges) as WorkflowEdge[]
        );
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.nodes = state.nodes.filter((n) => n.id !== nodeId);
        state.edges = state.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );
      }),

    setEdges: (edges) =>
      set((state) => {
        state.edges = edges as typeof state.edges;
      }),

    addEdge: (edge) =>
      set((state) => {
        const snap = snapshot(
          current(state.nodes) as WorkflowNode[],
          current(state.edges) as WorkflowEdge[]
        );
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.edges.push(edge as typeof state.edges[0]);
      }),

    removeEdge: (edgeId) =>
      set((state) => {
        const snap = snapshot(
          current(state.nodes) as WorkflowNode[],
          current(state.edges) as WorkflowEdge[]
        );
        if (state.undoStack.length >= MAX_UNDO) state.undoStack.shift();
        state.undoStack.push(snap);
        state.redoStack = [];
        state.edges = state.edges.filter((e) => e.id !== edgeId);
      }),

    setWorkflowId: (id) =>
      set((state) => {
        state.workflowId = id;
      }),

    setWorkflowName: (name) =>
      set((state) => {
        state.workflowName = name;
      }),

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
      set((state) => {
        state.runStatus = status;
      }),

    setExecutingNodeIds: (ids) =>
      set((state) => {
        state.executingNodeIds = ids;
      }),

    setFailedNodeIds: (ids) =>
      set((state) => {
        state.failedNodeIds = ids;
      }),

    resetExecutionState: () =>
      set((state) => {
        state.runStatus = null;
        state.executingNodeIds = new Set();
        state.failedNodeIds = new Set();
      }),

    clearCanvas: () =>
      set((state) => {
        const snap = snapshot(
          current(state.nodes) as WorkflowNode[],
          current(state.edges) as WorkflowEdge[]
        );
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
        state.redoStack.push(
          snapshot(
            current(state.nodes) as WorkflowNode[],
            current(state.edges) as WorkflowEdge[]
          )
        );
        state.nodes = snap.nodes as typeof state.nodes;
        state.edges = snap.edges as typeof state.edges;
      }),

    redo: () =>
      set((state) => {
        const snap = state.redoStack.pop();
        if (!snap) return;
        state.undoStack.push(
          snapshot(
            current(state.nodes) as WorkflowNode[],
            current(state.edges) as WorkflowEdge[]
          )
        );
        state.nodes = snap.nodes as typeof state.nodes;
        state.edges = snap.edges as typeof state.edges;
      }),
  }))
);

export const useWorkflow = useWorkflowStore;
