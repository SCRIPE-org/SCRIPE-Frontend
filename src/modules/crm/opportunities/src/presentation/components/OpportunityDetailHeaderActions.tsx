"use client";

import { usePermission } from "@core/hooks/use-permission";
import { Button } from "@core/ui/button";
import { CRM_PERMISSIONS } from "@modules/crm/shared";
import { ArrowRight, CheckCircle, RotateCcw, UserCheck, XCircle } from "lucide-react";

/** Props for `OpportunityDetailHeaderActions`. */
export interface OpportunityDetailHeaderActionsProps {
  readonly isOpen: boolean;
  readonly t: (key: string) => string;
  readonly onOpenMoveStage: () => void;
  readonly onCloseWon: () => void;
  readonly onCloseLost: () => void;
  readonly onOpenAssignOwner: () => void;
  readonly onReopen: () => void;
}

/** PBAC-gated header lifecycle actions for Deal 360. */
export function OpportunityDetailHeaderActions({
  isOpen,
  t,
  onOpenMoveStage,
  onCloseWon,
  onCloseLost,
  onOpenAssignOwner,
  onReopen,
}: OpportunityDetailHeaderActionsProps) {
  const canMoveStage = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_STAGE);
  const canCloseOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CLOSE);
  const canReopenOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_REOPEN);
  const canAssignOpp = usePermission(CRM_PERMISSIONS.RECORDS_ASSIGN);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOpen ? (
        <>
          {canMoveStage && (
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
          )}
          {canCloseOpp && (
            <>
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
            </>
          )}
          {canAssignOpp && (
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
          )}
        </>
      ) : canReopenOpp ? (
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
      ) : null}
    </div>
  );
}
