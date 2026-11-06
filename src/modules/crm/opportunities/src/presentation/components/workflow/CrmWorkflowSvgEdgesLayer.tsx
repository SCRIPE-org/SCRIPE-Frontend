"use client";

import React from "react";
import { Zap } from "lucide-react";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { NODE_HEIGHT, countTransitionRules, getPortCoords } from "./CrmWorkflowCanvasSubViews";

export interface CrmWorkflowSvgEdgesLayerProps {
  isAr: boolean;
  firstStage: CrmWorkflowStageNode | undefined;
  directTransitions: CrmWorkflowTransition[];
  nodeMap: Map<string, CrmWorkflowStageNode>;
  selectedTransitionId: string | null;
  showTransitionLabels: boolean;
  wireDraft: {
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  } | null;
  onSelectTransition: (transitionId: string | null) => void;
  onSelectStage: (stageKey: string | null) => void;
}

/**
 * Pure declarative SVG Orthogonal Edges & Transition Pills Layer for the 2D Workflow Canvas (<145 lines).
 */
export function CrmWorkflowSvgEdgesLayer({
  isAr,
  firstStage,
  directTransitions,
  nodeMap,
  selectedTransitionId,
  showTransitionLabels,
  wireDraft,
  onSelectTransition,
  onSelectStage,
}: CrmWorkflowSvgEdgesLayerProps) {
  let fwdSkipIdx = 0;
  let bwdSkipIdx = 0;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" data-testid="crm-2d-svg-edges">
      <defs>
        <marker id="wf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-nx-ink-2" />
        </marker>
        <marker id="wf-arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-primary" />
        </marker>
      </defs>
      {firstStage && (
        <path
          d={`M 74 228 L ${firstStage.x} ${firstStage.y + NODE_HEIGHT / 2}`}
          className="stroke-nx-ink-2"
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="none"
          markerEnd="url(#wf-arrow)"
        />
      )}
      {directTransitions.flatMap((tr) => {
        const sourceKeys =
          tr.fromStageKeys && tr.fromStageKeys.length > 0
            ? tr.fromStageKeys.filter((k) => k !== "*")
            : [tr.fromStageKey];
        return sourceKeys.map((srcKey, srcIdx) => {
          const fromNode = nodeMap.get(srcKey);
          const toNode = nodeMap.get(tr.toStageKey);
          if (!fromNode || !toNode) return null;
          const isSelected = selectedTransitionId === tr.id;
          const isBackward = toNode.order < fromNode.order || toNode.x < fromNode.x;
          const isTerminalBranch = toNode.isTerminalWon || toNode.isTerminalLost;
          let path = "";
          let labelX = 0;
          let labelY = 0;
          if (isTerminalBranch) {
            const start = getPortCoords(fromNode, toNode.isTerminalWon ? "right-1" : "right-2");
            const end = getPortCoords(toNode, "left-1");
            const midX = Math.round((start.x + end.x) / 2);
            path = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
            labelX = midX;
            labelY = toNode.isTerminalWon ? Math.min(start.y, end.y) - 18 : Math.max(start.y, end.y) + 18;
          } else if (!isBackward) {
            const span = Math.abs(toNode.order - fromNode.order);
            const channelY = span > 1 ? 22 + (fwdSkipIdx++ % 2) * 28 : fromNode.order % 2 === 1 ? 80 : 118;
            const start = getPortCoords(fromNode, "top-2");
            const end = getPortCoords(toNode, "top-1");
            path = `M ${start.x} ${start.y} L ${start.x} ${channelY} L ${end.x} ${channelY} L ${end.x} ${end.y}`;
            labelX = Math.round((start.x + end.x) / 2);
            labelY = channelY;
          } else {
            const span = Math.abs(toNode.order - fromNode.order);
            const channelY = span > 1 ? 432 + (bwdSkipIdx++ % 2) * 32 : fromNode.order % 2 === 0 ? 348 : 388;
            const start = getPortCoords(fromNode, "bottom-1");
            const end = getPortCoords(toNode, "bottom-2");
            path = `M ${start.x} ${start.y} L ${start.x} ${channelY} L ${end.x} ${channelY} L ${end.x} ${end.y}`;
            labelX = Math.round((start.x + end.x) / 2);
            labelY = channelY;
          }
          const ruleCount = countTransitionRules(tr);
          const testId = srcIdx === 0 ? `canvas-transition-${tr.fromStageKey}` : `canvas-transition-${srcKey}-${tr.id}`;
          return (
            <g
              key={`${tr.id}-${srcKey}-${srcIdx}`}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTransition(tr.id);
                onSelectStage(null);
              }}
            >
              <path
                d={path}
                fill="none"
                strokeWidth={isSelected ? 2.5 : 1.75}
                strokeDasharray={isBackward ? "5 4" : undefined}
                className={isSelected ? "stroke-primary" : "stroke-nx-ink-2"}
                markerEnd={isSelected ? "url(#wf-arrow-active)" : "url(#wf-arrow)"}
              />
              {showTransitionLabels ? (
                <foreignObject x={labelX - 76} y={labelY - 13} width={152} height={26}>
                  <div
                    data-testid={testId}
                    className={`h-full px-2 rounded-full border text-[10px] font-semibold flex items-center justify-center gap-1 truncate transition-colors ${
                      isSelected ? "bg-primary text-nx-on-fill border-primary" : "bg-nx-surface text-nx-ink border-nx-line-hi hover:border-primary"
                    }`}
                  >
                    <Zap className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{isAr ? tr.nameAr : tr.nameEn}</span>
                    {ruleCount > 0 && <span className="font-mono text-[9px] opacity-80">({ruleCount})</span>}
                  </div>
                </foreignObject>
              ) : (
                <foreignObject x={labelX - 18} y={labelY - 10} width={36} height={20}>
                  <div
                    data-testid={testId}
                    className={`h-full px-1.5 rounded-full border text-[9px] font-mono font-bold flex items-center justify-center gap-0.5 ${
                      isSelected ? "bg-primary text-nx-on-fill border-primary" : "bg-nx-surface text-nx-ink border-nx-line-hi"
                    }`}
                  >
                    <Zap className="w-2.5 h-2.5 shrink-0" />
                    {ruleCount > 0 && <span>{ruleCount}</span>}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        });
      })}
      {wireDraft && (
        <path
          d={`M ${wireDraft.startX} ${wireDraft.startY} L ${wireDraft.currX} ${wireDraft.currY}`}
          fill="none"
          strokeWidth={2.5}
          strokeDasharray="4 3"
          className="stroke-primary"
          markerEnd="url(#wf-arrow-active)"
          data-testid="canvas-live-connection-wire"
        />
      )}
    </svg>
  );
}
