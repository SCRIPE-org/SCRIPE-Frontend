"use client";

import React, { useState } from "react";
import { Badge } from "@core/ui/badge";
import { ShieldAlert, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
  STAGE_COLOR_PALETTE,
  buildCustomHexHarmonicStyles,
  resolveDefaultStageColor,
  useCrmCurrency,
} from "@modules/crm";
import { KanbanCard } from "./KanbanCard";
import {
  computeKanbanColumnTotals,
  evaluateKanbanColumnDragState,
  resolveKanbanStageLabel,
  type KanbanStageDef,
} from "./kanbanColumnHelpers";
import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

export { type KanbanStageDef } from "./kanbanColumnHelpers";

export interface KanbanColumnProps {
  stage: KanbanStageDef;
  opportunities: CrmOpportunity[];
  stageIndex: number;
  totalStages: number;
  allStages?: KanbanStageDef[];
  wipLimit?: { min?: number; max?: number };
  cardDensity?: "Compact" | "Standard" | "Executive";
  draggedOpportunity?: CrmOpportunity | null;
  onCardDragStart?: (opp: CrmOpportunity) => void;
  onCardDragEnd?: () => void;
  canUpdateOpportunity?: boolean;
  canManagePipelines?: boolean;
  onDropOpportunity: (opportunityId: string, targetStageKey: string) => void;
  onMoveForward: (opp: CrmOpportunity) => void;
  onMoveBackward: (opp: CrmOpportunity) => void;
}

