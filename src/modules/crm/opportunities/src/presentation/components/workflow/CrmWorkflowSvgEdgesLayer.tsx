"use client";

import React from "react";
import { Zap } from "lucide-react";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { NODE_HEIGHT, NODE_WIDTH, countTransitionRules, getPortCoords } from "./CrmWorkflowCanvasSubViews";

export interface CrmWorkflowSvgEdgesLayerProps {
  isAr: boolean;
  firstStage: CrmWorkflowStageNode | undefined;
  directTransitions: CrmWorkflowTransition[];
  nodeMap: Map<string, CrmWorkflowStageNode>;
  selectedTransitionId: string | null;
  showTransitionLabels: boolean;
  wireDraft: { startX: number; startY: number; currX: number; currY: number } | null;
  onSelectTransition: (transitionId: string | null) => void;
  onSelectStage: (stageKey: string | null) => void;
}

/** Resolves a pill center (cx, cy) so its box never overlaps any stage node or already-placed pill. */
function resolveNonOverlappingPillCenter(
  initX: number, initY: number, nodes: CrmWorkflowStageNode[],
  placedPills: Array<{ x: number; y: number; w: number; h: number }>, pillW: number, pillH: number,
): { x: number; y: number } {
  const candidates: Array<{ dx: number; dy: number }> = [{ dx: 0, dy: 0 }];
  for (const stepY of [0, -30, 30, -60, 60, -90, 90, 120, -120]) {
    for (const stepX of [0, -80, 80, -160, 160, -240, 240]) {
      if (stepX !== 0 || stepY !== 0) candidates.push({ dx: stepX, dy: stepY });
    }
  }
  const overlapsBox = (cx: number, cy: number) => {
    const left = cx - pillW / 2 - 4, right = cx + pillW / 2 + 4, top = cy - pillH / 2 - 3, bottom = cy + pillH / 2 + 3;
    if (top < 6 || left < 74) return true;
    for (const n of nodes) {
      if (right > n.x - 6 && left < n.x + NODE_WIDTH + 6 && bottom > n.y - 6 && top < n.y + NODE_HEIGHT + 6) return true;
      if ((n.isTerminalLost || n.stageKey.includes("disqualified")) && right > n.x + 60 && left < n.x + NODE_WIDTH + 6 && bottom > n.y + NODE_HEIGHT + 8 && top < n.y + NODE_HEIGHT + 44) return true;
    }
    for (const p of placedPills) {
      if (right > p.x - p.w / 2 && left < p.x + p.w / 2 && bottom > p.y - p.h / 2 && top < p.y + p.h / 2) return true;
    }
    return false;
  };
  for (const c of candidates) {
    const cx = initX + c.dx, cy = initY + c.dy;
    if (!overlapsBox(cx, cy)) {
      placedPills.push({ x: cx, y: cy, w: pillW, h: pillH });
      return { x: cx, y: cy };
    }
  }
  const fallback = { x: initX, y: initY + placedPills.length * 30 };
  placedPills.push({ x: fallback.x, y: fallback.y, w: pillW, h: pillH });
  return fallback;
}

