"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  Rocket,
} from "lucide-react";
import { cn } from "@core/common/utils";

import { CrmShell, ActivityTimeline, useCrmWorkflowsStore } from "@modules/crm";
import { OpportunityOverviewCard } from "../components/OpportunityOverviewCard";
import { OpportunityAuditTimeline } from "../components/OpportunityAuditTimeline";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { CloseOpportunityDialog } from "../components/CloseOpportunityDialog";
import { ReopenOpportunityDialog } from "../components/ReopenOpportunityDialog";
import { AssignOwnerDialog } from "../components/AssignOwnerDialog";
import { useOpportunityDetailViewModel } from "../viewmodels/useOpportunityDetailViewModel";

export interface OpportunityDetailViewProps {
  opportunityId: string;
}

const DEFAULT_STAGE_STEPS = [
  { key: "default.discovery", label: "Discovery", order: 1, requiresParty: false },
  { key: "default.qualification", label: "Qualification", order: 2, requiresParty: false },
  { key: "default.solution_fit", label: "Solution Fit", order: 3, requiresParty: false },
  { key: "default.proposal", label: "Proposal", order: 4, requiresParty: true },
  { key: "default.negotiation", label: "Negotiation", order: 5, requiresParty: true },
];

export function OpportunityDetailView({ opportunityId }: OpportunityDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));

  const {
    loading,
    error,
    data,
    pipeline,
    lookupPartyOptions,
    isMoveStageOpen,
    setIsMoveStageOpen,
    targetMoveStageKey,
    setTargetMoveStageKey,
    isCloseOpen,
    setIsCloseOpen,
    isReopenOpen,
    setIsReopenOpen,
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    closeInitialOutcome,
    setCloseInitialOutcome,
    fulfillmentRequested,
    timelineVersion,
    isSubmitting,
    submitError,
    setSubmitError,
    handleMoveStage,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
    handleRequestFulfillment,
  } = useOpportunityDetailViewModel(opportunityId);

  const [isRequestingFulfillment, setIsRequestingFulfillment] = useState(false);

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

  const sourceStages =
    pipeline?.stages && pipeline.stages.length > 0 && activeDealWorkflow.id === "wf-deal-default"
      ? pipeline.stages
      : activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
        ? activeDealWorkflow.stages
        : pipeline?.stages ?? [];

  const stages =
    sourceStages.length > 0
      ? [...sourceStages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({
            key: s.stageKey,
            label: isRtl && s.labelAr ? s.labelAr : s.labelEn,
            order: s.sortOrder,
            requiresParty: Boolean(s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId")),
          }))
      : DEFAULT_STAGE_STEPS;

  const currentStageObj = stages.find((s) => s.key === opp.stageKey);
  const currentSortOrder = currentStageObj?.order ?? 1;

  const handleRequestFulfillmentHandoff = async () => {
    setIsRequestingFulfillment(true);
    await handleRequestFulfillment();
    setIsRequestingFulfillment(false);
  };

  return (
    <CrmShell activeTab="deals" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/crm/opportunities")} className="gap-2 text-xs">
            <ArrowLeft className="size-4" />
            {t("crmOpportunities.detail.backToList")}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {isOpen ? (
              <>
                <Button type="button" variant="outline" size="sm" data-testid="deal-detail-move-stage-btn" className="gap-1.5 text-xs" onClick={() => { setTargetMoveStageKey(undefined); setSubmitError(null); setIsMoveStageOpen(true); }}>
                  <ArrowRight className="size-3.5" />
                  {t("crmOpportunities.actions.moveStage")}
                </Button>
                <Button type="button" size="sm" variant="ghost" data-testid="deal-detail-close-won-btn" className="gap-1.5 text-xs text-success hover:bg-success/10" onClick={() => { setCloseInitialOutcome("Won"); setSubmitError(null); setIsCloseOpen(true); }}>
                  <CheckCircle className="size-3.5" />
                  {t("crmOpportunities.actions.closeWon")}
                </Button>
                <Button type="button" size="sm" variant="ghost" data-testid="deal-detail-close-lost-btn" className="gap-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={() => { setCloseInitialOutcome("Lost"); setSubmitError(null); setIsCloseOpen(true); }}>
                  <XCircle className="size-3.5" />
                  {t("crmOpportunities.actions.closeLost")}
                </Button>
                <Button type="button" variant="ghost" size="sm" data-testid="deal-detail-assign-owner-btn" className="gap-1.5 text-xs text-nx-ink-3 hover:text-nx-ink" onClick={() => { setSubmitError(null); setIsAssignOwnerOpen(true); }}>
                  <UserCheck className="size-3.5" />
                  {t("crmOpportunities.actions.assignOwner")}
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" data-testid="deal-detail-reopen-btn" className="gap-1.5 text-xs text-nx-accent border-nx-line hover:border-nx-accent" onClick={() => { setSubmitError(null); setIsReopenOpen(true); }}>
                <RotateCcw className="size-3.5" />
                {t("crmOpportunities.actions.reopen")}
              </Button>
            )}
          </div>
        </div>

        <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-nx-ink-2">
              {t("crmOpportunities.detail.stageProgressionTitle", { count: stages.length })}
            </span>
            <span className="text-[11px] text-nx-ink-3">
              {isOpen
                ? t("crmOpportunities.detail.stageProgressionHint")
                : t("crmOpportunities.detail.terminalStateLabel", { status: opp.status })}
            </span>
          </div>
          <div
            className="grid grid-cols-1 gap-2"
            style={{
              gridTemplateColumns: stages.length >= 2 ? `repeat(${stages.length}, minmax(130px, 1fr))` : undefined,
            }}
          >
            {stages.map((st) => {
              const isCurrent = st.key === opp.stageKey && isOpen;
              const isCompleted = opp.status === "Won" || st.order < currentSortOrder;
              return (
                <Button
                  key={st.key}
                  type="button"
                  variant="ghost"
                  disabled={!isOpen}
                  onClick={() => {
                    if (isOpen) {
                      setTargetMoveStageKey(st.key !== opp.stageKey ? st.key : undefined);
                      setSubmitError(null);
                      setIsMoveStageOpen(true);
                    }
                  }}
                  className={cn(
                    "h-auto flex items-center justify-between rounded-nx-md border px-3 py-2 text-start text-xs transition-all",
                    isCurrent
                      ? "border-nx-accent bg-nx-accent-wash/30 text-nx-accent font-bold"
                      : isCompleted
                        ? "border-success/30 bg-success/10 text-success font-semibold"
                        : "border-nx-line bg-nx-ground text-nx-ink-2 hover:border-nx-line-hi",
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px]">{st.order}.</span>
                    <span className="truncate">{st.label}</span>
                  </div>
                  {st.requiresParty && <ShieldCheck className="size-3.5 shrink-0 opacity-80" />}
                </Button>
              );
            })}
          </div>
        </Card>

        <OpportunityOverviewCard opp={opp} />

        <Card data-testid="hq-fulfillment-handoff-card" className="p-5 border-nx-line bg-nx-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Rocket className="size-4 text-nx-accent" />
              <h3 className="text-sm font-bold text-nx-ink">{t("crmOpportunities.detail.hqHandoffTitle")}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-mono",
                  fulfillmentRequested || opp.status === "Won"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-nx-line bg-nx-raised text-nx-ink-2",
                )}
              >
                {fulfillmentRequested
                  ? t("crmOpportunities.detail.fulfillmentDispatched")
                  : opp.status === "Won"
                    ? opp.hqOutcomeKind || t("crmOpportunities.detail.readyForProvisioning")
                    : t("crmOpportunities.detail.awaitingClosureHandoff")}
              </Badge>
            </div>
            <p className="text-xs text-nx-ink-2">{t("crmOpportunities.detail.hqHandoffDescription")}</p>
          </div>
          <div className="shrink-0">
            <Button
              type="button"
              variant={fulfillmentRequested ? "outline" : "default"}
              size="sm"
              data-testid="request-fulfillment-btn"
              disabled={isRequestingFulfillment || fulfillmentRequested}
              onClick={handleRequestFulfillmentHandoff}
              className="h-8 text-xs font-bold gap-1.5"
            >
              {fulfillmentRequested ? (
                <>
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>{t("crmOpportunities.detail.handoffLoggedBtn")}</span>
                </>
              ) : (
                <>
                  <Rocket className="size-3.5" />
                  <span>
                    {isRequestingFulfillment
                      ? t("crmOpportunities.detail.dispatchingBtn")
                      : t("crmOpportunities.detail.requestHqHandoffBtn")}
                  </span>
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-5 border-nx-line bg-nx-surface">
          <ActivityTimeline key={`${opp.id}-${opp.rowVersion || ""}-${timelineVersion}`} opportunityId={opp.id} targetLabel={opp.title} />
        </Card>

        <OpportunityAuditTimeline stageHistory={stageHistory} isRtl={isRtl} />

        <MoveStageDialog open={isMoveStageOpen} onOpenChange={setIsMoveStageOpen} opportunity={opp} initialTargetStageKey={targetMoveStageKey} pipeline={pipeline} onSubmit={handleMoveStage} onLookupParties={lookupPartyOptions} isSubmitting={isSubmitting} submitError={submitError} />
        <CloseOpportunityDialog open={isCloseOpen} onOpenChange={setIsCloseOpen} opportunity={opp} initialOutcome={closeInitialOutcome} onSubmit={handleCloseOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <ReopenOpportunityDialog open={isReopenOpen} onOpenChange={setIsReopenOpen} opportunity={opp} onSubmit={handleReopenOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <AssignOwnerDialog open={isAssignOwnerOpen} onOpenChange={setIsAssignOwnerOpen} opportunity={opp} onSubmit={handleAssignOwner} isSubmitting={isSubmitting} submitError={submitError} />
      </div>
    </CrmShell>
  );
}
