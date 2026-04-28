"use client";

import { useState } from "react";
import { Scissors } from "lucide-react";
import CanvasFlow from "./CanvasFlow";
import { useWorkflowStore } from "@/store/workflow";

export default function WorkflowCanvas() {
  const activeTool = useWorkflowStore((s) => s.activeTool);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <main
      className="relative w-full h-full"
      style={{ background: "var(--canvas-bg)", cursor: activeTool === "scissors" ? "none" : undefined }}
      onMouseMove={(e) => {
        if (activeTool === "scissors") setMousePos({ x: e.clientX, y: e.clientY });
      }}
    >
      <CanvasFlow />
      {activeTool === "scissors" && (
        <div
          className="fixed pointer-events-none z-50"
          style={{ left: mousePos.x + 8, top: mousePos.y + 8 }}
        >
          <Scissors size={20} className="text-white drop-shadow-lg" />
        </div>
      )}
    </main>
  );
}