export function KanbanColumn({
  stage, opportunities, stageIndex, totalStages, allStages, wipLimit, cardDensity = "Standard",
  draggedOpportunity, onCardDragStart, onCardDragEnd, canUpdateOpportunity, canManagePipelines,
  onDropOpportunity, onMoveForward, onMoveBackward,
}: KanbanColumnProps) {
  const { t, language } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();
  const isWipExceeded = wipLimit?.max !== undefined && opportunities.length > wipLimit.max;

  const { formattedTotal, convertedBaseSum } = computeKanbanColumnTotals(
    opportunities, baseCurrency, autoConvertToBase, convertAmount,
  );

  const { isCurrent, isBlocked, isAllowed, pillType, pillText, diagnosticReason } = evaluateKanbanColumnDragState({
    stage, stageIndex, allStages, draggedOpportunity, canUpdateOpportunity, canManagePipelines, language, t,
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isBlocked || isCurrent) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isBlocked || isCurrent) return;
    const oppId = e.dataTransfer.getData("text/plain");
    if (oppId) onDropOpportunity(oppId, stage.key);
  };

  const stageColor = resolveDefaultStageColor(stage.key, stage.category, stage.sortOrder, stage.color);
  const colorMeta = STAGE_COLOR_PALETTE[stageColor] ?? STAGE_COLOR_PALETTE.blue;
  const customHexStyles = buildCustomHexHarmonicStyles(stage.customColorHex);
  const stageLabel = resolveKanbanStageLabel(language, t, stage);

  return (
    <div
      data-testid={`kanban-column-${stage.key}`}
      data-stage-color={stageColor}
      data-custom-color-hex={stage.customColorHex || undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={customHexStyles.isValidHex && !isWipExceeded && !isAllowed ? customHexStyles.cardStyle : undefined}
      className={cn(
        "flex flex-col w-full min-w-0 flex-1 bg-nx-ground border border-nx-line rounded-nx-lg transition-colors relative overflow-hidden",
        !customHexStyles.isValidHex && colorMeta.headerBorderClass,
        totalStages >= 6 ? "p-2.5" : "p-3",
        isWipExceeded && "border-destructive/60 bg-destructive/5",
        isAllowed && !isDragOver && "border-nx-accent/50 bg-nx-accent-wash/15",
        isAllowed && isDragOver && "ring-2 ring-nx-accent bg-nx-accent-wash/30 border-nx-accent",
        !isAllowed && isDragOver && !isBlocked && !isCurrent && "ring-2 ring-nx-accent bg-nx-raised/40 border-nx-accent",
        isBlocked && "cursor-not-allowed border-nx-line",
      )}
    >
      <div className="space-y-1.5 pb-2.5 mb-2 border-b border-nx-line">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn("flex size-4 items-center justify-center rounded-full text-[10px] font-mono font-bold shrink-0 border", !customHexStyles.isValidHex && colorMeta.badgeClass)}
              style={customHexStyles.isValidHex ? customHexStyles.badgeStyle : undefined}
            >
              {stage.sortOrder}
            </span>
            {stage.winProbabilityPercent !== undefined && stage.winProbabilityPercent !== null && (
              <span
                className={cn("text-[10px] font-mono px-1 py-0 rounded border shrink-0", !customHexStyles.isValidHex && colorMeta.badgeClass)}
                style={customHexStyles.isValidHex ? customHexStyles.badgeStyle : undefined}
              >
                {stage.winProbabilityPercent}%
              </span>
            )}
          </div>

          <Badge
            variant="secondary"
            data-testid={`kanban-wip-badge-${stage.key}`}
            className={cn(
              "text-[10px] font-mono px-1.5 py-0 shrink-0",
              isWipExceeded
                ? "bg-destructive/15 text-destructive border-destructive/40 font-bold"
                : !customHexStyles.isValidHex
                  ? colorMeta.badgeClass
                  : "bg-nx-surface text-nx-ink-2 border-nx-line",
            )}
            style={!isWipExceeded && customHexStyles.isValidHex ? customHexStyles.badgeStyle : undefined}
          >
            {wipLimit?.max !== undefined ? `${opportunities.length}/${wipLimit.max}` : opportunities.length}
          </Badge>
        </div>

        <h3 className="text-[11px] font-bold text-nx-ink uppercase tracking-tight truncate flex items-center gap-1.5" title={stageLabel}>
          <span
            className={cn("w-2 h-2 rounded-full shrink-0", !customHexStyles.isValidHex && colorMeta.dotClass)}
            style={customHexStyles.isValidHex ? customHexStyles.dotStyle : undefined}
          />
          <span className="truncate">{stageLabel}</span>
        </h3>

        {isAllowed && pillText && (
          <div
            data-testid={`kanban-allowed-pill-${stage.key}`}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-nx-md text-[10px] font-semibold border transition-all truncate",
              pillType === "direct" ? "bg-nx-accent/20 border-nx-accent/50 text-nx-ink" : "bg-warning/15 border-warning/40 text-warning",
            )}
          >
            {pillType === "direct" ? <CheckCircle2 className="size-3 text-nx-accent shrink-0" /> : <ShieldAlert className="size-3 text-warning shrink-0" />}
            <span className="truncate">{pillText}</span>
          </div>
        )}

        {isCurrent && (
          <div data-testid={`kanban-current-pill-${stage.key}`} className="flex items-center gap-1.5 px-2 py-0.5 rounded-nx-md text-[10px] font-medium bg-nx-raised border border-nx-line text-nx-ink-3">
            <span>{t("crmOpportunities.kanban.currentStage", { defaultValue: "Current Stage" })}</span>
          </div>
        )}

        {stage.requiresParty && (
          <div
            data-testid={`pd1-badge-${stage.key}`}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-warning/10 border border-warning/30 text-warning text-[10px] font-medium"
            title={t("crmOpportunities.kanban.proposalGateWarning", { defaultValue: "Verified party required" })}
          >
            <ShieldAlert className="size-3.5 shrink-0" />
            <span className="truncate">{t("crmOpportunities.kanban.proposalGateBadge", { defaultValue: "Customer Required" })}</span>
          </div>
        )}

        <div
          className={cn("flex items-center justify-between gap-1 font-mono pt-0.5", totalStages >= 6 ? "text-[10px]" : "text-[11px]")}
          title={convertedBaseSum !== null ? `${t("crmOpportunities.kanban.totalValue", { defaultValue: "Total" })}: ${formattedTotal}` : undefined}
        >
          <span className="text-nx-ink-3 shrink-0">
            {convertedBaseSum !== null && totalStages < 6 ? `${t("crmOpportunities.kanban.totalValue", { defaultValue: "Total" })} (${baseCurrency})` : t("crmOpportunities.kanban.totalValue", { defaultValue: "Total" })}
          </span>
          {convertedBaseSum !== null ? (
            <span data-testid={`kanban-converted-total-${stage.key}`} className="font-bold text-nx-ink truncate">
              {baseCurrency} {convertedBaseSum.toLocaleString()}
              <span className="sr-only"> {formattedTotal}</span>
            </span>
          ) : (
            <span className="font-bold text-nx-ink truncate" title={formattedTotal}>{formattedTotal}</span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[160px] pr-0.5">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 rounded-nx-lg border border-dashed border-nx-line/60 p-4 text-center">
            <p className="text-[11px] text-nx-ink-3">{t("crmOpportunities.kanban.noDealsInStage", { defaultValue: "No deals in this stage" })}</p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <KanbanCard
              key={opp.id}
              opportunity={opp}
              currentStageIndex={stageIndex}
              totalStages={totalStages}
              cardDensity={cardDensity}
              onMoveForward={onMoveForward}
              onMoveBackward={onMoveBackward}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              isDragging={draggedOpportunity?.id === opp.id}
            />
          ))
        )}
      </div>

      {isBlocked && (
        <div
          data-testid={`kanban-blocked-overlay-${stage.key}`}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 rounded-nx-lg bg-nx-ground/85 backdrop-blur-[2px] border border-dashed border-nx-line cursor-not-allowed select-none transition-all"
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "none"; }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div data-testid={`kanban-restriction-card-${stage.key}`} className="max-w-[210px] w-full p-3 rounded-nx-md bg-nx-surface/95 border border-nx-line text-center shadow-none space-y-2 pointer-events-none">
            <div className="flex items-center justify-center size-8 rounded-full bg-destructive/10 text-destructive mx-auto border border-destructive/20">
              <Lock className="size-4" />
            </div>
            <div className="text-xs font-bold text-nx-ink tracking-tight">{t("crmOpportunities.kanban.cantMoveHere", { defaultValue: "Can't move here" })}</div>
            <p className="text-[11px] leading-tight text-nx-ink-3">{diagnosticReason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
