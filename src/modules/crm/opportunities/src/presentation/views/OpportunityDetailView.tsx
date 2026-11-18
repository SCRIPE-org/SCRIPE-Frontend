"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { ArrowLeft } from "lucide-react";

import {
  CrmShell,
  ActivityTimeline,
  resolveDefaultStageColor,
  useCrmWorkflowsStore,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { OpportunityOverviewCard } from "../components/OpportunityOverviewCard";
import { OpportunityCommercialAndCommitteeSection } from "../components/OpportunityCommercialAndCommitteeSection";
import { OpportunityCommercialQuoteAndPlaybookSection } from "../components/OpportunityCommercialQuoteAndPlaybookSection";
import {
  evaluateDealStageTransition,
  mapDealTransitionPayload,
} from "../utils/opportunityTransitionHelpers";
import { OpportunityDetailHeaderActions } from "../components/OpportunityDetailHeaderActions";
import { OpportunityAuditTimeline } from "../components/OpportunityAuditTimeline";
import { OpportunityDetailSkeleton } from "../components/OpportunityDetailSkeleton";
import { OpportunityStageProgressionCard } from "../components/OpportunityStageProgressionCard";
import { OpportunityHqFulfillmentHandoffCard } from "../components/OpportunityHqFulfillmentHandoffCard";
import { OpportunityDetailDialogs } from "../components/OpportunityDetailDialogs";
import { useOpportunityDetailViewModel } from "../viewmodels/useOpportunityDetailViewModel";
import { useOpportunityDetailStages } from "../viewmodels/useOpportunityDetailStages";

export interface OpportunityDetailViewProps {
  opportunityId: string;
}

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

  const stages = useOpportunityDetailStages({
    activeDealWorkflow,
    pipeline,
    isRtl,
    t,
  });

  const handleStageTransition = async (targetStageKey: string) => {
    if (!data?.opportunity) return;
    const oppRecord = data.opportunity;
    const fromKey = oppRecord.status === "Won"
      ? "default.closed_won"
      : oppRecord.status === "Lost"
        ? "default.closed_lost"
        : (oppRecord.stageKey || "default.discovery");
    const toKey = targetStageKey === "terminal-won" ? "default.closed_won" : targetStageKey === "terminal-lost" ? "default.closed_lost" : targetStageKey;

    const evalResult = evaluateDealStageTransition({ ...oppRecord, stageKey: fromKey }, toKey, isRtl);

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
    return handleMoveStage(
      mapDealTransitionPayload(payload.entityId, payload, data?.opportunity?.rowVersion)
    );
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

          <OpportunityDetailHeaderActions
            isOpen={isOpen}
            t={t}
            onOpenMoveStage={() => { setTargetMoveStageKey(undefined); setSubmitError(null); setIsMoveStageOpen(true); }}
            onCloseWon={() => handleStageTransition("default.closed_won")}
            onCloseLost={() => handleStageTransition("default.closed_lost")}
            onOpenAssignOwner={() => { setSubmitError(null); setIsAssignOwnerOpen(true); }}
            onReopen={() => handleStageTransition("default.discovery")}
          />
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

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-nx-surface border border-nx-line p-1">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">
              {t("crmOpportunities.tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="commercial" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">
              {t("crmOpportunities.tabs.commercial")}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">
              {t("crmOpportunities.tabs.activity")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" forceMount className="space-y-4 data-[state=inactive]:hidden">
            <OpportunityCommercialQuoteAndPlaybookSection opp={opp} isRtl={isRtl} mode="playbook" />
            <OpportunityHqFulfillmentHandoffCard
              t={t}
              opp={opp}
              fulfillmentRequested={fulfillmentRequested}
              isRequestingFulfillment={isRequestingFulfillment}
              onRequestFulfillmentHandoff={handleRequestFulfillmentHandoff}
            />
          </TabsContent>

          <TabsContent value="commercial" forceMount className="space-y-4 data-[state=inactive]:hidden">
            <OpportunityCommercialAndCommitteeSection
              opp={opp}
              isRtl={isRtl}
              stageHistory={stageHistory}
              contactRoles={contactRoles}
              onAddContactRole={handleAddContactRole}
              onRemoveContactRole={handleRemoveContactRole}
              submitError={submitError}
            />
          </TabsContent>

          <TabsContent value="activity" forceMount className="space-y-4 data-[state=inactive]:hidden">
            <Card className="p-5 border-nx-line bg-nx-surface">
              <ActivityTimeline
                key={`${opp.id}-${opp.rowVersion || ""}-${timelineVersion}`}
                opportunityId={opp.id}
                targetLabel={opp.title}
              />
            </Card>
            <OpportunityAuditTimeline stageHistory={stageHistory} isRtl={isRtl} />
          </TabsContent>
        </Tabs>

        <OpportunityDetailDialogs
          opp={opp}
          pipeline={pipeline}
          activeDealWorkflow={activeDealWorkflow}
          isRtl={isRtl}
          isSubmitting={isSubmitting}
          submitError={submitError}
          lookupPartyOptions={lookupPartyOptions}
          isMoveStageOpen={isMoveStageOpen}
          setIsMoveStageOpen={setIsMoveStageOpen}
          targetMoveStageKey={targetMoveStageKey}
          handleMoveStage={handleMoveStage}
          isCloseOpen={isCloseOpen}
          setIsCloseOpen={setIsCloseOpen}
          closeInitialOutcome={closeInitialOutcome === "Won" || closeInitialOutcome === "Lost" ? closeInitialOutcome : undefined}
          handleCloseOpportunity={handleCloseOpportunity}
          isReopenOpen={isReopenOpen}
          setIsReopenOpen={setIsReopenOpen}
          handleReopenOpportunity={handleReopenOpportunity}
          isAssignOwnerOpen={isAssignOwnerOpen}
          setIsAssignOwnerOpen={setIsAssignOwnerOpen}
          handleAssignOwner={handleAssignOwner}
          transitionDialogOpen={transitionDialogOpen}
          setTransitionDialogOpen={setTransitionDialogOpen}
          transitionFromKey={transitionFromKey}
          transitionToKey={transitionToKey}
          transitionEvalResult={transitionEvalResult}
          handleTransitionSubmit={handleTransitionSubmit}
        />
      </div>
    </CrmShell>
  );
}
