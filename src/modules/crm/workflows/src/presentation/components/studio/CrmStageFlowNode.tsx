"use client";

import React, { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { CheckCircle2, Clock, GripVertical, Lock, Palette, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { STAGE_COLOR_PALETTE, buildCustomHexHarmonicStyles, resolveDefaultStageColor, type CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";
import { CrmStageFlowHandles, type StagePortId } from "./CrmStageFlowHandles";

/** Node data payload for rendering a workflow stage card on the React Flow canvas. */
export interface StageNodeData extends Record<string, unknown> {
  stage: CrmWorkflowStageNode;
  isSelected: boolean;
  selectedTransitionId?: string | null;
  isAr: boolean;
  crmCustomFields?: CrmCustomFieldDefinition[];
  globalIncoming?: CrmWorkflowTransition[];
  globalTransitionLabel?: string;
  onSelectStage?: (stageKey: string) => void;
  onSelectGlobalTransition?: (transitionId: string) => void;
  onStartWireDraft?: (fromStageKey: string, fromPortId: StagePortId) => void;
  onFinishWireDraft?: (targetStageKey: string, targetPortId?: StagePortId) => void;
  onAddTransition?: (stageKey: string) => void;
  onAddRule?: (stageKey: string) => void;
}

/** React Flow custom node type representing a CRM workflow stage card. */
export type StageFlowNode = Node<StageNodeData, "stageNode">;

function CrmStageFlowNodeComponent({ data, selected }: NodeProps<StageFlowNode>) {
  const { t } = useI18n();
  const { stage, isAr, crmCustomFields, globalIncoming, onSelectStage, onSelectGlobalTransition, selectedTransitionId, onStartWireDraft, onFinishWireDraft, onAddTransition } = data;
  const isSelected = selected || data.isSelected;
  const colorToken = resolveDefaultStageColor(stage.stageKey, stage.category, stage.order, stage.color || stage.properties?.color);
  const palette = STAGE_COLOR_PALETTE[colorToken] ?? STAGE_COLOR_PALETTE.blue;
  const customHex = buildCustomHexHarmonicStyles(stage.customColorHex || stage.properties?.customColorHex);
  const hasGlobalIncoming = Boolean(stage.allowInboundFromAny || (globalIncoming && globalIncoming.length > 0));
  const matchedGlobalTransition = globalIncoming?.[0];
  const globalLabel = data.globalTransitionLabel || (isAr ? matchedGlobalTransition?.nameAr : matchedGlobalTransition?.nameEn) || t("crmWorkflows.workflowStudio.globalAnyPillLabel");

  return (
    <Card
      data-testid={`canvas-node-${stage.stageKey}`}
      data-stage-node-key={stage.stageKey}
      data-stage-color={customHex.isValidHex ? customHex.normalizedHex : colorToken}
      onClick={(e) => { e.stopPropagation(); onSelectStage?.(stage.stageKey); }}
      onPointerUp={() => { onFinishWireDraft?.(stage.stageKey); }}
      style={{ width: 248, minHeight: 140, ...(customHex.isValidHex && !isSelected ? customHex.nodeCardStyle : {}) }}
      className={`group relative rounded-md border p-2.5 flex flex-col justify-between transition-colors shadow-none cursor-pointer ${
        isSelected
          ? `border-nx-accent ring-2 ring-nx-accent/60 bg-nx-surface ${palette.headerBorderClass}`
          : customHex.isValidHex
            ? "bg-nx-surface hover:border-nx-line-hi"
            : `${palette.borderClass} ${palette.headerBorderClass}`
      }`}
    >
      {/* External Jira Cloud * ALL Global Transition Satellite Stub */}
      {hasGlobalIncoming && (
        <div className="absolute -top-8 left-2 z-20 flex items-center pointer-events-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid={`canvas-transition-global-${stage.stageKey}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartWireDraft?.("*", "right-1");
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (matchedGlobalTransition) onSelectGlobalTransition?.(matchedGlobalTransition.id);
              else onSelectStage?.(stage.stageKey);
            }}
            title={t("crmWorkflows.workflowStudio.globalInboundTooltip")}
            className={`h-6 px-2 text-[10px] font-semibold tracking-wide border shadow-none bg-nx-raised text-nx-ink hover:border-nx-accent transition-colors flex items-center gap-1 ${
              matchedGlobalTransition && selectedTransitionId === matchedGlobalTransition.id ? "border-nx-accent ring-1 ring-nx-accent/50 text-nx-accent" : "border-info/50 hover:border-info"
            }`}
          >
            <span className="text-nx-warning-strong font-bold">⚡</span>
            <span>{t("crmWorkflows.workflowStudio.globalAllBadge")}</span>
            {globalLabel && <span className="text-nx-ink-2 truncate max-w-[84px]">· {globalLabel}</span>}
          </Button>
        </div>
      )}

      {/* 12 Magnetic Perimeter ReactFlow Connection Handles */}
      <CrmStageFlowHandles stageKey={stage.stageKey} onStartWireDraft={onStartWireDraft} onFinishWireDraft={onFinishWireDraft} />

      {/* Card Header: Step/Category Indicator + Win Probability Badge */}
      <div className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-nx-ink-2">
          <GripVertical className="w-3 h-3 text-nx-ink-3" />
          <span style={customHex.isValidHex ? customHex.dotStyle : undefined} className={`w-2.5 h-2.5 rounded-full shrink-0 ${palette.dotClass}`} />
          {stage.isTerminalWon ? (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              {t("crmWorkflows.workflowStudio.terminalWonBadge")}
            </span>
          ) : stage.isTerminalLost ? (
            <span className="inline-flex items-center gap-1 text-destructive">
              <XCircle className="w-3 h-3" />
              {t("crmWorkflows.workflowStudio.terminalLostBadge")}
            </span>
          ) : stage.convertsToDeal ? (
            <span className="inline-flex items-center gap-1 text-info">
              <Sparkles className="w-3 h-3" />
              {t("crmWorkflows.workflowStudio.autoConvertsToDeal")}
            </span>
          ) : (
            `${t("crmWorkflows.workflowStudio.stepPrefix")} ${stage.order}`
          )}
        </span>
        <Badge variant="outline" style={customHex.isValidHex ? customHex.badgeStyle : undefined} className={`text-[10px] font-mono px-1.5 py-0 ${palette.badgeClass}`}>
          {stage.probability}%
        </Badge>
      </div>

      {/* Card Center: Stage Name (2-Line Clamp, Never Truncated at 10 Chars) */}
      <div className="my-1.5 flex-1 flex flex-col justify-center">
        <h4
          className="text-[13px] font-semibold leading-snug text-nx-ink line-clamp-2"
          title={isAr && stage.labelAr ? stage.labelAr : stage.labelEn || stage.stageKey}
        >
          {isAr && stage.labelAr ? stage.labelAr : stage.labelEn || stage.stageKey}
        </h4>
      </div>

      {/* Card Footer: SLA + Exit Gates / Open Gate Status + Quick Action Button */}
      <div className="flex items-center justify-between text-[10px] text-nx-ink-2 pt-1 border-t border-nx-line">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {stage.slaDays > 0 ? `${stage.slaDays}${t("crmWorkflows.workflowStudio.daysShort")}` : "—"}
          </span>
          {stage.requiredExitFields && stage.requiredExitFields.length > 0 ? (
            <span
              className="inline-flex items-center gap-1 text-nx-ink font-semibold"
              title={stage.requiredExitFields.map((f) => formatExitFieldLabel(f, t, isAr, crmCustomFields || [])).join(", ")}
            >
              <Lock className="w-2.5 h-2.5 text-nx-warning-strong" />
              {stage.requiredExitFields.length} {t("crmWorkflows.workflowStudio.guardsCount")}
            </span>
          ) : (
            <span className="text-nx-ink-3">{t("crmWorkflows.workflowStudio.openGate")}</span>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-4 px-1 text-[8px] text-nx-ink-3 hover:text-nx-accent"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStage?.(stage.stageKey);
            }}
            title={t("crmWorkflows.workflowStudio.colorPaletteTitle")}
          >
            <Palette className="w-2.5 h-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 px-1 text-[8px] text-nx-ink-3 hover:text-nx-accent"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddTransition) onAddTransition(stage.stageKey);
              else onStartWireDraft?.(stage.stageKey, "right-1");
            }}
          >
            {t("crmWorkflows.workflowStudio.quickAddTransitionBtn")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Memoized React Flow stage card displaying SLA, probability, exit gates, and 12 perimeter ports. */
export const CrmStageFlowNode = memo(CrmStageFlowNodeComponent);
