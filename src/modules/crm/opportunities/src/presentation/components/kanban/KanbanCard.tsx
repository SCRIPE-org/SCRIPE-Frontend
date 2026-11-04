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

  const isMasked = opportunity.maskedFieldKeys?.includes("estimatedAmount");
  const currencyCode = opportunity.currencyCode || "SAR";
  const formattedAmount = isMasked
    ? "••••••"
    : opportunity.estimatedAmount != null
    ? `${currencyCode} ${Number(opportunity.estimatedAmount).toLocaleString()}`
    : "—";

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
      {/* Header: Title & Deal Kind */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors line-clamp-2 text-start leading-snug"
            title={opportunity.title}
          >
            {opportunity.title}
          </h4>
          <Badge
            variant="outline"
            className="shrink-0 text-[10px] px-1.5 py-0 uppercase font-mono tracking-wider border-nx-line text-nx-ink-2 bg-nx-raised"
          >
            {opportunity.dealKind}
          </Badge>
        </div>
      </div>

      {/* Financial & Party Meta */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-nx-line/60">
        <div>
          <span className="text-[10px] text-nx-ink-3 uppercase block leading-none mb-1 font-mono">
            {t("crmOpportunities.table.amount", { defaultValue: "Amount" })}
          </span>
          <span className="font-bold text-nx-ink text-sm">
            {formattedAmount}
          </span>
        </div>

        {/* PD-1 Party Gate Status */}
        <div className="text-end">
          <span className="text-[10px] text-nx-ink-3 uppercase block leading-none mb-1 font-mono">
            {t("crmOpportunities.table.party", { defaultValue: "Party" })}
          </span>
          {hasParty ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-success"
              title="Verified Party Linked (PD-1 Compliant)"
            >
              <ShieldCheck className="size-3.5" />
              <span>{t("crmOpportunities.kanban.partyVerified", { defaultValue: "Verified" })}</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-warning"
              title="Unlinked Party — required before Proposal stage (PD-1)"
            >
              <ShieldAlert className="size-3.5" />
              <span>{t("crmOpportunities.kanban.partyUnlinked", { defaultValue: "Unlinked" })}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer: Target Close Date & Accessible Stage Shift Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-nx-line/60 text-[11px] text-nx-ink-3">
        {formattedCloseDate ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px]">
            <Calendar className="size-3" />
            {formattedCloseDate}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-nx-ink-3/70">
            ID: {opportunity.id.slice(0, 8)}...
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