/** Pure declarative SVG Orthogonal Edges & Transition Pills Layer for the 2D Workflow Canvas. */
export function CrmWorkflowSvgEdgesLayer({
  isAr, firstStage, directTransitions, nodeMap, selectedTransitionId, showTransitionLabels, wireDraft, onSelectTransition, onSelectStage,
}: CrmWorkflowSvgEdgesLayerProps) {
  let crossRowIdx = 0, bwdRow1Idx = 0, bwdRow2Idx = 0;
  const allNodes = Array.from(nodeMap.values());
  const placedPills: Array<{ x: number; y: number; w: number; h: number }> = [];

  const edgeItems = directTransitions.flatMap((tr) => {
    const sourceKeys = tr.fromStageKeys && tr.fromStageKeys.length > 0 ? tr.fromStageKeys.filter((k) => k !== "*") : [tr.fromStageKey];
    return sourceKeys.flatMap((srcKey, srcIdx) => {
      const fromNode = nodeMap.get(srcKey), toNode = nodeMap.get(tr.toStageKey);
      if (!fromNode || !toNode) return [];
      const isSelected = selectedTransitionId === tr.id;
      const isBackward = toNode.order < fromNode.order && !toNode.isTerminalWon && !toNode.isTerminalLost;
      const rowDiff = toNode.y - fromNode.y;
      let start = { x: 0, y: 0 }, end = { x: 0, y: 0 }, rawX = 0, rawY = 0;
      if (Math.abs(rowDiff) >= 80) {
        const goingDown = rowDiff > 0;
        start = getPortCoords(fromNode, goingDown ? "bottom-2" : "top-2");
        end = getPortCoords(toNode, goingDown ? "top-1" : "bottom-1");
        const slot = crossRowIdx++;
        rawY = 222 + (slot % 3) * 30;
        rawX = Math.round((start.x + end.x) / 2) + ((slot % 3) - 1) * 65;
      } else if (!isBackward) {
        rawY = Math.max(24, fromNode.y - 24);
        start = getPortCoords(fromNode, "top-2");
        end = getPortCoords(toNode, "top-1");
        rawX = Math.round((start.x + end.x) / 2);
      } else {
        const isTopRow = Math.max(fromNode.y, toNode.y) < 200;
        const slot = isTopRow ? bwdRow1Idx++ : bwdRow2Idx++;
        rawY = Math.max(fromNode.y, toNode.y) + NODE_HEIGHT + 24 + (slot % 3) * 28;
        start = getPortCoords(fromNode, "bottom-1");
        end = getPortCoords(toNode, "bottom-2");
        rawX = Math.round((start.x + end.x) / 2);
      }
      const pillW = showTransitionLabels ? 148 : 38, pillH = showTransitionLabels ? 24 : 20;
      const { x: labelX, y: labelY } = resolveNonOverlappingPillCenter(rawX, rawY, allNodes, placedPills, pillW, pillH);
      const path = `M ${start.x} ${start.y} L ${start.x} ${labelY} L ${end.x} ${labelY} L ${end.x} ${end.y}`;
      const ruleCount = countTransitionRules(tr);
      const testId = srcIdx === 0 ? `canvas-transition-${tr.fromStageKey}` : `canvas-transition-${srcKey}-${tr.id}`;
      const pillCls = isSelected ? "border-primary bg-nx-surface text-primary ring-2 ring-primary/30" : "bg-nx-surface text-nx-ink border-nx-line-hi hover:border-primary";
      return [{ key: `${tr.id}-${srcKey}-${srcIdx}`, tr, isSelected, isBackward, path, labelX, labelY, ruleCount, testId, pillCls }];
    });
  });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" data-testid="crm-2d-svg-edges">
      <defs>
        <marker id="wf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" className="fill-nx-ink-2" /></marker>
        <marker id="wf-arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" className="fill-primary" /></marker>
      </defs>
      {firstStage && (
        <path d={`M 70 116 L ${firstStage.x} ${firstStage.y + NODE_HEIGHT / 2}`} className="stroke-nx-ink-2" strokeWidth={2} strokeDasharray="4 4" fill="none" markerEnd="url(#wf-arrow)" />
      )}
      {edgeItems.map((item) => (
        <path key={`path-${item.key}`} d={item.path} fill="none" strokeWidth={item.isSelected ? 2.5 : 1.75} strokeDasharray={item.isBackward ? "5 4" : undefined} className={`pointer-events-auto cursor-pointer ${item.isSelected ? "stroke-primary" : "stroke-nx-ink-2"}`} markerEnd={item.isSelected ? "url(#wf-arrow-active)" : "url(#wf-arrow)"} onClick={(e) => { e.stopPropagation(); onSelectTransition(item.tr.id); onSelectStage(null); }} />
      ))}
      {edgeItems.map((item) => (
        <g key={`pill-${item.key}`} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectTransition(item.tr.id); onSelectStage(null); }}>
          {showTransitionLabels ? (
            <foreignObject x={item.labelX - 72} y={item.labelY - 12} width={144} height={24}>
              <div data-testid={item.testId} className={`h-full px-2 rounded-full border text-[10px] font-semibold flex items-center justify-center gap-1 truncate transition-colors ${item.pillCls}`}>
                <Zap className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{isAr ? item.tr.nameAr : item.tr.nameEn}</span>
                {item.ruleCount > 0 && <span className="font-mono text-[9px] opacity-80">({item.ruleCount})</span>}
              </div>
            </foreignObject>
          ) : (
            <foreignObject x={item.labelX - 18} y={item.labelY - 10} width={36} height={20}>
              <div data-testid={item.testId} className={`h-full px-1.5 rounded-full border text-[9px] font-mono font-bold flex items-center justify-center gap-0.5 ${item.pillCls}`}>
                <Zap className="w-2.5 h-2.5 shrink-0" />
                {item.ruleCount > 0 && <span>{item.ruleCount}</span>}
              </div>
            </foreignObject>
          )}
        </g>
      ))}
      {wireDraft && (
        <path d={`M ${wireDraft.startX} ${wireDraft.startY} L ${wireDraft.currX} ${wireDraft.currY}`} fill="none" strokeWidth={2.5} strokeDasharray="4 3" className="stroke-primary" markerEnd="url(#wf-arrow-active)" data-testid="canvas-live-connection-wire" />
      )}
    </svg>
  );
}
