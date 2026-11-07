"use client";

import React from "react";
import { CheckCircle2, Clock, GripVertical, Lock, XCircle } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { STAGE_COLOR_PALETTE, buildCustomHexHarmonicStyles, resolveDefaultStageColor, type CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { NODE_HEIGHT, NODE_WIDTH, STAGE_PORTS, StagePortId, formatExitFieldLabel, getPortCoords } from "./CrmWorkflowCanvasSubViews";

export interface CrmWorkflowStageNodeCardProps {
  t: (k: string) => string; isAr: boolean; stage: CrmWorkflowStageNode;
  isSelected: boolean; selectedTransitionId?: string | null; showPorts: boolean;
  isDropTarget?: boolean; hoveredDropPortId?: StagePortId | null;
  globalIncoming: CrmWorkflowTransition[]; crmCustomFields: CrmCustomFieldDefinition[];
  onMouseEnter: () => void; onMouseLeave: () => void; onClickNode: () => void;
  onPointerDownNode: (e: React.PointerEvent) => void;
  onStartWireDraft: (fromStageKey: string, portId: StagePortId, startX: number, startY: number, originStageKey?: string) => void;
  onFinishWireDraft?: (targetStageKey: string, targetPortId?: StagePortId | null, e?: React.PointerEvent) => void;
  onSelectGlobalTransition: (transitionId: string) => void;
}

/** 2D workflow status node card with 8 Jira perimeter ports and floating Any pill + L-arrow (<190 lines). */
export function CrmWorkflowStageNodeCard({
  t, isAr, stage, isSelected, selectedTransitionId, showPorts,
  isDropTarget = false, hoveredDropPortId = null, globalIncoming, crmCustomFields,
  onMouseEnter, onMouseLeave, onClickNode, onPointerDownNode,
  onStartWireDraft, onFinishWireDraft, onSelectGlobalTransition,
}: CrmWorkflowStageNodeCardProps) {
  const colorToken = resolveDefaultStageColor(stage.stageKey, stage.category, stage.order, stage.color || stage.properties?.color);
  const palette = STAGE_COLOR_PALETTE[colorToken] ?? STAGE_COLOR_PALETTE.blue;
  const customHex = buildCustomHexHarmonicStyles(stage.customColorHex || stage.properties?.customColorHex);

  return (
    <div
      style={{
        left: stage.x, top: stage.y, width: NODE_WIDTH, height: NODE_HEIGHT,
        ...(customHex.isValidHex && !isSelected && !isDropTarget ? customHex.nodeCardStyle : {}),
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerEnter={onMouseEnter}
      onPointerDown={onPointerDownNode}
      onPointerUp={(e) => { if (onFinishWireDraft) { e.stopPropagation(); onFinishWireDraft(stage.stageKey, null, e); } }}
      onClick={(e) => { e.stopPropagation(); onClickNode(); }}
      data-testid={`canvas-node-${stage.stageKey}`}
      data-stage-node-key={stage.stageKey}
      data-stage-color={customHex.isValidHex ? customHex.normalizedHex : colorToken}
      className={`absolute rounded-md border bg-nx-surface p-2.5 flex flex-col justify-between transition-all cursor-grab active:cursor-grabbing ${palette.headerBorderClass} ${
        isDropTarget ? "border-nx-accent ring-2 ring-nx-accent shadow-sm" : isSelected ? "border-primary ring-2 ring-primary/35" : palette.borderClass
      }`}
    >
      {/* 8 Jira Perimeter Connection Ports: 3 Top, 3 Bottom, 1 Left, 1 Right */}
      {STAGE_PORTS.map((port) => {
        const isHoveredPort = isDropTarget && hoveredDropPortId === port.id;
        return (
          <div
            key={port.id}
            data-testid={`node-port-${stage.stageKey}-${port.id}`}
            data-port-id={port.id}
            data-port-stage-key={stage.stageKey}
            data-stage-port-side={port.side}
            title={t("crmOpportunities.pipelinesPage.portConnectHint")}
            onPointerDown={(e) => {
              e.stopPropagation();
              const start = getPortCoords(stage, port.id);
              onStartWireDraft(stage.stageKey, port.id, start.x, start.y);
            }}
            onPointerUp={(e) => { if (onFinishWireDraft) { e.stopPropagation(); onFinishWireDraft(stage.stageKey, port.id, e); } }}
            style={{ left: `${port.rx * 100}%`, top: `${port.ry * 100}%`, transform: "translate(-50%, -50%)" }}
            className={`absolute w-3.5 h-3.5 rounded-full border-2 cursor-crosshair transition-all z-30 ${
              isHoveredPort
                ? "border-nx-accent bg-nx-accent scale-125 opacity-100"
                : showPorts
                  ? "border-primary bg-nx-ground hover:bg-primary hover:scale-110 opacity-100 scale-100"
                  : "border-primary bg-nx-ground opacity-0 scale-75 pointer-events-none"
            }`}
          />
        );
      })}

      <div className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-nx-ink-2">
          <GripVertical className="w-3 h-3 text-nx-ink-3" />
          <span style={customHex.isValidHex ? customHex.dotStyle : undefined} className={`w-2 h-2 rounded-full shrink-0 ${palette.dotClass}`} />
          {stage.isTerminalWon ? (
            <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="w-3 h-3" />{t("crmOpportunities.pipelinesPage.stageBadgeWon")}</span>
          ) : stage.isTerminalLost ? (
            <span className="inline-flex items-center gap-1 text-destructive"><XCircle className="w-3 h-3" />{t("crmOpportunities.pipelinesPage.stageBadgeLost")}</span>
          ) : stage.convertsToDeal ? (
            <span className="text-info">{t("crmOpportunities.pipelinesPage.stageBadgeConverts")}</span>
          ) : (
            `${t("crmOpportunities.pipelinesPage.stageBadgeStep")} ${stage.order}`
          )}
        </span>
        <Badge variant="outline" style={customHex.isValidHex ? customHex.badgeStyle : undefined} className={`text-[10px] font-mono px-1.5 py-0 ${palette.badgeClass}`}>
          {stage.probability}%
        </Badge>
      </div>

      <div className="text-xs font-bold text-nx-ink truncate">{isAr ? stage.labelAr : stage.labelEn}</div>

      <div className="flex items-center justify-between text-[10px] text-nx-ink-2 pt-1 border-t border-nx-line">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {stage.slaDays > 0 ? `${stage.slaDays}d` : t("crmOpportunities.pipelinesPage.nodeTerminalLabel")}
        </span>
        {stage.requiredExitFields.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-nx-ink font-semibold" title={stage.requiredExitFields.map((f) => formatExitFieldLabel(f, t, isAr, crmCustomFields)).join(", ")}>
            <Lock className="w-2.5 h-2.5 text-warning" />
            {stage.requiredExitFields.length} {t("crmOpportunities.pipelinesPage.nodeGuardsCount")}
          </span>
        ) : (
          <span className="text-nx-ink-3">{t("crmOpportunities.pipelinesPage.nodeOpenGate")}</span>
        )}
      </div>

      {/* Jira-Style Floating "Any" Pill + L-Shaped Orthogonal Elbow Arrow into Right Port (y=52) */}
      {globalIncoming.map((gtr, idx) => {
        const isAnySelected = selectedTransitionId === gtr.id;
        const strokeCls = isAnySelected ? "stroke-primary" : "stroke-nx-ink-2";
        return (
          <div
            key={gtr.id}
            style={{ left: NODE_WIDTH + 10, top: 6 + idx * 34 }}
            className="absolute z-20 pointer-events-auto select-none"
            onMouseEnter={(e) => { e.stopPropagation(); onMouseLeave(); }}
            onPointerEnter={(e) => { e.stopPropagation(); onMouseLeave(); }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartWireDraft("*", "right-1", stage.x + NODE_WIDTH + 28, stage.y + 18 + idx * 34, stage.stageKey);
            }}
            onClick={(e) => { e.stopPropagation(); onSelectGlobalTransition(gtr.id); }}
          >
            <div
              data-testid={`canvas-transition-global-${gtr.toStageKey}`}
              title={`${t("crmOpportunities.pipelinesPage.anyStatusLabel")}: ${isAr ? gtr.nameAr : gtr.nameEn}`}
              className={`h-[22px] min-w-[44px] px-3 rounded-full border text-[10px] font-bold inline-flex items-center justify-center whitespace-nowrap cursor-pointer transition-all ${
                isAnySelected ? "border-primary bg-nx-raised text-primary ring-2 ring-primary/40" : "border-nx-line-hi bg-nx-raised text-nx-ink hover:border-primary"
              }`}
            >
              {t("crmOpportunities.pipelinesPage.globalAnyPillLabel")}
            </div>
            <svg width="44" height="32" viewBox="0 0 44 32" style={{ left: -10, top: 22 }} data-testid={`canvas-any-elbow-${gtr.toStageKey}`} className="absolute overflow-visible pointer-events-auto cursor-pointer">
              <path d="M 32 0 L 32 20 Q 32 24 28 24 L 8 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={strokeCls} />
              <path d="M 14 19 L 8 24 L 14 29" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={strokeCls} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
