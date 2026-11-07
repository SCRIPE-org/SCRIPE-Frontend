"use client";

import React from "react";
import { Zap } from "lucide-react";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { NODE_HEIGHT, countTransitionRules } from "./CrmWorkflowCanvasSubViews";
import {
  buildLiveWirePreviewPath,
  computeJiraOrthogonalEdges,
  type StagePortId,
} from "./crmWorkflowEdgeRouting";

export interface CrmWorkflowSvgEdgesLayerProps {
  isAr: boolean;
  firstStage: CrmWorkflowStageNode | undefined;
  directTransitions: CrmWorkflowTransition[];
  nodeMap: Map<string, CrmWorkflowStageNode>;
  selectedTransitionId: string | null;
  showTransitionLabels: boolean;
  wireDraft: {
    fromStageKey: string;
    fromPortId: StagePortId;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
    targetStageKey?: string | null;
    targetPortId?: StagePortId | null;
  } | null;
  onSelectTransition: (transitionId: string | null) => void;
  onSelectStage: (stageKey: string | null) => void;
}

/** Pure declarative SVG Orthogonal Edges & Transition Pills Layer for the 2D Workflow Canvas. */
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
  const edgeItems = computeJiraOrthogonalEdges(
    directTransitions,
    nodeMap,
    selectedTransitionId,
    showTransitionLabels,
  );

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      data-testid="crm-2d-svg-edges"
    >
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
          d={`M 70 116 L ${firstStage.x} ${firstStage.y + NODE_HEIGHT / 2}`}
          className="stroke-nx-ink-2"
          strokeWidth={2}
          fill="none"
          markerEnd="url(#wf-arrow)"
        />
      )}

      {edgeItems.map((item) => {
        const ruleCount = countTransitionRules(item.tr);
        return (
          <path
            key={`path-${item.key}`}
            d={item.path}
            data-testid={`canvas-edge-path-${item.tr.id}`}
            data-source-port={item.sourcePort}
            data-target-port={item.targetPort}
            fill="none"
            strokeWidth={item.isSelected ? 2.5 : 1.85}
            className={`${wireDraft ? "pointer-events-none" : "pointer-events-auto cursor-pointer"} ${
              item.isSelected ? "stroke-primary" : "stroke-nx-ink-2"
            }`}
            markerEnd={item.isSelected ? "url(#wf-arrow-active)" : "url(#wf-arrow)"}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTransition(item.tr.id);
              onSelectStage(null);
            }}
            data-rule-count={ruleCount}
          />
        );
      })}

      {edgeItems.map((item) => {
        const ruleCount = countTransitionRules(item.tr);
        return (
          <g
            key={`pill-${item.key}`}
            className={wireDraft ? "pointer-events-none" : "pointer-events-auto cursor-pointer"}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTransition(item.tr.id);
              onSelectStage(null);
            }}
          >
            {showTransitionLabels ? (
              <foreignObject x={item.labelX - 72} y={item.labelY - 12} width={144} height={24}>
                <div
                  data-testid={item.testId}
                  className={`h-full px-2 rounded-full border text-[10px] font-semibold flex items-center justify-center gap-1 truncate transition-colors ${item.pillCls}`}
                >
                  <Zap className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{isAr ? item.tr.nameAr : item.tr.nameEn}</span>
                  {ruleCount > 0 && <span className="font-mono text-[9px] opacity-80">({ruleCount})</span>}
                </div>
              </foreignObject>
            ) : (
              <foreignObject x={item.labelX - 18} y={item.labelY - 10} width={36} height={20}>
                <div
                  data-testid={item.testId}
                  className={`h-full px-1.5 rounded-full border text-[9px] font-mono font-bold flex items-center justify-center gap-0.5 ${item.pillCls}`}
                >
                  <Zap className="w-2.5 h-2.5 shrink-0" />
                  {ruleCount > 0 && <span>{ruleCount}</span>}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}

      {wireDraft && (
        <path
          d={buildLiveWirePreviewPath(wireDraft)}
          fill="none"
          strokeWidth={2.5}
          strokeDasharray="5 3"
          className="stroke-primary pointer-events-none"
          markerEnd="url(#wf-arrow-active)"
          data-testid="canvas-live-connection-wire"
        />
      )}
    </svg>
  );
}
