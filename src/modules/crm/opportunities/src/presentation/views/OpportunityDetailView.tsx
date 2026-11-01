"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  UserCheck,
} from "lucide-react";

import { CrmShell } from "@modules/crm";
import { OpportunityOverviewCard } from "../components/OpportunityOverviewCard";
import { OpportunityAuditTimeline } from "../components/OpportunityAuditTimeline";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { CloseOpportunityDialog } from "../components/CloseOpportunityDialog";
import { ReopenOpportunityDialog } from "../components/ReopenOpportunityDialog";
import { AssignOwnerDialog } from "../components/AssignOwnerDialog";
import { useOpportunityDetailViewModel } from "../viewmodels/useOpportunityDetailViewModel";
import type {
  CrmOpportunity,
  CrmOpportunityStageHistory,
  OpportunityDetailResult,
  OpportunityStatus,
  MoveOpportunityStageInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  AssignOpportunityOwnerInput,
} from "../../domain/entities/OpportunityEntity";

/**
 * Properties for OpportunityDetailView.
 */
export interface OpportunityDetailViewProps {
  opportunityId: string;
}

/**
 * Opportunity detail view presenting deal attributes, audit history, and lifecycle transitions.
 */
export function OpportunityDetailView({ opportunityId }: OpportunityDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const {
    loading,
    error,
    data,
    loadData,
    isMoveStageOpen,
    setIsMoveStageOpen,
    isCloseOpen,
    setIsCloseOpen,
    isReopenOpen,
    setIsReopenOpen,
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    closeInitialOutcome,
    setCloseInitialOutcome,
    isSubmitting,
    submitError,
    setSubmitError,
    handleMoveStage,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
  } = useOpportunityDetailViewModel(opportunityId);

  if (loading) {
    return (
      <CrmShell activeTab="deals" onTabChange={() => {}}>
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </CrmShell>
    );
  }

  if (error || !data) {
    return (
      <CrmShell activeTab="deals" onTabChange={() => {}}>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/crm/opportunities")} className="gap-2">
            <ArrowLeft className="size-4" />
            {t("crmOpportunities.detail.backToList")}
          </Button>
          <Alert variant="destructive">
            <AlertDescription>{error || "Opportunity not found"}</AlertDescription>
          </Alert>
        </div>
      </CrmShell>
    );
  }

  const { opportunity: opp, stageHistory } = data;
  const isOpen = opp.status === "Open";

  return (
    <CrmShell activeTab="deals" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/crm/opportunities")}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="size-4" />
            {t("crmOpportunities.detail.backToList")}
          </Button>

          <div className="flex items-center gap-2">
            {isOpen ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    setSubmitError(null);
                    setIsMoveStageOpen(true);
                  }}
                >
                  <ArrowRight className="size-3.5" />
                  {t("crmOpportunities.actions.moveStage")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-success hover:bg-success/10"
                  onClick={() => {
                    setCloseInitialOutcome("Won");
                    setSubmitError(null);
                    setIsCloseOpen(true);
                  }}
                >
                  <CheckCircle className="size-3.5" />
                  {t("crmOpportunities.actions.closeWon")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setCloseInitialOutcome("Lost");
                    setSubmitError(null);
                    setIsCloseOpen(true);
                  }}
                >
                  <XCircle className="size-3.5" />
                  {t("crmOpportunities.actions.closeLost")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-nx-ink-3 hover:text-nx-ink"
                  onClick={() => {
                    setSubmitError(null);
                    setIsAssignOwnerOpen(true);
                  }}
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
                className="gap-1.5 text-xs text-nx-accent border-nx-line hover:border-nx-accent"
                onClick={() => {
                  setSubmitError(null);
                  setIsReopenOpen(true);
                }}
              >
                <RotateCcw className="size-3.5" />
                {t("crmOpportunities.actions.reopen")}
              </Button>
            )}
          </div>
        </div>

        {/* Overview Header Card */}
        <OpportunityOverviewCard opp={opp} />

        {/* Stage Transition Audit History */}
        <OpportunityAuditTimeline stageHistory={stageHistory} isRtl={isRtl} />

        {/* Dialogs */}
        <MoveStageDialog
          open={isMoveStageOpen}
          onOpenChange={setIsMoveStageOpen}
          opportunity={opp}
          onSubmit={handleMoveStage}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        <CloseOpportunityDialog
          open={isCloseOpen}
          onOpenChange={setIsCloseOpen}
          opportunity={opp}
          initialOutcome={closeInitialOutcome}
          onSubmit={handleCloseOpportunity}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        <ReopenOpportunityDialog
          open={isReopenOpen}
          onOpenChange={setIsReopenOpen}
          opportunity={opp}
          onSubmit={handleReopenOpportunity}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        <AssignOwnerDialog
          open={isAssignOwnerOpen}
          onOpenChange={setIsAssignOwnerOpen}
          opportunity={opp}
          onSubmit={handleAssignOwner}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </CrmShell>
  );
}
