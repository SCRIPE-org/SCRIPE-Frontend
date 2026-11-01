"use client";

import React, { useState } from "react";
import { Badge } from "@core/ui/badge";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { KanbanCard } from "./KanbanCard";
import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

export interface KanbanStageDef {
  key: string;
  labelKey: string;
  defaultLabelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  winProbabilityPercent?: number | null;
  requiresParty?: boolean;
}

export interface KanbanColumnProps {
  stage: KanbanStageDef;
  opportunities: CrmOpportunity[];
  stageIndex: number;
  totalStages: number;
  onDropOpportunity: (opportunityId: string, targetStageKey: string) => void;
  onMoveForward: (opp: CrmOpportunity) => void;
  onMoveBackward: (opp: CrmOpportunity) => void;
}

/**
 * Single column in the CRM Kanban board representing a pipeline stage.
 * Enforces visual PD-1 party-verification gate indicators on Proposal and subsequent stages.
 */
export function KanbanColumn({
  stage,
  opportunities,
  stageIndex,
  totalStages,
  onDropOpportunity,
  onMoveForward,
  onMoveBackward,
}: KanbanColumnProps) {
  const { t, language } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);

  // Total deal calculation (respecting FLS masking and PD-5 per-currency discipline)
  const hasMaskedAmount = opportunities.some((o) =>
    o.maskedFieldKeys?.includes("estimatedAmount")
  );

  const distinctCurrencies = Array.from(
    new Set(opportunities.map((o) => o.currencyCode).filter(Boolean))
  );

  let formattedTotal = "—";
  if (opportunities.length === 0) {
    formattedTotal = "0";
  } else if (hasMaskedAmount) {
    formattedTotal = "••••••";
  } else if (distinctCurrencies.length <= 1) {
    const curr = distinctCurrencies[0] || "SAR";
    const sum = opportunities.reduce((acc, opp) => acc + (Number(opp.estimatedAmount) || 0), 0);
    formattedTotal = `${curr} ${sum.toLocaleString()}`;
  } else {
    // Multi-currency bucket: group by currency to strictly enforce PD-5 (never cross-sum disparate currencies)
    const sumsByCurr = distinctCurrencies.map((curr) => {
      const sum = opportunities
        .filter((o) => o.currencyCode === curr)
        .reduce((acc, opp) => acc + (Number(opp.estimatedAmount) || 0), 0);
      return `${curr} ${sum.toLocaleString()}`;
    });
    formattedTotal = sumsByCurr.join(" / ");
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
    const oppId = e.dataTransfer.getData("text/plain");
    if (oppId) {
      onDropOpportunity(oppId, stage.key);
    }
  };

  return (
    <div
      data-testid={`kanban-column-${stage.key}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col min-w-[280px] max-w-[340px] flex-1 bg-nx-ground border border-nx-line rounded-nx-lg p-3 transition-colors",
        isDragOver && "ring-2 ring-nx-accent bg-nx-raised/40 border-nx-accent"
      )}
    >
      {/* Column Header */}
      <div className="space-y-2 pb-3 mb-2 border-b border-nx-line">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-5 items-center justify-center rounded-full bg-nx-raised text-[10px] font-mono font-bold text-nx-ink-2 shrink-0 border border-nx-line">
              {stage.sortOrder}
            </span>
            <h3 className="text-xs font-bold text-nx-ink uppercase tracking-wider truncate">
              {language === "ar" && stage.labelAr
                ? stage.labelAr
                : stage.defaultLabelEn || t(stage.labelKey, { defaultValue: stage.key })}
            </h3>
            {stage.winProbabilityPercent !== undefined && stage.winProbabilityPercent !== null && (
              <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-nx-raised text-nx-ink-2 border border-nx-line shrink-0">
                {stage.winProbabilityPercent}%
              </span>
            )}
          </div>

          <Badge
            variant="secondary"
            className="text-[11px] font-mono px-1.5 py-0 bg-nx-surface text-nx-ink-2 border-nx-line shrink-0"
          >
            {opportunities.length}
          </Badge>
        </div>

        {/* PD-1 Party Verification Indicator */}
        {stage.requiresParty && (
          <div
            data-testid={`pd1-badge-${stage.key}`}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-warning/10 border border-warning/30 text-warning text-[10px] font-mono font-medium"
            title={t("crmOpportunities.kanban.proposalGateWarning", {
              defaultValue: "Verified Party required before advancing to Proposal (PD-1)",
            })}
          >
            <ShieldAlert className="size-3.5 shrink-0" />
            <span className="truncate">
              {t("crmOpportunities.kanban.proposalGateBadge", {
                defaultValue: "Party Required (PD-1)",
              })}
            </span>
          </div>
        )}

        {/* Column Value Summary */}
        <div className="flex items-center justify-between text-[11px] text-nx-ink-3 font-mono">
          <span>{t("crmOpportunities.kanban.totalValue", { defaultValue: "Total" })}</span>
          <span className="font-semibold text-nx-ink-2">{formattedTotal}</span>
        </div>
      </div>

      {/* Cards Scrollable Body */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[160px] pr-0.5">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 rounded-nx-lg border border-dashed border-nx-line/60 p-4 text-center">
            <p className="text-[11px] text-nx-ink-3">
              {t("crmOpportunities.kanban.noDealsInStage", {
                defaultValue: "No deals in this stage",
              })}
            </p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <KanbanCard
              key={opp.id}
              opportunity={opp}
              currentStageIndex={stageIndex}
              totalStages={totalStages}
              onMoveForward={onMoveForward}
              onMoveBackward={onMoveBackward}
            />
          ))
        )}
      </div>
    </div>
  );
}
