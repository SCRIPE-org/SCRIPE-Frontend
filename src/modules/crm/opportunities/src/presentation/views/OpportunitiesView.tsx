"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, RefreshCw, Plus, Search, SlidersHorizontal, ArrowRight, RotateCcw, CheckCircle, XCircle, ArrowUpRight, UserCheck } from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader, useCrmSettingsStore, useCrmWorkflowsStore } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudViewMode } from "@core/crud/components/generic-crud-view";
import { buildOpportunityColumns, renderOpportunityCardGridItem, renderOpportunitySplitDetail } from "../components/OpportunitiesTable";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { CreateOpportunityDialog } from "../components/CreateOpportunityDialog";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { CloseOpportunityDialog } from "../components/CloseOpportunityDialog";
import { ReopenOpportunityDialog } from "../components/ReopenOpportunityDialog";
import { AssignOwnerDialog } from "../components/AssignOwnerDialog";
import { BoardSettingsDialog, type BoardSettingsConfig } from "../components/BoardSettingsDialog";
import { useOpportunitiesViewModel } from "../viewmodels/useOpportunitiesViewModel";
import type { CrmOpportunity, OpportunityStatus } from "../../domain/entities/OpportunityEntity";

export function OpportunitiesView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);
  const canUpdateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_UPDATE);
  const canManagePipeline = usePermission(CRM_PERMISSIONS.PIPELINES_MANAGE);
  const defaultDealViewMode = useCrmSettingsStore((s) => s.defaultDealViewMode);
  const workflows = useCrmWorkflowsStore((s) => s.workflows);
  const activeDealWorkflowId = useCrmWorkflowsStore((s) => s.activeDealWorkflowId);
  const setActiveWorkflow = useCrmWorkflowsStore((s) => s.setActiveWorkflow);
  const dealWorkflows = workflows.filter((w) => w.entityType === "deal");

  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [boardSettings, setBoardSettings] = useState<BoardSettingsConfig>({
    swimlaneMode: "none",
    wipLimits: {},
  });

  const viewModel = useOpportunitiesViewModel();
  const {
    state,
    search,
    stageFilter,
    statusFilter,
    pipeline,
    pipelineStages,
    isCreateOpen,
    isMoveStageOpen,
    isCloseOpen,
    isReopenOpen,
    isAssignOwnerOpen,
    activeOpportunity,
    closeInitialOutcome,
    isSubmitting,
    submitError,
    setIsCreateOpen,
    setIsMoveStageOpen,
    setIsCloseOpen,
    setIsReopenOpen,
    setIsAssignOwnerOpen,
    handleSearchChange,
    handleStageFilterChange,
    handleStatusFilterChange,
    handleCreateOpportunity,
    handleMoveStage,
    handleMoveStageOptimistic,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
    openMoveStageDialog,
    openCloseDialog,
    openReopenDialog,
    openAssignOwnerDialog,
    clearSubmitError,
    refresh,
  } = viewModel;

  const stages = [
    { key: undefined, label: t("crmOpportunities.actions.allStages") },
    ...(pipelineStages && pipelineStages.length >= 2
      ? [...pipelineStages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((stg) => ({
            key: stg.stageKey,
            label: isRtl && stg.labelAr ? stg.labelAr : stg.labelEn,
          }))
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

  const handleSelectOpportunity = useCallback((opp: CrmOpportunity) => router.push(`/crm/opportunities/${opp.id}`), [router]);

  const renderOpportunityActions = useCallback(
    (opp: CrmOpportunity) => {
      const isOpen = opp.status === "Open";
      return (
        <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
          {isOpen ? (
            <>
              <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs whitespace-nowrap" onClick={() => openMoveStageDialog(opp)}>
                <ArrowRight className="size-3.5 me-1" />
                {t("crmOpportunities.actions.moveStage")}
              </Button>
              <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.closeWon")} title={t("crmOpportunities.actions.closeWon")} className="h-7 px-1.5 text-xs text-success hover:bg-success/10" onClick={() => openCloseDialog(opp, "Won")}>
                <CheckCircle className="size-3.5" />
                <span className="sr-only">{t("crmOpportunities.actions.closeWon")}</span>
              </Button>
              <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.closeLost")} title={t("crmOpportunities.actions.closeLost")} className="h-7 px-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={() => openCloseDialog(opp, "Lost")}>
                <XCircle className="size-3.5" />
                <span className="sr-only">{t("crmOpportunities.actions.closeLost")}</span>
              </Button>
              <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.assignOwner")} title={t("crmOpportunities.actions.assignOwner")} className="h-7 px-1.5 text-nx-ink-3 hover:text-nx-ink" onClick={() => openAssignOwnerDialog(opp)}>
                <UserCheck className="size-3.5" />
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs text-nx-accent border-nx-line hover:border-nx-accent whitespace-nowrap" onClick={() => openReopenDialog(opp)}>
              <RotateCcw className="size-3 me-1" />
              {t("crmOpportunities.actions.reopen")}
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.viewDetails")} title={t("crmOpportunities.actions.viewDetails")} className="h-7 px-1.5 text-nx-ink-3 hover:text-nx-ink" onClick={() => handleSelectOpportunity(opp)}>
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      );
    },
    [handleSelectOpportunity, openAssignOwnerDialog, openCloseDialog, openMoveStageDialog, openReopenDialog, t],
  );

  const columns = buildOpportunityColumns(t, language, handleSelectOpportunity);

  const crudConfig: CrudConfig<CrmOpportunity> = {
    titleKey: "crmOpportunities.title",
    subtitleKey: "crmOpportunities.subtitle",
    resource: "crm.opportunities",
    entityTypeKey: "crm.opportunity",
    hidePageHeader: true,
    hideActionButtons: true,
    stickyActions: false,
    searchConfig: { enabled: false },
    viewSwitchPosition: "toolbar",
    viewModes: ["Table", "Kanban", "CardGrid", "SplitPane"],
    defaultView: (defaultDealViewMode as CrudViewMode) || "Table",
    permissions: {
      canView: CRM_PERMISSIONS.OPPORTUNITIES_READ,
      canCreate: CRM_PERMISSIONS.OPPORTUNITIES_CREATE,
      canUpdate: CRM_PERMISSIONS.OPPORTUNITIES_UPDATE,
      canDelete: false,
    },
    toolbarContent: (
      <div className="flex flex-wrap items-center gap-2 flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
          <Input placeholder={t("crmOpportunities.actions.searchPlaceholder")} value={search} onChange={(e) => handleSearchChange(e.target.value)} className="ps-8 h-8 text-xs border-nx-line bg-nx-surface text-nx-ink" />
        </div>
        <div className="w-48">
          <Select value={activeDealWorkflowId} onValueChange={(id) => setActiveWorkflow("deal", id)}>
            <SelectTrigger className="h-8 text-xs" data-testid="deal-pipeline-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dealWorkflows.map((wf) => (
                <SelectItem key={wf.id} value={wf.id} className="text-xs">
                  {isRtl ? wf.nameAr : wf.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-36">
          <Select value={stageFilter || "all"} onValueChange={(val) => handleStageFilterChange(val === "all" ? undefined : val)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("crmOpportunities.actions.filterByStage")} /></SelectTrigger>
            <SelectContent>
              {stages.map((stg) => <SelectItem key={stg.key || "all"} value={stg.key || "all"}>{stg.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-32">
          <Select value={statusFilter || "all"} onValueChange={(val) => handleStatusFilterChange(val === "all" ? undefined : (val as OpportunityStatus))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("crmOpportunities.actions.filterByStatus")} /></SelectTrigger>
            <SelectContent>
              {statuses.map((st) => <SelectItem key={st.key || "all"} value={st.key || "all"}>{st.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
    customKanbanContent: (
      <KanbanBoard
        opportunities={state.items}
        stages={pipelineStages}
        boardSettings={boardSettings}
        onMoveStage={handleMoveStageOptimistic}
        errorMessage={submitError}
        onClearError={clearSubmitError}
        canUpdateOpportunity={canUpdateOpp}
        canManagePipelines={canManagePipeline}
        hideOutcomeDropzones
        isLoading={state.stage === "loading"}
      />
    ),
    renderCardGridItem: (opp, actions) => renderOpportunityCardGridItem(opp, actions, language, handleSelectOpportunity),
    renderSplitDetail: (opp, actions) => renderOpportunitySplitDetail(opp, actions, language, t),
    columns,
    renderActions: renderOpportunityActions,
    customTableProps: {
      onSearch: undefined,
      emptyMessage: <EmptyState title={t("crmOpportunities.table.emptyTitle")} description={t("crmOpportunities.table.emptyDescription")} />,
    },
    onCreateClick: () => setIsCreateOpen(true),
  };

  return (
    <CrmShell
      activeTab="deals"
      onTabChange={(tab) => {
        if (tab === "overview") router.push("/crm");
        else if (tab === "leads") router.push("/crm/leads");
      }}
    >
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        <CrmSectionHeader
          title={t("crmOpportunities.title")}
          subtitle={t("crmOpportunities.subtitle")}
          badge={`${state.totalCount} deals`}
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={state.stage === "loading"} className="h-8 gap-1.5 text-xs">
                <RefreshCw className={cn("size-3.5", state.stage === "loading" && "animate-spin")} />
                <span className="hidden sm:inline">{t("crmOpportunities.actions.refresh")}</span>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBoardSettingsOpen(true)} className="h-8 gap-1.5 shrink-0 font-medium text-xs" data-testid="board-settings-button">
                <SlidersHorizontal className="size-3.5" />
                {isRtl ? "إعدادات اللوحة" : "Board Settings"}
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

        {state.stage === "failed" && state.items.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error Loading Opportunities</AlertTitle>
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
          onConfigChange={setBoardSettings}
        />
      </div>
    </CrmShell>
  );
}
