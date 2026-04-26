import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { WorkflowNode, WorkflowEdge, NodeData, RunStatus } from "@/types/workflow";

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  workflowId: string | null;
  workflowName: string;
  runStatus: RunStatus | null;
  executingNodeIds: Set<string>;
  failedNodeIds: Set<string>;
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
};

export const useWorkflowStore = create<WorkflowStore>()(
  immer((set) => ({
    ...initialState,

    setNodes: (nodes) =>
      set((state) => {
        state.nodes = nodes;
      }),

    addNode: (node) =>
      set((state) => {
        state.nodes.push(node);
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
        state.nodes = state.nodes.filter((n) => n.id !== nodeId);
        state.edges = state.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );
      }),

    setEdges: (edges) =>
      set((state) => {
        state.edges = edges;
      }),

    addEdge: (edge) =>
      set((state) => {
        state.edges.push(edge);
      }),

    removeEdge: (edgeId) =>
      set((state) => {
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
        state.nodes = nodes;
        state.edges = edges;
        state.runStatus = null;
        state.executingNodeIds = new Set();
        state.failedNodeIds = new Set();
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
        state.nodes = [];
        state.edges = [];
      }),
  }))
);

export const useWorkflow = useWorkflowStore;
