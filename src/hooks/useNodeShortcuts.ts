import { useCallback, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { useWorkflowStore } from "@/store/workflow";
import { DEFAULT_NODE_DATA } from "@/lib/node-defaults";
import type { NodeType, WorkflowNode } from "@/types/workflow";

const TYPE_MAP: Record<string, NodeType> = {
  t: "text",
  i: "upload-image",
  v: "upload-video",
  l: "llm",
  c: "crop-image",
  e: "extract-frame",
};

export function useNodeShortcuts(
  showShortcuts: boolean,
  onCloseShortcuts: () => void,
  onOpenNodePicker: () => void
) {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);

  const addNodeAtCenter = useCallback(
    (nodeType: NodeType) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        position,
        data: DEFAULT_NODE_DATA[nodeType],
      };
      addNode(newNode);
    },
    [addNode, screenToFlowPosition]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || e.metaKey || e.ctrlKey) return;

      if (e.key === "Escape") {
        if (showShortcuts) {
          onCloseShortcuts();
        } else {
          const { nodes, setNodes } = useWorkflowStore.getState();
          setNodes(nodes.map((n) => ({ ...n, selected: false })));
        }
        return;
      }

      if (e.key === "n") {
        e.preventDefault();
        onOpenNodePicker();
        return;
      }

      const mappedType = TYPE_MAP[e.key];
      if (mappedType) {
        e.preventDefault();
        addNodeAtCenter(mappedType);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showShortcuts, onCloseShortcuts, onOpenNodePicker, addNodeAtCenter]);
}
