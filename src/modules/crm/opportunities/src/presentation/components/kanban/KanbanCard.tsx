"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrmCurrency } from "@modules/crm";
import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

export interface KanbanCardProps {
  opportunity: CrmOpportunity;
  currentStageIndex: number;
  totalStages: number;
  onMoveForward?: (opp: CrmOpportunity) => void;
  onMoveBackward?: (opp: CrmOpportunity) => void;
  isDragging?: boolean;
}

/**
 * Accessible Kanban card displaying opportunity summary, party gate status, and stage shift controls.
 */
export function KanbanCard({
  opportunity,
  currentStageIndex,
  totalStages,
  onMoveForward,
  onMoveBackward,
  isDragging = false,
}: KanbanCardProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();

  const isMasked = opportunity.maskedFieldKeys?.includes("estimatedAmount");
  const currencyCode = opportunity.currencyCode || "SAR";
  const formattedAmount = isMasked
    ? "••••••"
    : opportunity.estimatedAmount != null
    ? `${currencyCode} ${Number(opportunity.estimatedAmount).toLocaleString()}`
    : "—";

  const showConvertedBadge =
    !isMasked &&
    autoConvertToBase &&
    opportunity.estimatedAmount != null &&
    currencyCode.toUpperCase() !== baseCurrency.toUpperCase();
  const convertedInBase = showConvertedBadge
    ? Math.round(
        convertAmount(Number(opportunity.estimatedAmount), currencyCode, baseCurrency)
      )
    : null;

  const closeDateObj = opportunity.targetCloseDate ? new Date(opportunity.targetCloseDate) : null;
  const formattedCloseDate =
    closeDateObj && !isNaN(closeDateObj.getTime())
      ? closeDateObj.toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
          month: "short",
          day: "numeric",
        })
      : null;

  const hasParty = Boolean(opportunity.partyId);
  const canMoveBackward = currentStageIndex > 0;
  const canMoveForward = currentStageIndex < totalStages - 1;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify(opportunity));
    e.dataTransfer.setData("text/plain", opportunity.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCardClick = () => {
    router.push(`/crm/opportunities/${opportunity.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Only handle keyboard navigation when the card container itself has focus.
    // Prevents Space/Enter on child action buttons from unexpectedly triggering router.push.
    if (e.target !== e.currentTarget) {
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (isRtl) {
        if (canMoveBackward) onMoveBackward?.(opportunity);
      } else {
        if (canMoveForward) onMoveForward?.(opportunity);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (isRtl) {
        if (canMoveForward) onMoveForward?.(opportunity);
      } else {
        if (canMoveBackward) onMoveBackward?.(opportunity);
      }
    }
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      data-testid="kanban-card"
      data-opportunity-id={opportunity.id}
      aria-label={`${opportunity.title}, ${formattedAmount}`}
      className={cn(
        "group relative p-3.5 space-y-3 cursor-grab active:cursor-grabbing select-none",
        "bg-nx-surface border border-nx-line hover:border-nx-line-hi transition-all",
        "rounded-nx-lg focus:outline-none focus:ring-1 focus:ring-nx-accent shadow-none",
        isDragging && "opacity-40 scale-[0.98]"
      )}
    >
      {/* Top Metadata Strip: Deal Kind & Customer Verification Status */}
      <div className="flex items-center justify-between gap-1.5">
        <Badge
          variant="outline"
          className="shrink-0 text-[10px] px-1.5 py-0 font-medium border-nx-line text-nx-ink-2 bg-nx-raised"
        >
          {t(`crmOpportunities.dealKind.${opportunity.dealKind}`, {
            defaultValue:
              opportunity.dealKind === "NewBusiness"
                ? "New Business"
                : opportunity.dealKind,
          })}
        </Badge>

        {hasParty ? (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-success shrink-0"
            title="Verified Account / Contact Linked"
          >
            <ShieldCheck className="size-3" />
            <span>
              {t("crmOpportunities.kanban.partyVerified", { defaultValue: "Verified" })}
            </span>
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning shrink-0"
            title="Account or Contact required before Proposal stage"
          >
            <ShieldAlert className="size-3" />
            <span>
              {t("crmOpportunities.kanban.partyUnlinked", { defaultValue: "Unlinked" })}
            </span>
          </span>
        )}
      </div>

      {/* Full-Width Deal Title (Never squished by badges) */}
      <h4
        className="text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors line-clamp-2 text-start leading-snug"
        title={opportunity.title}
      >
        {opportunity.title}
      </h4>

      {/* Full-Width Deal Value Bar */}
      <div className="rounded-md bg-nx-raised/60 border border-nx-line/60 px-2.5 py-1.5 flex items-center justify-between gap-2">
        <span className="font-bold font-mono text-nx-ink text-xs truncate">
          {formattedAmount}
        </span>
        {convertedInBase !== null && (
          <span
            data-testid="kanban-card-converted-amount"
            className="text-[10px] font-mono font-semibold text-nx-ink-2 shrink-0"
          >
            ≈ {baseCurrency} {convertedInBase.toLocaleString()}
          </span>
        )}
      </div>

      {/* Footer: Target Close Date & Accessible Stage Shift Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-nx-line/60 text-[11px] text-nx-ink-3">
        {formattedCloseDate ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px]">
            <Calendar className="size-3" />
            {formattedCloseDate}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-nx-ink-3/80">
            <Briefcase className="size-3" />
            {opportunity.stageLabelEnSnapshot || "Open Deal"}
          </span>
        )}

        {/* Keyboard-accessible movement buttons */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!canMoveBackward}
            onClick={() => onMoveBackward?.(opportunity)}
            aria-label={t("crmOpportunities.kanban.moveBackward", { defaultValue: "Move backward" })}
            className="size-6 p-0 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised rounded disabled:opacity-30"
          >
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!canMoveForward}
            onClick={() => onMoveForward?.(opportunity)}
            aria-label={t("crmOpportunities.kanban.moveForward", { defaultValue: "Move forward" })}
            className="size-6 p-0 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised rounded disabled:opacity-30"
          >
            {isRtl ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
