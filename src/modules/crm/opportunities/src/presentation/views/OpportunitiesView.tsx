"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { AlertCircle, RefreshCw, Plus, SlidersHorizontal } from "lucide-react";
import { cn } from "@core/common/utils";
import {
  CRM_PERMISSIONS,
  CrmShell,
  CrmSectionHeader,
  useCrmSettingsStore,
  useCrmWorkflowsStore,
  CrmWorkflowTransitionDialog,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { DropEvaluationResult } from "@core/crud/components/generic-crud-view";
import { CreateOpportunityDialog } from "../components/CreateOpportunityDialog";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { CloseOpportunityDialog } from "../components/CloseOpportunityDialog";
import { ReopenOpportunityDialog } from "../components/ReopenOpportunityDialog";
import { AssignOwnerDialog } from "../components/AssignOwnerDialog";
import { BoardSettingsDialog, type BoardSettingsConfig } from "../components/BoardSettingsDialog";
import { useOpportunitiesViewModel } from "../viewmodels/useOpportunitiesViewModel";
import { useOpportunitiesCrudConfig } from "../viewmodels/useOpportunitiesCrudConfig";
import type { CrmOpportunity, OpportunityStatus } from "../../domain/entities/OpportunityEntity";

export function OpportunitiesView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);
  const canUpdateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_UPDATE);
  const canManagePipeline = usePermission(CRM_PERMISSIONS.PIPELINES_MANAGE);
  const defaultDealViewMode = useCrmSettingsStore((s) => s.defaultDealViewMode);
  const persistedBoardSettings = useCrmSettingsStore((s) => s.boardSettings);
  const setPersistedBoardSettings = useCrmSettingsStore((s) => s.setBoardSettings);
  const workflows = useCrmWorkflowsStore((s) => s.workflows);
  const activeDealWorkflowId = useCrmWorkflowsStore((s) => s.activeDealWorkflowId);
  const setActiveWorkflow = useCrmWorkflowsStore((s) => s.setActiveWorkflow);
  const dealWorkflows = workflows.filter((w) => w.entityType === "deal");

  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const boardSettings: BoardSettingsConfig = persistedBoardSettings ?? {
    swimlaneMode: "none",
    cardDensity: "Standard",
    wipLimits: {},
  };

  const viewModel = useOpportunitiesViewModel();
  const {
    state, search, stageFilter, statusFilter, pipeline, pipelineStages,
    isCreateOpen, isMoveStageOpen, isCloseOpen, isReopenOpen, isAssignOwnerOpen,
    activeOpportunity, closeInitialOutcome, isSubmitting, submitError,
    setIsCreateOpen, setIsMoveStageOpen, setIsCloseOpen, setIsReopenOpen, setIsAssignOwnerOpen,
    handleSearchChange, handleStageFilterChange, handleStatusFilterChange,
    handleCreateOpportunity, handleMoveStage, handleMoveStageOptimistic,
    handleCloseOpportunity, handleReopenOpportunity, handleAssignOwner,
    openMoveStageDialog, openCloseDialog, openReopenDialog, openAssignOwnerDialog, clearSubmitError, refresh,
  } = viewModel;

  const [transitionTarget, setTransitionTarget] = useState<{
    opportunity: CrmOpportunity;
    targetStageKey: string;
    evalResult: EvaluatedWorkflowTransition;
  } | null>(null);
  const [isTransitionDialogOpen, setIsTransitionDialogOpen] = useState(false);

  const stages = [
    { key: undefined, label: t("crmOpportunities.actions.allStages") },
    ...(pipelineStages && pipelineStages.length >= 2
      ? [...pipelineStages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((stg) => ({ key: stg.stageKey, label: isRtl && stg.labelAr ? stg.labelAr : stg.labelEn }))
      : [
          { key: "default.discovery", label: t("crmOpportunities.stages.discovery") },
          { key: "default.qualification", label: t("crmOpportunities.stages.qualification") },
          { key: "default.solution_fit", label: t("crmOpportunities.stages.solution_fit") },
          { key: "default.proposal", label: t("crmOpportunities.stages.proposal") },
          { key: "default.negotiation", label: t("crmOpportunities.stages.negotiation") },
        ]),
  ];

  const statuses: { key: OpportunityStatus | undefined; label: string }[] = [
    { key: undefined, label: t("crmOpportunities.actions.allStatuses") },
    { key: "Open", label: t("crmOpportunities.status.open") },
    { key: "Won", label: t("crmOpportunities.status.won") },
    { key: "Lost", label: t("crmOpportunities.status.lost") },
  ];

  const handleOpportunityStageTransition = useCallback(
    async (opp: CrmOpportunity, targetStageKey: string, dropEval?: DropEvaluationResult): Promise<boolean> => {
      if (opp.stageKey === targetStageKey) return true;
      const evalResult = useCrmWorkflowsStore.getState().evaluateTransition("deal", opp.stageKey, targetStageKey, {
        hasVerifiedParty: Boolean(opp.partyId || opp.accountId),
        estimatedAmount: opp.estimatedAmount ?? null,
        targetCloseDate: opp.targetCloseDate ?? null,
      });

      if (evalResult.status === "blocked") {
        viewModel.setSubmitError(
          evalResult.reason || "Transition is restricted or locked in active workflow."
        );
        return false;
      }

      if (evalResult.status === "allowed_screen_required") {
        setTransitionTarget({
          opportunity: opp,
          targetStageKey,
          evalResult,
        });
        setIsTransitionDialogOpen(true);
        return false;
      }

      return await handleMoveStageOptimistic(opp, targetStageKey);
    },
    [handleMoveStageOptimistic, viewModel]
  );

  const handleTransitionDialogSubmit = useCallback(
    async (payload: CrmWorkflowTransitionSubmitPayload) => {
      if (!transitionTarget?.opportunity) return;
      const success = await handleMoveStage({
        opportunityId: transitionTarget.opportunity.id,
        targetStageKey: payload.targetStageKey,
        transitionId: payload.transitionId,
        reason: payload.reason,
        stageTransitionNote: payload.auditNote,
        partyId: payload.partyId,
        estimatedAmount: payload.estimatedAmount,
        actualAmount: payload.actualAmount,
        targetCloseDate: payload.targetCloseDate,
        closeNotes: payload.closeNotes,
        lossReasonCode: payload.lossReasonCode,
        competitorName: payload.competitorName,
        reopenReason: payload.reopenReason,
        expectedRowVersion: payload.expectedRowVersion,
      });
      if (success !== false) {
        setIsTransitionDialogOpen(false);
        setTransitionTarget(null);
      }
      return success;
    },
    [handleMoveStage, transitionTarget]
  );

  const { crudConfig, columns } = useOpportunitiesCrudConfig({
    router, t, language, state, search, handleSearchChange,
    activeDealWorkflowId, setActiveWorkflow, dealWorkflows,
    stageFilter, handleStageFilterChange, stages,
    statusFilter, handleStatusFilterChange, statuses,
    defaultDealViewMode, pipelineStages, boardSettings,
    handleOpportunityStageTransition, submitError, clearSubmitError,
    canCreateOpp, canUpdateOpp, canManagePipeline,
    openMoveStageDialog, openCloseDialog, openReopenDialog, openAssignOwnerDialog,
    setIsCreateOpen,
  });

  const fromStage = pipelineStages?.find((s) => s.stageKey === transitionTarget?.opportunity.stageKey);
  const toStage = pipelineStages?.find((s) => s.stageKey === transitionTarget?.targetStageKey);

  return (
    <CrmShell
      activeTab="deals"
      onTabChange={(tab) => {
        if (tab !== "deals") router.push(tab === "overview" ? "/crm" : `/crm/${tab}`);
      }}
    >
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        <CrmSectionHeader
          title={t("crmOpportunities.title")}
          subtitle={t("crmOpportunities.subtitle")}
          badge={t("crmOpportunities.overview.dealsBadge", { count: state.totalCount, defaultValue: `${state.totalCount} deals` })}
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={state.stage === "loading"} className="h-8 gap-1.5 text-xs">
                <RefreshCw className={cn("size-3.5", state.stage === "loading" && "animate-spin")} />
                <span className="hidden sm:inline">{t("crmOpportunities.actions.refresh")}</span>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBoardSettingsOpen(true)} className="h-8 gap-1.5 shrink-0 font-medium text-xs" data-testid="board-settings-button">
                <SlidersHorizontal className="size-3.5" />
                {t("crmOpportunities.boardSettings.buttonLabel")}
              </Button>
              {canCreateOpp && (
                <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 gap-1.5 shrink-0 text-xs font-bold" data-testid="create-opportunity-button">
                  <Plus className="size-3.5" />
                  {t("crmOpportunities.actions.newDeal")}
                </Button>
              )}
            </div>
          }
        />

        {submitError && (
          <Alert variant="destructive" data-testid="opportunities-transition-error-banner" className="mb-4" dir={isRtl ? "rtl" : "ltr"}>
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmOpportunities.overview.errorTitle", { defaultValue: "Transition Blocked" })}</AlertTitle>
            <AlertDescription className="mt-1 flex items-center justify-between gap-3">
              <span className="text-xs">{submitError}</span>
              <Button type="button" size="sm" variant="outline" onClick={clearSubmitError} className="text-xs h-7 shrink-0">{t("crmLeads.detail.dismissBtn", { defaultValue: "Dismiss" })}</Button>
            </AlertDescription>
          </Alert>
        )}
        {state.stage === "failed" && state.items.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmOpportunities.overview.errorTitle", { defaultValue: "Error Loading Opportunities" })}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{state.error}</span>
              <Button type="button" variant="outline" size="sm" onClick={refresh} className="ms-4">{t("crmOpportunities.actions.refresh")}</Button>
            </AlertDescription>
          </Alert>
        ) : (
          <GenericCrudView<CrmOpportunity> config={crudConfig} columns={columns} viewModel={viewModel} pagination={viewModel.pagination} />
        )}

        <CreateOpportunityDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreateOpportunity} onLookupParties={viewModel.lookupPartyOptions} isSubmitting={isSubmitting} submitError={submitError} />
        <MoveStageDialog open={isMoveStageOpen} onOpenChange={setIsMoveStageOpen} opportunity={activeOpportunity} initialTargetStageKey={viewModel.targetMoveStageKey} pipeline={pipeline} onSubmit={handleMoveStage} onLookupParties={viewModel.lookupPartyOptions} isSubmitting={isSubmitting} submitError={submitError} />
        <CloseOpportunityDialog open={isCloseOpen} onOpenChange={setIsCloseOpen} opportunity={activeOpportunity} initialOutcome={closeInitialOutcome} onSubmit={handleCloseOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <ReopenOpportunityDialog open={isReopenOpen} onOpenChange={setIsReopenOpen} opportunity={activeOpportunity} onSubmit={handleReopenOpportunity} isSubmitting={isSubmitting} submitError={submitError} />
        <AssignOwnerDialog open={isAssignOwnerOpen} onOpenChange={setIsAssignOwnerOpen} opportunity={activeOpportunity} onSubmit={handleAssignOwner} isSubmitting={isSubmitting} submitError={submitError} />
        <BoardSettingsDialog
          open={isBoardSettingsOpen}
          onOpenChange={setIsBoardSettingsOpen}
          stages={(pipelineStages ?? []).map((s) => ({ stageKey: s.stageKey, labelEn: s.labelEn, labelAr: s.labelAr }))}
          config={boardSettings}
          onConfigChange={setPersistedBoardSettings}
        />

        <CrmWorkflowTransitionDialog
          open={isTransitionDialogOpen}
          onOpenChange={setIsTransitionDialogOpen}
          entityType="deal"
          record={transitionTarget?.opportunity ?? null}
          fromStageKey={transitionTarget?.opportunity?.stageKey ?? ""}
          toStageKey={transitionTarget?.targetStageKey ?? ""}
          fromStageLabel={fromStage ? (isRtl && fromStage.labelAr ? fromStage.labelAr : fromStage.labelEn) : undefined}
          toStageLabel={toStage ? (isRtl && toStage.labelAr ? toStage.labelAr : toStage.labelEn) : undefined}
          evalResult={transitionTarget?.evalResult}
          onSubmit={handleTransitionDialogSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </CrmShell>
  );
}
