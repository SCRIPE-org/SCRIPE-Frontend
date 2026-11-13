"use client";

import { Button } from "@core/ui/button";
import { ArrowRight, CheckCircle, RotateCcw, UserCheck, XCircle } from "lucide-react";

export interface OpportunityDetailHeaderActionsProps {
  readonly isOpen: boolean;
  readonly t: (key: string) => string;
  readonly onOpenMoveStage: () => void;
  readonly onCloseWon: () => void;
  readonly onCloseLost: () => void;
  readonly onOpenAssignOwner: () => void;
  readonly onReopen: () => void;
}

export function OpportunityDetailHeaderActions({
  isOpen,
  t,
  onOpenMoveStage,
  onCloseWon,
  onCloseLost,
  onOpenAssignOwner,
  onReopen,
}: OpportunityDetailHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOpen ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="deal-detail-move-stage-btn"
            className="gap-1.5 text-xs"
            onClick={onOpenMoveStage}
          >
            <ArrowRight className="size-3.5" />
            {t("crmOpportunities.actions.moveStage")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            data-testid="deal-detail-close-won-btn"
            className="gap-1.5 text-xs text-success hover:bg-success/10"
            onClick={onCloseWon}
          >
            <CheckCircle className="size-3.5" />
            {t("crmOpportunities.actions.closeWon")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            data-testid="deal-detail-close-lost-btn"
            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
            onClick={onCloseLost}
          >
            <XCircle className="size-3.5" />
            {t("crmOpportunities.actions.closeLost")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="deal-detail-assign-owner-btn"
            className="gap-1.5 text-xs text-nx-ink-3 hover:text-nx-ink"
            onClick={onOpenAssignOwner}
          >
            <UserCheck className="size-3.5" />
            {t("crmOpportunities.actions.assignOwner")}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="deal-detail-reopen-btn"
          className="gap-1.5 text-xs text-nx-accent border-nx-line hover:border-nx-accent"
          onClick={onReopen}
        >
          <RotateCcw className="size-3.5" />
          {t("crmOpportunities.actions.reopen")}
        </Button>
      )}
    </div>
  );
}
