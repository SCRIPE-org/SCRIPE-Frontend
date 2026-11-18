"use client";

import React from "react";
import { useCrmCurrency } from "@modules/crm";
import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

interface KanbanStageValueSummaryProps {
  stageKey: string;
  items: readonly CrmOpportunity[];
  allItems: readonly CrmOpportunity[];
  onDropStage: (opportunity: CrmOpportunity, targetStageKey: string) => void;
}

/** Displays currency-converted pipeline column totals and handles drag-drop in stage headers. */
export function KanbanStageValueSummary({
  stageKey,
  items,
  allItems,
  onDropStage,
}: KanbanStageValueSummaryProps) {
  const { baseCurrency, convertAmount } = useCrmCurrency();

  let hasUnmaskedAmount = false;
  let allAmountsMasked = items.length > 0;

  const convertedSum = items.reduce((acc, curr) => {
    const isMasked = curr.maskedFieldKeys?.includes("estimatedAmount");
    if (!isMasked) {
      allAmountsMasked = false;
      if (curr.estimatedAmount != null) {
        hasUnmaskedAmount = true;
        const fromCurrency = curr.currencyCode || "SAR";
        return acc + convertAmount(Number(curr.estimatedAmount), fromCurrency, baseCurrency);
      }
    }
    return acc;
  }, 0);

  const formattedTotal =
    items.length > 0 && allAmountsMasked
      ? "••••••"
      : hasUnmaskedAmount
        ? `${baseCurrency} ${Math.round(convertedSum).toLocaleString()}`
        : `${baseCurrency} 0`;

  return (
    <div
      data-testid={`kanban-stage-value-${stageKey}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const oppId =
          e.dataTransfer.getData("text/plain") ||
          e.dataTransfer.getData("application/json");
        const opp = allItems.find((item) => item.id === oppId);
        if (opp) {
          onDropStage(opp, stageKey);
        }
      }}
      className="flex items-center justify-between text-[11px] font-mono text-nx-ink-3 pt-0.5 tabular-nums"
    >
      <span>{formattedTotal}</span>
    </div>
  );
}
