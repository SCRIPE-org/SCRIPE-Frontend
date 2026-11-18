"use client";

import React, { useMemo, useCallback } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { EmptyState } from "@core/ui/empty-state";
import { ArrowRight, RotateCcw, CheckCircle, XCircle, ArrowUpRight, UserCheck } from "lucide-react";
import {
  CRM_PERMISSIONS,
  STAGE_COLOR_PALETTE,
  resolveDefaultStageColor,
  type CrmWorkflowDefinition,
} from "@modules/crm";
import { KanbanStageValueSummary } from "../components/kanban/KanbanStageValueSummary";
import { OpportunitiesToolbarContent } from "../components/OpportunitiesToolbarContent";
import { evaluateDealStageTransition } from "../utils/opportunityTransitionHelpers";
import type { CrudConfig, CrudAction, CrudViewMode, DropEvaluationResult } from "@core/crud/components/generic-crud-view";
import { buildOpportunityColumns, renderOpportunityCardGridItem, renderOpportunitySplitDetail } from "../components/OpportunitiesTable";
import { KanbanCard } from "../components/kanban/KanbanCard";
import type { BoardSettingsConfig } from "../components/BoardSettingsDialog";
import type { CrmOpportunity, OpportunityStatus, PipelineStageConfig } from "../../domain/entities/OpportunityEntity";
import type { OpportunitiesState } from "./useOpportunitiesViewModel";

export interface UseOpportunitiesCrudConfigParams {
  router: AppRouterInstance;
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  state: OpportunitiesState;
  search: string;
  handleSearchChange: (search: string) => void;
  activeDealWorkflowId: string;
  setActiveWorkflow: (entityType: "deal" | "lead", id: string) => void;
  dealWorkflows: CrmWorkflowDefinition[];
  stageFilter: string | undefined;
  handleStageFilterChange: (stage?: string) => void;
  stages: { key: string | undefined; label: string }[];
  statusFilter: OpportunityStatus | undefined;
  handleStatusFilterChange: (status?: OpportunityStatus) => void;
  statuses: { key: OpportunityStatus | undefined; label: string }[];
  defaultDealViewMode: string;
  pipelineStages?: PipelineStageConfig[];
  boardSettings: BoardSettingsConfig;
  handleOpportunityStageTransition: (opp: CrmOpportunity, targetStageKey: string, dropEval?: DropEvaluationResult) => Promise<boolean> | void;
  submitError: string | null;
  clearSubmitError: () => void;
  canCreateOpp: boolean;
  canUpdateOpp: boolean;
  canManagePipeline: boolean;
  openMoveStageDialog: (opp: CrmOpportunity) => void;
  openCloseDialog: (opp: CrmOpportunity, outcome: "Won" | "Lost") => void;
  openReopenDialog: (opp: CrmOpportunity) => void;
  openAssignOwnerDialog: (opp: CrmOpportunity) => void;
  setIsCreateOpen: (open: boolean) => void;
}

