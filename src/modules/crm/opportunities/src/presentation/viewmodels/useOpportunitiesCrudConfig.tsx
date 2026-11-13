"use client";

import React, { useMemo, useCallback } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Search, ArrowRight, RotateCcw, CheckCircle, XCircle, ArrowUpRight, UserCheck } from "lucide-react";
import {
  CRM_PERMISSIONS,
  STAGE_COLOR_PALETTE,
  resolveDefaultStageColor,
  useCrmWorkflowsStore,
  type CrmWorkflowDefinition,
} from "@modules/crm";
import type { CrudConfig, CrudViewMode, DropEvaluationResult } from "@core/crud/components/generic-crud-view";
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
    handleOpportunityStageTransition, submitError, clearSubmitError,
    canCreateOpp, canUpdateOpp, canManagePipeline,
    openMoveStageDialog, openCloseDialog, openReopenDialog, openAssignOwnerDialog,
    setIsCreateOpen,
  } = params;

  const isRtl = language === "ar";
  const handleSelectOpportunity = useCallback(
    (opp: CrmOpportunity) => router.push(`/crm/opportunities/${opp.id}`),
    [router]
  );

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
              <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.closeWon")} title={t("crmOpportunities.actions.closeWon")} className="h-7 px-1.5 text-xs text-success hover:bg-success/10" onClick={() => handleOpportunityStageTransition(opp, "default.closed_won")}>
                <CheckCircle className="size-3.5" />
                <span className="sr-only">{t("crmOpportunities.actions.closeWon")}</span>
              </Button>
              <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.closeLost")} title={t("crmOpportunities.actions.closeLost")} className="h-7 px-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleOpportunityStageTransition(opp, "default.closed_lost")}>
                <XCircle className="size-3.5" />
                <span className="sr-only">{t("crmOpportunities.actions.closeLost")}</span>
              </Button>
              <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.assignOwner")} title={t("crmOpportunities.actions.assignOwner")} className="h-7 px-1.5 text-nx-ink-3 hover:text-nx-ink" onClick={() => openAssignOwnerDialog(opp)}>
                <UserCheck className="size-3.5" />
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs text-nx-accent border-nx-line hover:border-nx-accent whitespace-nowrap" onClick={() => handleOpportunityStageTransition(opp, "default.discovery")}>
              <RotateCcw className="size-3.5 me-1" />
              {t("crmOpportunities.actions.reopen")}
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" aria-label={t("crmOpportunities.actions.viewDetails")} title={t("crmOpportunities.actions.viewDetails")} className="h-7 px-1.5 text-nx-ink-3 hover:text-nx-ink" onClick={() => handleSelectOpportunity(opp)}>
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      );
    },
    [handleSelectOpportunity, openAssignOwnerDialog, handleOpportunityStageTransition, openMoveStageDialog, t]
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
      <div className="flex flex-wrap items-center gap-2 flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
          <Input placeholder={t("crmOpportunities.actions.searchPlaceholder")} value={search} onChange={(e) => handleSearchChange(e.target.value)} className="ps-8 h-8 text-xs border-nx-line bg-nx-surface text-nx-ink" />
        </div>
        <div className="w-48">
          <Select value={activeDealWorkflowId} onValueChange={(id) => setActiveWorkflow("deal", id)}>
            <SelectTrigger className="h-8 text-xs" data-testid="deal-pipeline-selector"><SelectValue /></SelectTrigger>
            <SelectContent>
              {dealWorkflows.map((wf) => <SelectItem key={wf.id} value={wf.id} className="text-xs">{isRtl ? wf.nameAr : wf.nameEn}</SelectItem>)}
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
        const isRtl = language === "ar";
        const oppExtras = opp as unknown as {
          solutionFitConfirmed?: boolean;
          primaryContactRole?: string | null;
          customFields?: Record<string, unknown>;
        };
        const evalResult = useCrmWorkflowsStore.getState().evaluateTransition("deal", opp.stageKey, targetStageKey, {
          hasVerifiedParty: Boolean(opp.partyId || opp.accountId),
          partyId: opp.partyId || opp.accountId || null,
          estimatedAmount: opp.estimatedAmount ?? null,
          targetCloseDate: opp.targetCloseDate ?? null,
          lossReasonCode: opp.lossReasonCode ?? null,
          solutionFitConfirmed: Boolean(oppExtras.solutionFitConfirmed),
          primaryContactRole: oppExtras.primaryContactRole ?? null,
          contactRoles: oppExtras.primaryContactRole ? [oppExtras.primaryContactRole] : undefined,
          fields: oppExtras.customFields,
          locale: isRtl ? "ar" : "en",
        });
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
      renderStageHeaderExtra: (stage, items) => {
        const sum = items.reduce((acc, curr) => acc + (Number(curr?.estimatedAmount) || 0), 0);
        return (
          <div
            data-testid={`kanban-column-${stage.stageKey}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const oppId = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("application/json");
              const opp = state.items.find((item) => item.id === oppId);
              if (opp) {
                handleOpportunityStageTransition(opp, stage.stageKey);
              }
            }}
            className="flex items-center justify-between text-[11px] font-mono text-nx-ink-3 pt-0.5"
          >
            <span>{sum > 0 ? `${sum.toLocaleString()} SAR` : "—"}</span>
          </div>
        );
      },
      onMoveItem: (opp: CrmOpportunity, targetStageKey: string, evalResult?: DropEvaluationResult) => {
        handleOpportunityStageTransition(opp, targetStageKey, evalResult);
      },
    },
    renderCardGridItem: (opp, actions) => renderOpportunityCardGridItem(opp, actions, language, handleSelectOpportunity),
    renderSplitDetail: (opp, actions) => renderOpportunitySplitDetail(opp, actions, language, t),
    columns,
    renderActions: renderOpportunityActions,
    customTableProps: {
      onSearch: undefined,
      emptyMessage: <EmptyState title={t("crmOpportunities.table.emptyTitle")} description={t("crmOpportunities.table.emptyDescription")} />,
    },
    onCreateClick: () => setIsCreateOpen(true),
  }), [
    defaultDealViewMode, isRtl, search, activeDealWorkflowId, dealWorkflows, stageFilter, stages,
    statusFilter, statuses, pipelineStages, state.items, state.stage, boardSettings,
    handleOpportunityStageTransition, submitError, clearSubmitError, canUpdateOpp, canManagePipeline,
    language, handleSelectOpportunity, columns, renderOpportunityActions, t, handleSearchChange,
    setActiveWorkflow, handleStageFilterChange, handleStatusFilterChange, setIsCreateOpen,
  ]);

  return { crudConfig, columns };
}
