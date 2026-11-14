"use client";

import React, { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { FileText, Lock, Shield, Sparkles } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { countTransitionRules } from "./CrmWorkflowCanvasSubViews";

export interface TransitionEdgeData extends Record<string, unknown> {
  transition: CrmWorkflowTransition;
  isAr: boolean;
  isSelected?: boolean;
  showLabels?: boolean;
  isGlobalWildcard?: boolean;
  onSelectTransition?: (transitionId: string) => void;
  parallelIndex?: number;
  parallelCount?: number;
  offset?: number;
  labelStaggerX?: number;
  labelStaggerY?: number;
  stageBoxes?: Array<{ x: number; y: number; w: number; h: number }>;
}

export type TransitionFlowEdge = Edge<TransitionEdgeData, "transitionEdge">;

function CrmTransitionFlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps<TransitionFlowEdge>) {
  const { t } = useI18n();
  const isSelected = selected || data?.isSelected;
  const transition = data?.transition;
  const isAr = Boolean(data?.isAr);
  const showLabels = data?.showLabels ?? true;
  const isGlobalWildcard = Boolean(data?.isGlobalWildcard || transition?.fromStageKey === "*");

  const parallelIndex = data?.parallelIndex ?? 0;
  const parallelCount = data?.parallelCount ?? 1;

  // Dynamic orthogonal lane separation for parallel and bidirectional edges
  const baseOffset = data?.offset ?? (transition?.direction === "backward" ? 36 : 24);
  const dynamicOffset = parallelCount > 1 ? baseOffset + (parallelIndex - (parallelCount - 1) / 2) * 28 : baseOffset;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12, offset: dynamicOffset,
  });

  if (!transition) {
    return <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />;
  }

  const ruleCount = countTransitionRules(transition);
  const hasScreen = Boolean(
    transition.requireReason ||
      transition.requireNote ||
      (transition.promptFields && transition.promptFields.length > 0) ||
      (transition.requiredFields && transition.requiredFields.length > 0) ||
      transition.requireVerifiedParty ||
      transition.requireEstimatedAmountPositive,
  );
  const noRollback = transition.allowRollback === false;

  const edgeStroke = isSelected
    ? "var(--nx-accent)"
    : isGlobalWildcard
      ? "var(--nx-ink-3)"
      : "var(--nx-line-hi)";

  // Shift label perpendicular so parallel labels never stack on top of each other
  const labelShiftY = parallelCount > 1 ? (parallelIndex - (parallelCount - 1) / 2) * 26 : 0;
  let computedLabelX = labelX + (data?.labelStaggerX ?? 0);
  let computedLabelY = labelY + labelShiftY + (data?.labelStaggerY ?? 0);

  // Obstacle avoidance: nudge label pill if it collides with any stage card
  const stageBoxes = data?.stageBoxes ?? [];
  for (const box of stageBoxes) {
    if (
      computedLabelX >= box.x - 20 &&
      computedLabelX <= box.x + box.w + 20 &&
      computedLabelY >= box.y - 14 &&
      computedLabelY <= box.y + box.h + 14
    ) {
      const distToTop = Math.abs(computedLabelY - (box.y - 24));
      const distToBottom = Math.abs(computedLabelY - (box.y + box.h + 24));
      computedLabelY = distToTop < distToBottom ? box.y - 24 : box.y + box.h + 24;
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeStroke,
          strokeWidth: isSelected ? 2.5 : isGlobalWildcard ? 1.75 : 2,
          strokeDasharray: isGlobalWildcard ? "5 4" : undefined,
          opacity: isGlobalWildcard && !isSelected ? 0.75 : 1,
        }}
      />

      <path
        d={edgePath}
        data-testid={`canvas-edge-path-${transition.id}`}
        className="opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      {showLabels && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${computedLabelX}px, ${computedLabelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan select-none z-10"
          >
            <div
              data-testid={`canvas-transition-${transition.fromStageKey}`}
              data-transition-id={transition.id}
              onClick={(e) => {
                e.stopPropagation();
                data?.onSelectTransition?.(transition.id);
              }}
              title={isAr ? transition.nameAr : transition.nameEn}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold cursor-pointer transition-all ${
                isSelected
                  ? "border-nx-accent bg-nx-raised text-nx-accent ring-2 ring-nx-accent/30"
                  : "border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
              }`}
            >
              <span data-testid={`canvas-transition-${transition.id}`} className="sr-only" />
              <span className="truncate max-w-[130px]">
                {isAr ? transition.nameAr : transition.nameEn}
              </span>

              {hasScreen && (
                <span title={t("crmOpportunities.workflowStudio.transitionScreenRequired")} className="inline-flex shrink-0">
                  <FileText className="w-2.5 h-2.5 text-info" />
                </span>
              )}

              {noRollback && (
                <span title={t("crmOpportunities.workflowStudio.transitionNoRollback")} className="inline-flex shrink-0">
                  <Lock className="w-2.5 h-2.5 text-warning" />
                </span>
              )}

              {transition.triggerDealConversion && (
                <span title={t("crmOpportunities.workflowStudio.autoConvertsToDeal")} className="inline-flex shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-success" />
                </span>
              )}

              {ruleCount > 0 && (
                <Badge
                  variant="outline"
                  className="px-1 py-0 text-[9px] font-mono leading-none border-nx-line"
                >
                  <Shield className="w-2 h-2 me-0.5 text-info inline" />
                  {ruleCount}
                </Badge>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const CrmTransitionFlowEdge = memo(CrmTransitionFlowEdgeComponent);
