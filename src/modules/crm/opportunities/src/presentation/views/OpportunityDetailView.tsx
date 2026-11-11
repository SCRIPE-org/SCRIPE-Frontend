"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  UserCheck,
} from "lucide-react";

import {
  CrmShell,
  ActivityTimeline,
  resolveDefaultStageColor,
  useCrmWorkflowsStore,
  CrmWorkflowTransitionDialog,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { OpportunityOverviewCard } from "../components/OpportunityOverviewCard";
import { OpportunityCommercialAndCommitteeSection } from "../components/OpportunityCommercialAndCommitteeSection";
import { OpportunityAuditTimeline } from "../components/OpportunityAuditTimeline";
import { OpportunityDetailSkeleton } from "../components/OpportunityDetailSkeleton";
import { OpportunityStageProgressionCard } from "../components/OpportunityStageProgressionCard";
import { OpportunityHqFulfillmentHandoffCard } from "../components/OpportunityHqFulfillmentHandoffCard";
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
    loading, error, data, pipeline, contactRoles, lookupPartyOptions,
    isMoveStageOpen, setIsMoveStageOpen, targetMoveStageKey, setTargetMoveStageKey,
    isCloseOpen, setIsCloseOpen, isReopenOpen, setIsReopenOpen,
    isAssignOwnerOpen, setIsAssignOwnerOpen, closeInitialOutcome, setCloseInitialOutcome,
    fulfillmentRequested, timelineVersion, isSubmitting, submitError, setSubmitError,
    handleMoveStage, handleCloseOpportunity, handleReopenOpportunity,
    handleAssignOwner, handleRequestFulfillment, handleAddContactRole, handleRemoveContactRole,
  } = useOpportunityDetailViewModel(opportunityId);

  const [isRequestingFulfillment, setIsRequestingFulfillment] = useState(false);
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [transitionFromKey, setTransitionFromKey] = useState("");
  const [transitionToKey, setTransitionToKey] = useState("");
  const [transitionEvalResult, setTransitionEvalResult] = useState<EvaluatedWorkflowTransition | null>(null);

  const handleStageTransition = async (targetStageKey: string) => {
    if (!data?.opportunity) return;
    const oppRecord = data.opportunity;
    const fromKey = oppRecord.status === "Won"
      ? "default.closed_won"
      : oppRecord.status === "Lost"
        ? "default.closed_lost"
        : (oppRecord.stageKey || "default.discovery");
    const toKey = targetStageKey === "terminal-won" ? "default.closed_won" : targetStageKey === "terminal-lost" ? "default.closed_lost" : targetStageKey;

    const evalResult = useCrmWorkflowsStore.getState().evaluateTransition("deal", fromKey, toKey, {
      hasVerifiedParty: Boolean(oppRecord.partyId),
      estimatedAmount: oppRecord.estimatedAmount ?? null,
      targetCloseDate: oppRecord.targetCloseDate ?? null,
    });

    if (evalResult.status === "blocked") {
      setSubmitError(evalResult.reason || t("crmOpportunities.kanban.stageMoveFailed"));
      return;
    }

    if (evalResult.status === "allowed_screen_required") {
      setTransitionFromKey(fromKey);
      setTransitionToKey(toKey);
      setTransitionEvalResult(evalResult);
      setTransitionDialogOpen(true);
      return;
    }

    await handleMoveStage({
      opportunityId: oppRecord.id,
      targetStageKey: toKey,
      expectedRowVersion: oppRecord.rowVersion,
    });
  };

  const handleTransitionSubmit = async (payload: CrmWorkflowTransitionSubmitPayload) => {
    return handleMoveStage({
      opportunityId: payload.entityId,
      targetStageKey: payload.targetStageKey,
      transitionId: payload.transitionId,
      expectedRowVersion: payload.expectedRowVersion || data?.opportunity?.rowVersion,
      partyId: payload.partyId,
      accountId: payload.accountId,
      estimatedAmount: payload.estimatedAmount,
      targetCloseDate: payload.targetCloseDate,
      lossReasonCode: payload.lossReasonCode,
      competitorName: payload.competitorName,
      closeNotes: payload.closeNotes,
      reopenReason: payload.reopenReason,
      reason: payload.reason,
      auditNote: payload.auditNote,
      customFields: payload.customFields,
    });
  };

  const onTabNav = (tab: string) => {
    if (tab !== "deals") router.push(tab === "overview" ? "/crm" : tab === "deals" ? "/crm/opportunities" : `/crm/${tab}`);
  };

  if (loading) {
    return (
      <CrmShell activeTab="deals" onTabChange={onTabNav}>
        <OpportunityDetailSkeleton />
      </CrmShell>
    );
  }

  if (error || !data) {
    return (
      <CrmShell activeTab="deals" onTabChange={onTabNav}>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/crm/opportunities")} className="gap-2">
            <ArrowLeft className="size-4" />{t("crmOpportunities.detail.backToList")}
          </Button>
          <Alert variant="destructive"><AlertDescription>{error || t("crmOpportunities.overview.errorTitle", { defaultValue: "Opportunity not found" })}</AlertDescription></Alert>
        </div>
      </CrmShell>
    );
  }

  const { opportunity: opp, stageHistory } = data;
  const isOpen = opp.status === "Open";

  const sourceStages =
    activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
      ? activeDealWorkflow.stages
      : pipeline?.stages ?? [];

  const baseStages =
    sourceStages.length > 0
      ? [...sourceStages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => {
            const rawStage = s as { category?: "todo" | "in_progress" | "done" | "lost"; color?: string; customColorHex?: string; properties?: Record<string, string> };
            return {
              key: s.stageKey,
              label: isRtl && s.labelAr ? s.labelAr : s.labelEn,
              order: s.sortOrder,
              color: resolveDefaultStageColor(s.stageKey, rawStage.category, s.sortOrder, rawStage.color),
              customColorHex: rawStage.customColorHex || rawStage.properties?.customColorHex,
              requiresParty:
                s.stageKey !== "terminal-lost" &&
                rawStage.category !== "lost" &&
                Boolean(s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId")),
            };
          })
      : DEFAULT_STAGE_STEPS.map((st) => ({
          ...st,
          color: resolveDefaultStageColor(st.key, "in_progress", st.order),
          customColorHex: undefined as string | undefined,
        }));

  const stages =
    activeDealWorkflow?.properties?.customTerminalStages === "true"
      ? baseStages
      : [
          ...baseStages,
          ...(baseStages.some((s) => s.key === "terminal-won" || s.key.includes("won"))
            ? []
            : [{ key: "terminal-won", label: t("crmOpportunities.stages.closed_won"), order: baseStages.length + 1, color: resolveDefaultStageColor("terminal-won", "done", baseStages.length + 1), customColorHex: undefined, requiresParty: true }]),
          ...(baseStages.some((s) => s.key === "terminal-lost" || s.key.includes("lost"))
            ? []
            : [{ key: "terminal-lost", label: t("crmOpportunities.stages.closed_lost"), order: baseStages.length + 2, color: resolveDefaultStageColor("terminal-lost", "lost", baseStages.length + 2), customColorHex: undefined, requiresParty: false }]),
        ];

  const currentStageObj = stages.find((s) => s.key === opp.stageKey);
  const currentSortOrder = currentStageObj?.order ?? 1;

  const handleRequestFulfillmentHandoff = async () => {
    setIsRequestingFulfillment(true);
    await handleRequestFulfillment();
    setIsRequestingFulfillment(false);
  };

  return (
    <CrmShell activeTab="deals" onTabChange={onTabNav}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"} data-testid="opportunity-detail-view">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/crm/opportunities")} className="gap-2 text-xs">
            <ArrowLeft className="size-4" />{t("crmOpportunities.detail.backToList")}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {isOpen ? (
              <>
                <Button type="button" variant="outline" size="sm" data-testid="deal-detail-move-stage-btn" className="gap-1.5 text-xs" onClick={() => { setTargetMoveStageKey(undefined); setSubmitError(null); setIsMoveStageOpen(true); }}>
                  <ArrowRight className="size-3.5" />{t("crmOpportunities.actions.moveStage")}
                </Button>
                <Button type="button" size="sm" variant="ghost" data-testid="deal-detail-close-won-btn" className="gap-1.5 text-xs text-success hover:bg-success/10" onClick={() => handleStageTransition("default.closed_won")}>
                  <CheckCircle className="size-3.5" />{t("crmOpportunities.actions.closeWon")}
                </Button>
                <Button type="button" size="sm" variant="ghost" data-testid="deal-detail-close-lost-btn" className="gap-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleStageTransition("default.closed_lost")}>
                  <XCircle className="size-3.5" />{t("crmOpportunities.actions.closeLost")}
                </Button>
                <Button type="button" variant="ghost" size="sm" data-testid="deal-detail-assign-owner-btn" className="gap-1.5 text-xs text-nx-ink-3 hover:text-nx-ink" onClick={() => { setSubmitError(null); setIsAssignOwnerOpen(true); }}>
                  <UserCheck className="size-3.5" />{t("crmOpportunities.actions.assignOwner")}
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" data-testid="deal-detail-reopen-btn" className="gap-1.5 text-xs text-nx-accent border-nx-line hover:border-nx-accent" onClick={() => handleStageTransition("default.discovery")}>
                <RotateCcw className="size-3.5" />{t("crmOpportunities.actions.reopen")}
              </Button>
            )}
          </div>
        </div>

        <OpportunityStageProgressionCard
          t={t}
          opp={opp}
          isOpen={isOpen}
          stages={stages}
          currentSortOrder={currentSortOrder}
          onSelectStageStep={(stageKey) => handleStageTransition(stageKey)}
        />

        <OpportunityOverviewCard opp={opp} />

        <OpportunityCommercialAndCommitteeSection opp={opp} isRtl={isRtl} stageHistory={stageHistory} contactRoles={contactRoles} onLookupParties={lookupPartyOptions} onAddContactRole={handleAddContactRole} onRemoveContactRole={handleRemoveContactRole} />

        <OpportunityHqFulfillmentHandoffCard t={t} opp={opp} fulfillmentRequested={fulfillmentRequested} isRequestingFulfillment={isRequestingFulfillment} onRequestFulfillmentHandoff={handleRequestFulfillmentHandoff} />

        <Card className="p-5 border-nx-line bg-nx-surface">
          <ActivityTimeline key={`${opp.id}-${opp.rowVersion || ""}-${timelineVersion}`} opportunityId={opp.id} targetLabel={opp.title} />
        </Card>

        <OpportunityAuditTimeline stageHistory={stageHistory} isRtl={isRtl} />

        <MoveStageDialog open={isMoveStageOpen} onOpenChange={setIsMoveStageOpen} opportunity={opp} initialTargetStageKey={targetMoveStageKey} pipeline={pipeline} onSubmit={handleMoveStage} onLookupParties={lookupPartyOptions} isSubmitting={isSubmitting} submitError={submitError} />
        <CloseOpportunityDialog open={isCloseOpen} onOpenChange={setIsCloseOpen} opportunity={opp} initialOutcome={closeInitialOutcome} onSubmit={handleCloseOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <ReopenOpportunityDialog open={isReopenOpen} onOpenChange={setIsReopenOpen} opportunity={opp} onSubmit={handleReopenOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <AssignOwnerDialog open={isAssignOwnerOpen} onOpenChange={setIsAssignOwnerOpen} opportunity={opp} onSubmit={handleAssignOwner} isSubmitting={isSubmitting} submitError={submitError} />

        {(() => {
          const fromStage = activeDealWorkflow?.stages.find((s) => s.stageKey === transitionFromKey);
          const toStage = activeDealWorkflow?.stages.find((s) => s.stageKey === transitionToKey);
          return (
            <CrmWorkflowTransitionDialog
              open={transitionDialogOpen}
              onOpenChange={setTransitionDialogOpen}
              entityType="deal"
              record={opp ? {
                id: opp.id,
                title: opp.title,
                partyId: opp.partyId || opp.accountId,
                estimatedValue: opp.estimatedAmount,
                currency: opp.currencyCode,
                targetCloseDate: opp.targetCloseDate,
                rowVersion: opp.rowVersion,
              } : null}
              fromStageKey={transitionFromKey}
              toStageKey={transitionToKey}
              fromStageLabel={fromStage ? (isRtl && fromStage.labelAr ? fromStage.labelAr : fromStage.labelEn) : undefined}
              toStageLabel={toStage ? (isRtl && toStage.labelAr ? toStage.labelAr : toStage.labelEn) : undefined}
              evalResult={transitionEvalResult}
              onSubmit={handleTransitionSubmit}
              isSubmitting={isSubmitting}
            />
          );
        })()}
      </div>
    </CrmShell>
  );
}
