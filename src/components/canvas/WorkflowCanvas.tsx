"use client";

import CanvasFlow from "./CanvasFlow";

export default function WorkflowCanvas() {
  return (
    <main className="relative w-full h-full" style={{ background: "var(--canvas-bg)" }}>
      <CanvasFlow />
    </main>
  );
}
