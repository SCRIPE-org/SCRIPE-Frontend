"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  useCrmClientPrefsStore,
  useCrmWorkflowsStore,
  CrmWorkflowTransitionDialog,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { GenericCrudView, type DropEvaluationResult } from "@core/crud/components/generic-crud-view";
import { DataExchangeToolbarActions } from "@core/data-exchange";
import { CreateOpportunityDialog } from "../components/CreateOpportunityDialog";
import { AssignOwnerDialog } from "../components/AssignOwnerDialog";
import { BoardSettingsDialog, type BoardSettingsConfig } from "../components/BoardSettingsDialog";
import { useOpportunitiesViewModel } from "../viewmodels/useOpportunitiesViewModel";
import { useOpportunitiesCrudConfig } from "../viewmodels/useOpportunitiesCrudConfig";
import {
  buildOpportunityFilterOptions,
  evaluateDealStageTransition,
  mapDealTransitionPayload,
} from "../utils/opportunityTransitionHelpers";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

/** Primary CRM Opportunities & Commercial Deals pipeline workspace view (<200 lines). */
export function OpportunitiesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoOpenCreate = searchParams?.get("create") === "1";
  const queryAccountId = searchParams?.get("accountId") || "";
  const queryPartyId = searchParams?.get("partyId") || "";
  const [autoOpenedCreate, setAutoOpenedCreate] = useState(false);
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);

  const defaultDealViewMode = useCrmClientPrefsStore((s) => s.defaultDealViewMode);
  const persistedBoardSettings = useCrmClientPrefsStore((s) => s.boardSettings);
  const setPersistedBoardSettings = useCrmClientPrefsStore((s) => s.setBoardSettings);
  const workflows = useCrmWorkflowsStore((s) => s.workflows);
  const activeDealWorkflowId = useCrmWorkflowsStore((s) => s.activeDealWorkflowId);
  const setActiveWorkflow = useCrmWorkflowsStore((s) => s.setActiveWorkflow);
  const dealWorkflows = workflows.filter((w) => w.entityType === "deal");

  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const boardSettings: BoardSettingsConfig = persistedBoardSettings ?? { swimlaneMode: "none", cardDensity: "Standard", wipLimits: {} };

  const viewModel = useOpportunitiesViewModel();
  const {
    state, search, stageFilter, statusFilter, pipelineStages,
    isCreateOpen, isAssignOwnerOpen, activeOpportunity, isSubmitting, submitError,
    setIsCreateOpen, setIsAssignOwnerOpen, setSubmitError,
    handleSearchChange, handleStageFilterChange, handleStatusFilterChange,
    handleCreateOpportunity, handleMoveStage, handleMoveStageOptimistic,
    handleAssignOwner, openAssignOwnerDialog, clearSubmitError, refresh,
  } = viewModel;
  const [transitionTarget, setTransitionTarget] = useState<{ opportunity: CrmOpportunity; targetStageKey: string; evalResult: EvaluatedWorkflowTransition } | null>(null);
  const [isTransitionDialogOpen, setIsTransitionDialogOpen] = useState(false);

  useEffect(() => {
    if (shouldAutoOpenCreate && canCreateOpp && !autoOpenedCreate) {
      setAutoOpenedCreate(true);
      setIsCreateOpen(true);
    }
  }, [shouldAutoOpenCreate, canCreateOpp, autoOpenedCreate, setIsCreateOpen]);

  const { stages, statuses } = buildOpportunityFilterOptions(pipelineStages, isRtl, t);
  const openTransitionModal = useCallback((opp: CrmOpportunity, targetStageKey: string) => {
    const evalResult = evaluateDealStageTransition(opp, targetStageKey, isRtl);
    if (evalResult.status === "blocked") {
      setSubmitError(evalResult.reason || t("crmOpportunities.kanban.blocked", { defaultValue: "Transition Blocked" }));
      return;
    }
    setTransitionTarget({ opportunity: opp, targetStageKey, evalResult });
    setIsTransitionDialogOpen(true);
  }, [isRtl, setSubmitError, t]);

  const handleOpportunityStageTransition = useCallback(async (opp: CrmOpportunity, targetStageKey: string, _dropEval?: DropEvaluationResult): Promise<boolean> => {
    if (opp.stageKey === targetStageKey) return true;
    const evalResult = evaluateDealStageTransition(opp, targetStageKey, isRtl);
    if (evalResult.status === "blocked") {
      setSubmitError(evalResult.reason || t("crmOpportunities.kanban.blocked", { defaultValue: "Transition Blocked" }));
      return false;
    }
    if (evalResult.status === "allowed_screen_required") {
      setTransitionTarget({ opportunity: opp, targetStageKey, evalResult });
      setIsTransitionDialogOpen(true);
      return false;
    }
    return await handleMoveStageOptimistic(opp, targetStageKey);
  }, [handleMoveStageOptimistic, isRtl, setSubmitError, t]);

  const handleTransitionDialogSubmit = useCallback(async (payload: CrmWorkflowTransitionSubmitPayload) => {
    if (!transitionTarget?.opportunity) return false;
    const success = await handleMoveStage(mapDealTransitionPayload(transitionTarget.opportunity.id, payload, transitionTarget.opportunity.rowVersion));
    if (success !== false) {
      setIsTransitionDialogOpen(false);
      setTransitionTarget(null);
    }
    return success;
  }, [handleMoveStage, transitionTarget]);

  const { crudConfig, columns } = useOpportunitiesCrudConfig({
    router, t, language, state, search, handleSearchChange,
    activeDealWorkflowId, setActiveWorkflow, dealWorkflows,
    stageFilter, handleStageFilterChange, stages, statusFilter, handleStatusFilterChange, statuses,
    defaultDealViewMode, pipelineStages, boardSettings,
    handleOpportunityStageTransition, onOpenTransitionModal: openTransitionModal,
    openAssignOwnerDialog, setIsCreateOpen,
  });

  const fromStage = pipelineStages?.find((s) => s.stageKey === transitionTarget?.opportunity.stageKey);
  const toStage = pipelineStages?.find((s) => s.stageKey === transitionTarget?.targetStageKey);

  return (
    <CrmShell activeTab="deals" onTabChange={(tab) => { if (tab !== "deals") router.push(tab === "overview" ? "/crm" : `/crm/${tab}`); }}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        <CrmSectionHeader
          title={t("crmOpportunities.title")}
          subtitle={t("crmOpportunities.subtitle")}
          badge={t("crmOpportunities.overview.dealsBadge", { count: state.totalCount, defaultValue: `${state.totalCount} deals` })}
          actions={
            <div className="flex items-center gap-2">
              <DataExchangeToolbarActions entityKey="crm.opportunity" enableMultiSheetMigration activeSearch={search} onImportComplete={refresh} />
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
              <Button type="button" size="sm" variant="outline" onClick={clearSubmitError} className="text-xs h-7 shrink-0">{t("crm.actions.dismiss", { defaultValue: "Dismiss" })}</Button>
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

        <CreateOpportunityDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreateOpportunity} initialAccountId={queryAccountId || undefined} initialPartyId={queryPartyId || undefined} isSubmitting={isSubmitting} submitError={submitError} />
        <AssignOwnerDialog open={isAssignOwnerOpen} onOpenChange={setIsAssignOwnerOpen} opportunity={activeOpportunity} onSubmit={handleAssignOwner} isSubmitting={isSubmitting} submitError={submitError} />
        <BoardSettingsDialog open={isBoardSettingsOpen} onOpenChange={setIsBoardSettingsOpen} stages={(pipelineStages ?? []).map((s) => ({ stageKey: s.stageKey, labelEn: s.labelEn, labelAr: s.labelAr }))} config={boardSettings} onConfigChange={setPersistedBoardSettings} />

        <CrmWorkflowTransitionDialog
          open={isTransitionDialogOpen}
          onOpenChange={setIsTransitionDialogOpen}
          entityType="deal"
          record={transitionTarget?.opportunity ? { ...transitionTarget.opportunity, contactDisplayName: transitionTarget.opportunity.primaryContactName, estimatedValue: transitionTarget.opportunity.estimatedAmount, currency: transitionTarget.opportunity.currencyCode } : null}
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
