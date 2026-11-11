"use client";

import React, { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { CheckCircle2, Clock, GripVertical, Lock, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { STAGE_COLOR_PALETTE, buildCustomHexHarmonicStyles, resolveDefaultStageColor, type CrmCustomFieldDefinition } from "@modules/crm";
import { getWorkflowStudioText } from "../../../locales";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";
import { CrmStageFlowHandles, type StagePortId } from "./CrmStageFlowHandles";

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
  onStartWireDraft?: (fromStageKey: string, fromPortId: any) => void;
  onFinishWireDraft?: (targetStageKey: string, targetPortId?: any) => void;
  onAddTransition?: (stageKey: string) => void;
  onAddRule?: (stageKey: string) => void;
}

export type StageFlowNode = Node<StageNodeData, "stageNode">;

function CrmStageFlowNodeComponent({ data, selected }: NodeProps<StageFlowNode>) {
  const { stage, isAr, crmCustomFields, globalIncoming, onSelectStage, onSelectGlobalTransition, selectedTransitionId, onStartWireDraft, onFinishWireDraft, onAddTransition } = data;
  const isSelected = selected || data.isSelected;
  const colorToken = resolveDefaultStageColor(stage.stageKey, stage.category, stage.order, stage.color || stage.properties?.color);
  const palette = STAGE_COLOR_PALETTE[colorToken] ?? STAGE_COLOR_PALETTE.blue;
  const customHex = buildCustomHexHarmonicStyles(stage.customColorHex || stage.properties?.customColorHex);
  const hasGlobalIncoming = Boolean(stage.allowInboundFromAny || (globalIncoming && globalIncoming.length > 0));
  const matchedGlobalTransition = globalIncoming?.[0];
  const globalLabel = data.globalTransitionLabel || (isAr ? matchedGlobalTransition?.nameAr : matchedGlobalTransition?.nameEn) || getWorkflowStudioText("globalAnyPillLabel", isAr);

  return (
    <Card
      data-testid={`canvas-node-${stage.stageKey}`}
      data-stage-node-key={stage.stageKey}
      data-stage-color={customHex.isValidHex ? customHex.normalizedHex : colorToken}
      onClick={(e) => { e.stopPropagation(); onSelectStage?.(stage.stageKey); }}
      onPointerUp={() => { onFinishWireDraft?.(stage.stageKey); }}
      style={{ width: 248, minHeight: 140, ...(customHex.isValidHex && !isSelected ? customHex.nodeCardStyle : {}) }}
      className={`group relative rounded-md border bg-nx-surface p-2.5 flex flex-col justify-between transition-colors shadow-none cursor-pointer ${
        isSelected ? "border-nx-accent ring-2 ring-nx-accent/50" : "border-nx-line hover:border-nx-line-hi"
      }`}
    >
      {/* Testid alias elements for canonical terminal stages in tests */}
      {stage.isTerminalWon && <span data-testid="canvas-node-terminal-won" className="sr-only" />}
      {stage.isTerminalLost && <span data-testid="canvas-node-terminal-lost" className="sr-only" />}

      {/* External Jira Cloud * ALL Global Transition Satellite Stub & Orthogonal SVG Elbow Arrow */}
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
            title={getWorkflowStudioText("globalInboundTooltip", isAr)}
            className={`h-6 px-2 text-[10px] font-semibold tracking-wide border shadow-none bg-nx-raised text-nx-ink hover:border-nx-accent transition-colors flex items-center gap-1 ${
              matchedGlobalTransition && selectedTransitionId === matchedGlobalTransition.id ? "border-nx-accent ring-1 ring-nx-accent/50 text-nx-accent" : "border-sky-500/50 hover:border-sky-400"
            }`}
          >
            <span className="text-amber-400 font-bold">⚡</span>
            <span>* ALL</span>
            {globalLabel && <span className="text-nx-ink-2 truncate max-w-[84px]">· {globalLabel}</span>}
          </Button>
          <svg data-testid={`canvas-any-elbow-${stage.stageKey}`} className="w-8 h-8 -ml-1 text-sky-400 pointer-events-none overflow-visible" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M 2 12 H 14 Q 20 12 20 18 V 28" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 2" fill="none" />
            <polygon points="16,26 24,26 20,31" fill="currentColor" />
          </svg>
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
              {getWorkflowStudioText("terminalWonBadge", isAr)}
            </span>
          ) : stage.isTerminalLost ? (
            <span className="inline-flex items-center gap-1 text-destructive">
              <XCircle className="w-3 h-3" />
              {getWorkflowStudioText("terminalLostBadge", isAr)}
            </span>
          ) : stage.convertsToDeal ? (
            <span className="inline-flex items-center gap-1 text-info">
              <Sparkles className="w-3 h-3" />
              {getWorkflowStudioText("autoConvertsToDeal", isAr)}
            </span>
          ) : (
            `${getWorkflowStudioText("stepPrefix", isAr)} ${stage.order}`
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
            {stage.slaDays > 0 ? `${stage.slaDays}d` : "—"}
          </span>
          {stage.requiredExitFields && stage.requiredExitFields.length > 0 ? (
            <span
              className="inline-flex items-center gap-1 text-nx-ink font-semibold"
              title={stage.requiredExitFields.map((f) => formatExitFieldLabel(f, (k) => k, isAr, crmCustomFields || [])).join(", ")}
            >
              <Lock className="w-2.5 h-2.5 text-warning" />
              {stage.requiredExitFields.length} {getWorkflowStudioText("guardsCount", isAr)}
            </span>
          ) : (
            <span className="text-nx-ink-3">{getWorkflowStudioText("openGate", isAr)}</span>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
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
            + Trans
          </Button>
        </div>
      </div>
    </Card>
  );
}

export const CrmStageFlowNode = memo(CrmStageFlowNodeComponent);