export function useOpportunitiesCrudConfig(params: UseOpportunitiesCrudConfigParams) {
  const {
    router, t, language, state, search, handleSearchChange,
    activeDealWorkflowId, setActiveWorkflow, dealWorkflows,
    stageFilter, handleStageFilterChange, stages,
    statusFilter, handleStatusFilterChange, statuses,
    defaultDealViewMode, pipelineStages, boardSettings,
    handleOpportunityStageTransition,
    openMoveStageDialog, openAssignOwnerDialog,
    setIsCreateOpen,
  } = params;

  const isRtl = language === "ar";
  const handleSelectOpportunity = useCallback(
    (opp: CrmOpportunity) => router.push(`/crm/opportunities/${opp.id}`),
    [router]
  );

  const sortedPipelineStages = useMemo(
    () => [...(pipelineStages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [pipelineStages]
  );

  const columns = useMemo(
    () => buildOpportunityColumns(t, language, handleSelectOpportunity),
    [t, language, handleSelectOpportunity]
  );

  const crudConfig = useMemo<CrudConfig<CrmOpportunity>>(() => ({
    titleKey: "crmOpportunities.title",
    subtitleKey: "crmOpportunities.subtitle",
    resource: "crm.opportunities",
    entityTypeKey: "crm.opportunity",
    dataExchange: {
      entityKey: "crm.opportunity",
      enableMultiSheetMigration: true,
      hideToolbarActions: true,
    },
    hidePageHeader: true,
    hideActionButtons: true,
    stickyActions: true,
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
      <OpportunitiesToolbarContent
        t={t}
        isRtl={isRtl}
        search={search}
        onSearchChange={handleSearchChange}
        activeDealWorkflowId={activeDealWorkflowId}
        onSelectWorkflow={(id) => setActiveWorkflow("deal", id)}
        dealWorkflows={dealWorkflows}
        stageFilter={stageFilter}
        onStageFilterChange={handleStageFilterChange}
        stages={stages}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statuses={statuses}
      />
    ),
    kanbanGroupField: "stageKey",
    workflowKanbanConfig: {
      stages: sortedPipelineStages.map((stg) => {
        const colorToken = resolveDefaultStageColor(stg.stageKey, stg.statusCategory as any, stg.sortOrder, stg.color);
        const colorMeta = STAGE_COLOR_PALETTE[colorToken];
        const raw = stg as any;
        const customHex = raw.customColorHex || raw.properties?.customColorHex;
        return {
          stageKey: stg.stageKey,
          label: isRtl && stg.labelAr ? stg.labelAr : stg.labelEn,
          category: stg.statusCategory as any,
          colorClass: colorMeta.badgeClass,
          swatchClass: colorMeta.swatchClass,
          customColorHex: customHex,
          wipLimit: raw.properties?.wipLimit ? Number(raw.properties.wipLimit) : undefined,
        };
      }),
      stageField: "stageKey",
      evaluateDropTarget: (opp: CrmOpportunity, targetStageKey: string) => {
        const evalResult = evaluateDealStageTransition(opp, targetStageKey, language === "ar");
        const parallelCount = evalResult.matchedTransitions?.length ?? 1;
        return {
          state: evalResult.status,
          actionLabel: evalResult.actionLabel || evalResult.matchedTransition?.nameEn,
          transitionId: evalResult.matchedTransition?.id,
          transitions: evalResult.matchedTransitions,
          badgeText:
            evalResult.status === "blocked"
              ? evalResult.reason || t("crmOpportunities.kanban.blocked", { defaultValue: "Transition Blocked" })
              : parallelCount > 1
                ? t("crmOpportunities.kanban.pathsAvailable", { count: parallelCount, defaultValue: `${parallelCount} Paths Available` })
                : evalResult.status === "allowed_screen_required"
                  ? t("crmOpportunities.kanban.opensTransitionScreen", { defaultValue: "Opens Transition Screen" })
                  : t("crmOpportunities.kanban.instantMove", { defaultValue: "Instant Move" }),
          reason: evalResult.reason,
        };
      },
      renderCard: (opp: CrmOpportunity) => {
        const currentStageIndex = sortedPipelineStages.findIndex((s) => s.stageKey === opp.stageKey);
        return (
          <KanbanCard
            opportunity={opp}
            currentStageIndex={currentStageIndex >= 0 ? currentStageIndex : 0}
            totalStages={sortedPipelineStages.length || 5}
            cardDensity={boardSettings.cardDensity}
            onMoveForward={(deal) => {
              const currentIdx = sortedPipelineStages.findIndex((s) => s.stageKey === deal.stageKey);
              const nextStage = sortedPipelineStages[currentIdx + 1]?.stageKey;
              if (nextStage) handleOpportunityStageTransition(deal, nextStage);
            }}
            onMoveBackward={(deal) => {
              const currentIdx = sortedPipelineStages.findIndex((s) => s.stageKey === deal.stageKey);
              const prevStage = sortedPipelineStages[currentIdx - 1]?.stageKey;
              if (prevStage) handleOpportunityStageTransition(deal, prevStage);
            }}
          />
        );
      },
      renderStageHeaderExtra: (stage, items) => (
        <KanbanStageValueSummary
          stageKey={stage.stageKey}
          items={items}
          allItems={state.items}
          onDropStage={handleOpportunityStageTransition}
        />
      ),
      onMoveItem: (opp: CrmOpportunity, targetStageKey: string, evalResult?: DropEvaluationResult) => {
        handleOpportunityStageTransition(opp, targetStageKey, evalResult);
      },
    },
    renderCardGridItem: (opp, actions) => renderOpportunityCardGridItem(opp, actions, language, handleSelectOpportunity),
    renderSplitDetail: (opp, actions) => renderOpportunitySplitDetail(opp, actions, language, t),
    columns,
    getActions: (_vm, tFn): CrudAction<CrmOpportunity>[] => [
      {
        label: tFn("crmOpportunities.actions.viewDetails") || "View Details",
        icon: <ArrowUpRight className="size-3.5" />,
        onClick: (opp: CrmOpportunity) => handleSelectOpportunity(opp),
      },
      {
        label: tFn("crmOpportunities.actions.moveStage") || "Move Stage",
        icon: <ArrowRight className="size-3.5" />,
        show: (opp: CrmOpportunity) => opp.status === "Open",
        onClick: (opp: CrmOpportunity) => openMoveStageDialog(opp),
      },
      {
        label: tFn("crmOpportunities.actions.closeWon") || "Close Won",
        icon: <CheckCircle className="size-3.5 text-success" />,
        show: (opp: CrmOpportunity) => opp.status === "Open",
        onClick: (opp: CrmOpportunity) => { void handleOpportunityStageTransition(opp, "default.closed_won"); },
      },
      {
        label: tFn("crmOpportunities.actions.closeLost") || "Close Lost",
        icon: <XCircle className="size-3.5 text-destructive" />,
        variant: "destructive" as const,
        show: (opp: CrmOpportunity) => opp.status === "Open",
        onClick: (opp: CrmOpportunity) => { void handleOpportunityStageTransition(opp, "default.closed_lost"); },
      },
      {
        label: tFn("crmOpportunities.actions.assignOwner") || "Assign Owner",
        icon: <UserCheck className="size-3.5" />,
        show: (opp: CrmOpportunity) => opp.status === "Open",
        onClick: (opp: CrmOpportunity) => openAssignOwnerDialog(opp),
      },
      {
        label: tFn("crmOpportunities.actions.reopen") || "Reopen",
        icon: <RotateCcw className="size-3.5 text-nx-accent" />,
        show: (opp: CrmOpportunity) => opp.status !== "Open",
        onClick: (opp: CrmOpportunity) => { void handleOpportunityStageTransition(opp, "default.discovery"); },
      },
    ],
    customTableProps: {
      onSearch: undefined,
      emptyMessage: <EmptyState title={t("crmOpportunities.table.emptyTitle")} description={t("crmOpportunities.table.emptyDescription")} />,
    },
    onCreateClick: () => setIsCreateOpen(true),
  }), [
    defaultDealViewMode, isRtl, search, activeDealWorkflowId, dealWorkflows, stageFilter, stages,
    statusFilter, statuses, sortedPipelineStages, state.items, boardSettings,
    handleOpportunityStageTransition,
    language, handleSelectOpportunity, columns, t, handleSearchChange,
    setActiveWorkflow, handleStageFilterChange, handleStatusFilterChange, setIsCreateOpen,
    openMoveStageDialog, openAssignOwnerDialog,
  ]);

  return { crudConfig, columns };
}
