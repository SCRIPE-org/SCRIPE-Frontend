import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  STAGE_PORTS,
  normalizePortId,
  getPortSpec,
  getPortCoords,
  resolveDropTargetAtPointer,
  findDropTargetStage,
  chooseBestTargetPort,
  type StagePortSide,
  type StagePortId,
  type StagePortSpec,
} from "./crmWorkflowPortHelpers";

export {
  NODE_WIDTH,
  NODE_HEIGHT,
  STAGE_PORTS,
  normalizePortId,
  getPortSpec,
  getPortCoords,
  resolveDropTargetAtPointer,
  findDropTargetStage,
  chooseBestTargetPort,
  type StagePortSide,
  type StagePortId,
  type StagePortSpec,
};

/** Converts orthogonal waypoints into a smooth rounded-corner SVG path (r = 8px). */
export function buildRoundedOrthogonalSvgPath(rawPoints: Array<{ x: number; y: number }>, radius = 8): string {
  const pts: Array<{ x: number; y: number }> = [];
  for (const p of rawPoints) {
    const prev = pts[pts.length - 1];
    if (!prev || Math.abs(prev.x - p.x) > 0.5 || Math.abs(prev.y - p.y) > 0.5) {
      if (pts.length >= 2) {
        const p2 = pts[pts.length - 2];
        const sameX = Math.abs(p2.x - prev.x) < 0.5 && Math.abs(prev.x - p.x) < 0.5;
        const sameY = Math.abs(p2.y - prev.y) < 0.5 && Math.abs(prev.y - p.y) < 0.5;
        if (sameX || sameY) { pts[pts.length - 1] = p; continue; }
      }
      pts.push(p);
    }
  }
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1], curr = pts[i], next = pts[i + 1];
    const v1x = curr.x - prev.x, v1y = curr.y - prev.y, v2x = next.x - curr.x, v2y = next.y - curr.y;
    const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y), r = Math.min(radius, len1 / 2, len2 / 2);
    if (r < 1.5) { d += ` L ${curr.x} ${curr.y}`; continue; }
    const startX = Math.round((curr.x - (v1x / len1) * r) * 10) / 10, startY = Math.round((curr.y - (v1y / len1) * r) * 10) / 10;
    const endX = Math.round((curr.x + (v2x / len2) * r) * 10) / 10, endY = Math.round((curr.y + (v2y / len2) * r) * 10) / 10;
    d += ` L ${startX} ${startY} Q ${curr.x} ${curr.y} ${endX} ${endY}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

/** Resolves a pill center (cx, cy) so its box never overlaps any stage node, Any badge, other pill, or other vertical wire. */
export function resolveNonOverlappingPillCenter(
  initX: number, initY: number, nodes: CrmWorkflowStageNode[],
  placedPills: Array<{ x: number; y: number; w: number; h: number }>, pillW: number, pillH: number,
  vertSegments: Array<{ edgeIdx: number; x: number; minY: number; maxY: number }> = [], edgeIdx = -1,
): { x: number; y: number } {
  const candidates: Array<{ dx: number; dy: number }> = [{ dx: 0, dy: 0 }];
  for (const stepY of [0, -26, 26, -52, 52, 78, -78, 104, 130, 156, 182]) {
    for (const stepX of [0, -44, 44, -88, 88, -132, 132, -176, 176, -220, 220]) {
      if (stepX !== 0 || stepY !== 0) candidates.push({ dx: stepX, dy: stepY });
    }
  }
  const overlapsBox = (cx: number, cy: number, checkVertWires: boolean) => {
    const left = cx - pillW / 2 - 4, right = cx + pillW / 2 + 4, top = cy - pillH / 2 - 1, bottom = cy + pillH / 2 + 1;
    if (cy - pillH / 2 < 1 || left < 66) return true;
    for (const n of nodes) {
      if (right > n.x - 8 && left < n.x + NODE_WIDTH + 8 && bottom > n.y - 8 && top < n.y + NODE_HEIGHT + 8) return true;
      if (right > n.x + NODE_WIDTH + 2 && left < n.x + NODE_WIDTH + 68 && bottom > n.y - 6 && top < n.y + 58) return true;
    }
    for (const p of placedPills) {
      if (right > p.x - p.w / 2 && left < p.x + p.w / 2 && bottom > p.y - p.h / 2 && top < p.y + p.h / 2) return true;
    }
    if (checkVertWires && vertSegments.some((v) => v.edgeIdx !== edgeIdx && v.x > left + 3 && v.x < right - 3 && v.maxY > top && v.minY < bottom)) return true;
    return false;
  };
  for (const strictVert of [true, false]) {
    for (const c of candidates) {
      const cx = initX + c.dx, cy = initY + c.dy;
      if (!overlapsBox(cx, cy, strictVert)) { placedPills.push({ x: cx, y: cy, w: pillW, h: pillH }); return { x: cx, y: cy }; }
    }
  }
  const fallback = { x: initX, y: 210 + placedPills.length * 26 };
  placedPills.push({ x: fallback.x, y: fallback.y, w: pillW, h: pillH });
  return fallback;
}

export interface RoutedEdgeItem {
  key: string; tr: CrmWorkflowTransition; isSelected: boolean; path: string;
  labelX: number; labelY: number; testId: string; pillCls: string;
  sourcePort: StagePortId; targetPort: StagePortId;
}

/** Computes Jira-grade solid orthogonal edges with 8-port fan-out, distinct horizontal lanes, and obstacle avoidance. */
export function computeJiraOrthogonalEdges(
  directTransitions: CrmWorkflowTransition[], nodeMap: Map<string, CrmWorkflowStageNode>,
  selectedTransitionId: string | null, showTransitionLabels: boolean,
): RoutedEdgeItem[] {
  const allNodes = Array.from(nodeMap.values());
  const placedPills: Array<{ x: number; y: number; w: number; h: number }> = [];
  const portUsageCount = new Map<string, number>();
  const allocatedHorizLanes: Array<{ y: number; minX: number; maxX: number }> = [];
  const vertSegments: Array<{ edgeIdx: number; x: number; minY: number; maxY: number }> = [];

  const pickLeastUsedPort = (stageKey: string, candidates: StagePortId[]): StagePortId => {
    let best = candidates[0], minUsed = Infinity;
    for (const c of candidates) {
      const u = portUsageCount.get(`${stageKey}:${c}`) ?? 0;
      if (u < minUsed) { minUsed = u; best = c; }
    }
    return best;
  };
  const takePortOffset = (stageKey: string, portId: StagePortId) => {
    const k = `${stageKey}:${portId}`, used = portUsageCount.get(k) ?? 0;
    portUsageCount.set(k, used + 1);
    return used === 0 ? 0 : (used % 2 === 1 ? 1 : -1) * Math.ceil(used / 2) * 10;
  };
  const allocateHorizontalLaneY = (baseY: number, x1: number, x2: number, preferUp: boolean): number => {
    const minX = Math.min(x1, x2) - 8, maxX = Math.max(x1, x2) + 8;
    const steps = preferUp ? [0, -28, 28, -56, 56, -84, 84, 112, 140] : [0, 28, -28, 56, -56, 84, -84, 112, 140];
    const isBlocked = (y: number) =>
      y < 12 ||
      allNodes.some((n) => y > n.y - 12 && y < n.y + NODE_HEIGHT + 12 && maxX > n.x - 10 && minX < n.x + NODE_WIDTH + 60) ||
      allocatedHorizLanes.some((l) => Math.abs(l.y - y) < 22 && maxX > l.minX && minX < l.maxX);
    for (const dy of steps) {
      const candY = baseY + dy;
      if (!isBlocked(candY)) { allocatedHorizLanes.push({ y: candY, minX, maxX }); return candY; }
    }
    const fallbackY = Math.max(12, baseY + allocatedHorizLanes.length * 24);
    allocatedHorizLanes.push({ y: fallbackY, minX, maxX });
    return fallbackY;
  };

  const rawPairs = directTransitions.flatMap((tr) => {
    const sourceKeys = tr.fromStageKeys && tr.fromStageKeys.length > 0 ? tr.fromStageKeys.filter((k) => k !== "*") : [tr.fromStageKey];
    return sourceKeys.map((srcKey, srcIdx) => ({ tr, srcKey, srcIdx }));
  });

  const pass1 = rawPairs.flatMap(({ tr, srcKey, srcIdx }, edgeIdx) => {
    const fromNode = nodeMap.get(srcKey), toNode = nodeMap.get(tr.toStageKey);
    if (!fromNode || !toNode) return [];
    const rowDiff = toNode.y - fromNode.y, colDiff = toNode.x - fromNode.x;
    const explicitSrc = normalizePortId(tr.sourcePort || tr.properties?.sourcePort);
    const explicitDst = normalizePortId(tr.targetPort || tr.properties?.targetPort);
    let sourcePort: StagePortId = explicitSrc ?? "top-3", targetPort: StagePortId = explicitDst ?? "top-1";
    let desiredBaseY = 0, preferUp = false;

    if (Math.abs(rowDiff) >= 80) {
      const goingDown = rowDiff > 0;
      if (!explicitSrc) sourcePort = pickLeastUsedPort(srcKey, goingDown ? (colDiff < -25 ? ["bottom-1", "bottom-2", "bottom-3"] : colDiff > 25 ? ["bottom-3", "bottom-2", "bottom-1"] : ["bottom-2", "bottom-3", "bottom-1"]) : (colDiff < -25 ? ["top-1", "top-2", "top-3"] : colDiff > 25 ? ["top-3", "top-2", "top-1"] : ["top-2", "top-1", "top-3"]));
      if (!explicitDst) targetPort = pickLeastUsedPort(tr.toStageKey, goingDown ? (colDiff < -25 ? ["top-2", "top-3", "top-1"] : colDiff > 25 ? ["top-1", "top-2", "top-3"] : ["top-2", "top-1", "top-3"]) : (colDiff < -25 ? ["bottom-3", "bottom-2", "bottom-1"] : colDiff > 25 ? ["bottom-1", "bottom-2", "bottom-3"] : ["bottom-2", "bottom-3", "bottom-1"]));
      desiredBaseY = goingDown ? fromNode.y + NODE_HEIGHT + 32 : toNode.y + NODE_HEIGHT + 64;
    } else if (colDiff >= 0) {
      const useBottomCorridor = Boolean(explicitSrc?.startsWith("bottom") || explicitDst?.startsWith("bottom") || (!explicitSrc && fromNode.y <= 110 && colDiff > 340 && (portUsageCount.get(`${srcKey}:top-2`) ?? 0) > 0));
      if (useBottomCorridor) {
        if (!explicitSrc) sourcePort = pickLeastUsedPort(srcKey, ["bottom-2", "bottom-3", "bottom-1"]);
        if (!explicitDst) targetPort = pickLeastUsedPort(tr.toStageKey, ["bottom-2", "bottom-1", "bottom-3"]);
        desiredBaseY = Math.max(fromNode.y, toNode.y) + NODE_HEIGHT + 30;
      } else {
        if (!explicitSrc) sourcePort = pickLeastUsedPort(srcKey, colDiff > 340 ? ["top-2", "top-3", "top-1"] : ["top-3", "top-2", "top-1"]);
        if (!explicitDst) targetPort = pickLeastUsedPort(tr.toStageKey, colDiff > 340 ? ["top-2", "top-1", "top-3"] : ["top-1", "top-2", "top-3"]);
        desiredBaseY = Math.min(fromNode.y, toNode.y) - 28;
        preferUp = true;
      }
    } else if (explicitSrc?.startsWith("top") && explicitDst?.startsWith("top")) {
      desiredBaseY = Math.min(fromNode.y, toNode.y) - 28;
      preferUp = true;
    } else {
      if (!explicitSrc) sourcePort = pickLeastUsedPort(srcKey, ["bottom-1", "bottom-2", "bottom-3"]);
      if (!explicitDst) targetPort = pickLeastUsedPort(tr.toStageKey, ["bottom-3", "bottom-2", "bottom-1"]);
      desiredBaseY = Math.max(fromNode.y, toNode.y) + NODE_HEIGHT + 30;
    }

    const start = getPortCoords(fromNode, sourcePort, takePortOffset(srcKey, sourcePort));
    const end = getPortCoords(toNode, targetPort, takePortOffset(tr.toStageKey, targetPort));
    const stub = 18;
    const p1 = start.side === "left" ? { x: start.x - stub, y: start.y } : start.side === "right" ? { x: start.x + stub, y: start.y } : { x: start.x, y: start.side === "top" ? start.y - stub : start.y + stub };
    const p2 = end.side === "left" ? { x: end.x - stub, y: end.y } : end.side === "right" ? { x: end.x + stub, y: end.y } : { x: end.x, y: end.side === "top" ? end.y - stub : end.y + stub };
    const laneY = allocateHorizontalLaneY(desiredBaseY, p1.x, p2.x, preferUp);
    const hitsNode = (x: number, yA: number, yB: number) => allNodes.find((n) => n.stageKey !== srcKey && n.stageKey !== tr.toStageKey && x > n.x - 10 && x < n.x + NODE_WIDTH + 10 && Math.max(yA, yB) > n.y - 8 && Math.min(yA, yB) < n.y + NODE_HEIGHT + 8);
    const obs = hitsNode(p1.x, p1.y, laneY) ?? hitsNode(p2.x, laneY, p2.y);
    const detourX = obs ? (p1.x <= obs.x + NODE_WIDTH / 2 ? Math.max(16, obs.x - 24) : obs.x + NODE_WIDTH + 60) : 0;
    const waypoints = obs ? [start, p1, { x: detourX, y: p1.y }, { x: detourX, y: laneY }, { x: p2.x, y: laneY }, p2, end] : [start, p1, { x: p1.x, y: laneY }, { x: p2.x, y: laneY }, p2, end];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i], b = waypoints[i + 1];
      if (Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) > 4) vertSegments.push({ edgeIdx, x: a.x, minY: Math.min(a.y, b.y), maxY: Math.max(a.y, b.y) });
    }
    return [{ tr, srcKey, srcIdx, edgeIdx, sourcePort, targetPort, start, end, laneY, waypoints }];
  });

  return pass1.map(({ tr, srcKey, srcIdx, edgeIdx, sourcePort, targetPort, start, end, laneY, waypoints }) => {
    const isSelected = selectedTransitionId === tr.id, rawX = Math.round((start.x + end.x) / 2);
    const pillW = showTransitionLabels ? 148 : 38, pillH = showTransitionLabels ? 24 : 20;
    const { x: labelX, y: labelY } = resolveNonOverlappingPillCenter(rawX, laneY, allNodes, placedPills, pillW, pillH, vertSegments, edgeIdx);
    const path = buildRoundedOrthogonalSvgPath(waypoints, 8);
    const testId = srcIdx === 0 ? `canvas-transition-${tr.fromStageKey}` : `canvas-transition-${srcKey}-${tr.id}`;
    const pillCls = isSelected ? "border-primary bg-nx-surface text-primary ring-2 ring-primary/30" : "bg-nx-surface text-nx-ink border-nx-line-hi hover:border-primary";
    return { key: `${tr.id}-${srcKey}-${srcIdx}`, tr, isSelected, path, labelX, labelY, testId, pillCls, sourcePort, targetPort };
  });
}

/** Builds a smooth orthogonal SVG path for the live connection wire during drag-and-drop. */
export function buildLiveWirePreviewPath(wireDraft: { startX: number; startY: number; currX: number; currY: number; fromPortId?: StagePortId }): string {
  const { startX, startY, currX, currY, fromPortId } = wireDraft;
  const side = fromPortId ? getPortSpec(fromPortId).side : "right";
  const midX = Math.round((startX + currX) / 2), midY = Math.round((startY + currY) / 2);
  const pts = side === "top" || side === "bottom" ? [{ x: startX, y: startY }, { x: startX, y: midY }, { x: currX, y: midY }, { x: currX, y: currY }] : [{ x: startX, y: startY }, { x: midX, y: startY }, { x: midX, y: currY }, { x: currX, y: currY }];
  return buildRoundedOrthogonalSvgPath(pts, 8);
}
