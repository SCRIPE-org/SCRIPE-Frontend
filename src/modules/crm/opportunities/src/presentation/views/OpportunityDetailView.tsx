"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import {
  CRM_PERMISSIONS,
  CrmShell,
  useCrmWorkflowsStore,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { OpportunityOverviewCard } from "../components/OpportunityOverviewCard";
import { evaluateDealStageTransition, mapDealTransitionPayload } from "../utils/opportunityTransitionHelpers";
import { OpportunityDetailHeaderActions } from "../components/OpportunityDetailHeaderActions";
import { OpportunityDetailSkeleton } from "../components/OpportunityDetailSkeleton";
import { OpportunityStageProgressionCard } from "../components/OpportunityStageProgressionCard";
import { OpportunityDetailDialogs } from "../components/OpportunityDetailDialogs";
import { OpportunityDetailTabsSection } from "../components/OpportunityDetailTabsSection";
import { useOpportunityDetailViewModel } from "../viewmodels/useOpportunityDetailViewModel";
import { useOpportunityDetailStages } from "../viewmodels/useOpportunityDetailStages";

/** Props for `OpportunityDetailView`. */
export interface OpportunityDetailViewProps {
  opportunityId: string;
}

/** Deal 360 operational detail view gated by PBAC and unified workflow transitions (<190 lines). */
export function OpportunityDetailView({ opportunityId }: OpportunityDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canViewDeal = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_READ);
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));

  const {
    loading, error, data, pipeline, contactRoles,
    isAssignOwnerOpen, setIsAssignOwnerOpen, fulfillmentRequested,
    isSubmitting, submitError, setSubmitError,
    handleMoveStage, handleAssignOwner, handleRequestFulfillment, handleAddContactRole, handleRemoveContactRole,
  } = useOpportunityDetailViewModel(opportunityId, canViewDeal);

  const [isRequestingFulfillment, setIsRequestingFulfillment] = useState(false);
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [transitionFromKey, setTransitionFromKey] = useState("");
  const [transitionToKey, setTransitionToKey] = useState("");
  const [transitionEvalResult, setTransitionEvalResult] = useState<EvaluatedWorkflowTransition | null>(null);

  const stages = useOpportunityDetailStages({ activeDealWorkflow, pipeline, isRtl, t });

  const openTransitionForStage = async (targetStageKey: string, forceModal = false) => {
    if (!data?.opportunity) return;
    const oppRecord = data.opportunity;
    const fromKey = oppRecord.status === "Won" ? "default.closed_won" : oppRecord.status === "Lost" ? "default.closed_lost" : (oppRecord.stageKey || "default.discovery");
    const toKey = targetStageKey === "terminal-won" ? "default.closed_won" : targetStageKey === "terminal-lost" ? "default.closed_lost" : targetStageKey;

    const evalResult = evaluateDealStageTransition({ ...oppRecord, stageKey: fromKey }, toKey, isRtl);
    if (evalResult.status === "blocked") {
      setSubmitError(evalResult.reason || t("crmOpportunities.kanban.stageMoveFailed"));
      return;
    }
    if (forceModal || evalResult.status === "allowed_screen_required") {
      setTransitionFromKey(fromKey);
      setTransitionToKey(toKey);
      setTransitionEvalResult(evalResult);
      setTransitionDialogOpen(true);
      return;
    }
    await handleMoveStage({ opportunityId: oppRecord.id, targetStageKey: toKey, expectedRowVersion: oppRecord.rowVersion });
  };

  const handleTransitionSubmit = async (payload: CrmWorkflowTransitionSubmitPayload) =>
    handleMoveStage(mapDealTransitionPayload(payload.entityId, payload, data?.opportunity?.rowVersion));

  const onTabNav = (tab: string) => {
    if (tab !== "deals") router.push(tab === "overview" ? "/crm" : tab === "deals" ? "/crm/opportunities" : `/crm/${tab}`);
  };

  if (!canViewDeal) {
    return (
      <CrmShell activeTab="deals" onTabChange={onTabNav}>
        <Card className="p-6 border border-nx-line bg-nx-surface flex items-start gap-3">
          <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-nx-ink-2">{t("crm.errors.accessDenied")}</p>
        </Card>
      </CrmShell>
    );
  }

  if (loading) {
    return <CrmShell activeTab="deals" onTabChange={onTabNav}><OpportunityDetailSkeleton /></CrmShell>;
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
  const currentIdx = stages.findIndex((s) => s.key === opp.stageKey);
  const nextForwardKey = stages[currentIdx + 1]?.key ?? "default.qualification";

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
            onOpenMoveStage={() => { setSubmitError(null); void openTransitionForStage(nextForwardKey, true); }}
            onCloseWon={() => { void openTransitionForStage("default.closed_won", true); }}
            onCloseLost={() => { void openTransitionForStage("default.closed_lost", true); }}
            onOpenAssignOwner={() => { setSubmitError(null); setIsAssignOwnerOpen(true); }}
            onReopen={() => { void openTransitionForStage("default.discovery", true); }}
          />
        </div>

        <OpportunityStageProgressionCard
          t={t}
          opp={opp}
          isOpen={isOpen}
          stages={stages}
          currentSortOrder={stages[currentIdx]?.order ?? 1}
          onSelectStageStep={(stageKey) => { void openTransitionForStage(stageKey); }}
        />

        <OpportunityOverviewCard opp={opp} />

        <OpportunityDetailTabsSection
          t={t} isRtl={isRtl} opp={opp} stageHistory={stageHistory} contactRoles={contactRoles}
          fulfillmentRequested={fulfillmentRequested} isRequestingFulfillment={isRequestingFulfillment} submitError={submitError}
          onRequestFulfillmentHandoff={handleRequestFulfillmentHandoff}
          onAddContactRole={handleAddContactRole} onRemoveContactRole={handleRemoveContactRole}
        />

        <OpportunityDetailDialogs
          opp={opp}
          activeDealWorkflow={activeDealWorkflow}
          isRtl={isRtl}
          isSubmitting={isSubmitting}
          submitError={submitError}
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
