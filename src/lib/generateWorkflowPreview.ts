import { getNodesBounds, getViewportForBounds } from "reactflow";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { NODE_COLORS } from "@/types/workflow";

const PREVIEW_W = 300;
const PREVIEW_H = 200;
const PADDING = 0.18; // slightly higher for better spacing

function nodeColor(type: string): string {
  return NODE_COLORS[type as keyof typeof NODE_COLORS] ?? "#525252";
}

function bezierPath(sx: number, sy: number, tx: number, ty: number): string {
  const cx = Math.abs(tx - sx) * 0.5;
  return `M${sx},${sy} C${sx + cx},${sy} ${tx - cx},${ty} ${tx},${ty}`;
}

function fallbackSvg(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PREVIEW_W} ${PREVIEW_H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">` +
    `<rect width="${PREVIEW_W}" height="${PREVIEW_H}" fill="#111111"/>` +
    `<rect x="100" y="85" width="100" height="30" rx="10" fill="#1f1f1f" stroke="#2a2a2a" stroke-width="1.5"/>` +
    `<text x="150" y="105" text-anchor="middle" font-size="11" fill="#525252" font-family="system-ui,sans-serif">Empty workflow</text>` +
    `</svg>`
  );
}

export function generateWorkflowPreview(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string {
  const visible = nodes.filter((n) => n.type !== "group");
  if (visible.length === 0) return fallbackSvg();

  const sized = visible.map((n) => ({
    ...n,
    width: n.width ?? 200,
    height: n.height ?? 80,
  }));

  const bounds = getNodesBounds(sized);

  const viewport = getViewportForBounds(
    bounds,
    PREVIEW_W,
    PREVIEW_H,
    0.5,
    2,
    PADDING
  );

  const { x: vx, y: vy, zoom } = viewport;

  // normalize positions relative to bounds
  const tx = (x: number) => x - bounds.x;
  const ty = (y: number) => y - bounds.y;

  // keep strokes visually consistent
  const strokeW = 1.5 / zoom;
  const edgeW = 2 / zoom;
  const handleR = 4.5 / zoom;
  const cornerR = 14 / zoom;

  // -------- edges --------
  const edgeSvg = edges
    .map((edge) => {
      const src = sized.find((n) => n.id === edge.source);
      const tgt = sized.find((n) => n.id === edge.target);
      if (!src || !tgt) return "";

      const sx = tx(src.position.x + src.width);
      const sy = ty(src.position.y + src.height / 2);

      const txPos = tx(tgt.position.x);
      const tyPos = ty(tgt.position.y + tgt.height / 2);

      return (
        `<path d="${bezierPath(sx, sy, txPos, tyPos)}" ` +
        `stroke="#7c3aed" stroke-width="${edgeW}" fill="none" stroke-linecap="round" opacity="0.9"/>`
      );
    })
    .filter(Boolean)
    .join("");

  // -------- nodes --------
  const nodeSvg = sized
    .map((node) => {
      const x = tx(node.position.x);
      const y = ty(node.position.y);
      const w = node.width;
      const h = node.height;
      const color = nodeColor(node.data?.type ?? "");

      return (
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${cornerR}" ` +
        `fill="#1a1a1a" stroke="${color}" stroke-width="${strokeW}"/>` +
        `<circle cx="${x}" cy="${y + h / 2}" r="${handleR}" fill="${color}" opacity="0.9"/>` +
        `<circle cx="${x + w}" cy="${y + h / 2}" r="${handleR}" fill="${color}" opacity="0.9"/>`
      );
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PREVIEW_W} ${PREVIEW_H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">` +
    `<rect width="${PREVIEW_W}" height="${PREVIEW_H}" fill="#111111"/>` +
    `<g transform="translate(${vx},${vy}) scale(${zoom})">` +
    edgeSvg +
    nodeSvg +
    `</g>` +
    `</svg>`
  );
}