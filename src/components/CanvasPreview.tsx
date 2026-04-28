"use client";

interface Node {
  id: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

interface Edge {
  source: string;
  target: string;
}

export default function CanvasPreview({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <svg
      viewBox="-50 -50 800 600"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Edges */}
      {edges.map((edge, i) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);

        if (!source || !target) return null;

        const x1 = source.position.x + 120;
        const y1 = source.position.y + 40;
        const x2 = target.position.x;
        const y2 = target.position.y + 40;

        return (
          <path
            key={i}
            d={`M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80} ${y2}, ${x2} ${y2}`}
            stroke="#7c3aed"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <g key={node.id}>
          <rect
            x={node.position.x}
            y={node.position.y}
            width={node.width || 180}
            height={node.height || 100}
            rx="20"
            fill="#3a3a3a"
            stroke="#525252"
            strokeWidth="2"
          />
          <circle
            cx={node.position.x + (node.width || 180)}
            cy={node.position.y + 20}
            r="6"
            fill="#22c55e"
          />
        </g>
      ))}
    </svg>
  );
}