"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import { useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity, OpportunityStatus, PagedOpportunitiesResult, PipelineStageConfig } from "../../domain/entities/OpportunityEntity";
import {
  buildOpportunitiesPagination,
  lookupOpportunityPartyOptions,
} from "../utils/opportunityViewModelHelpers";
import { useOpportunityLifecycleActions } from "./useOpportunityLifecycleActions";
import { useOpportunityStageActions } from "./useOpportunityStageActions";

/** Query-backed view state exposed by `useOpportunitiesViewModel`. */
export interface OpportunitiesState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmOpportunity[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/**
 * ViewModel hook driving CRM Opportunities list, Kanban, CardGrid, and SplitPane views
 * using TanStack Query v5 and unified workflow stage actions.
 */
export function useOpportunitiesViewModel(initialSearch?: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmOpportunity | null>(null);
  const [viewItem, setViewItem] = useState<CrmOpportunity | null>(null);

  const queryParams = {
    page,
    pageSize,
    search: search.trim() || undefined,
    stageKey: stageFilter || undefined,
    status: statusFilter || undefined,
  };
  const oppQueryKey = qk.crm.opportunities(tenantId, queryParams);

  const oppQuery = useQuery<PagedOpportunitiesResult>(
    {
      queryKey: oppQueryKey,
      queryFn: () => getCrmContainer().opportunityRepository.getOpportunities(queryParams),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const pipelinesQuery = useQuery(
    {
      queryKey: qk.crm.pipelines(tenantId),
      queryFn: async () => {
        const wfRepo = getCrmContainer().workflowRepository;
        return typeof wfRepo?.getPipelines === "function" ? wfRepo.getPipelines("deal") : [];
      },
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const pipelinesData = pipelinesQuery.data;
  useEffect(() => {
    if (Array.isArray(pipelinesData) && pipelinesData.length > 0) {
      useCrmWorkflowsStore.getState().hydrateFromBackendPipelines(pipelinesData);
    }
  }, [pipelinesData]);

  const fetchOpportunities = useCallback(
    async (pageToLoad?: number) => {
      if (typeof pageToLoad === "number" && pageToLoad !== page) setPage(pageToLoad);
      await oppQuery.refetch();
    },
    [oppQuery, page],
  );

  const lifecycle = useOpportunityLifecycleActions(fetchOpportunities, page, setIsSubmitting, setSubmitError);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    startTransition(() => { setPage(1); });
  }, []);

  const handleStageFilterChange = useCallback((stageKey: string | undefined) => {
    setStageFilter(stageKey);
    startTransition(() => { setPage(1); });
  }, []);

  const handleStatusFilterChange = useCallback((status: OpportunityStatus | undefined) => {
    setStatusFilter(status);
    startTransition(() => { setPage(1); });
  }, []);

  const handlePageChange = useCallback((newPage: number) => setPage(newPage), []);
  const handlePageSizeChange = useCallback((newSize: number) => { setPageSize(newSize); setPage(1); }, []);

  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const effectivePipelineStages: PipelineStageConfig[] =
    activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
      ? activeDealWorkflow.stages
      : (pipelinesQuery.data?.[0]?.stages ?? lifecycle.pipeline?.stages ?? []);

  const updateItemStageOptimistic = useCallback(
    (oppId: string, newStageKey: string, fullItem?: CrmOpportunity) => {
      safeQueryClient.setQueryData<PagedOpportunitiesResult>(oppQueryKey, (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === oppId ? (fullItem ?? { ...item, stageKey: newStageKey }) : item
              ),
            }
          : prev
      );
    },
    [oppQueryKey, safeQueryClient],
  );

  const stageActions = useOpportunityStageActions(
    fetchOpportunities,
    page,
    effectivePipelineStages,
    () => undefined,
    () => undefined,
    updateItemStageOptimistic,
    setIsSubmitting,
    setSubmitError,
  );

  const items = oppQuery.data?.items ?? [];
  const totalCount = oppQuery.data?.totalCount ?? 0;
  const queryError = oppQuery.error instanceof Error ? oppQuery.error.message : null;
  const state: OpportunitiesState = {
    stage: oppQuery.isLoading ? "loading" : oppQuery.isError ? "failed" : "success",
    items,
    totalCount,
    page,
    pageSize,
    error: queryError,
  };

  const refresh = useCallback(() => oppQuery.refetch(), [oppQuery]);

  return {
    state,
    search,
    stageFilter,
    statusFilter,
    pipeline: pipelinesQuery.data?.[0] ?? lifecycle.pipeline,
    pipelineStages: effectivePipelineStages,
    isCreateOpen,
    isAssignOwnerOpen: lifecycle.isAssignOwnerOpen,
    activeOpportunity: lifecycle.activeOpportunity,
    isSubmitting,
    submitError,
    setSubmitError,
    setIsCreateOpen,
    setIsAssignOwnerOpen: lifecycle.setIsAssignOwnerOpen,
    handleSearchChange,
    handleStageFilterChange,
    handleStatusFilterChange,
    handlePageChange,
    handleCreateOpportunity: stageActions.handleCreateOpportunity,
    handleMoveStage: stageActions.handleMoveStage,
    handleMoveStageOptimistic: stageActions.handleMoveStageOptimistic,
    handleCloseOpportunity: lifecycle.handleCloseOpportunity,
    handleReopenOpportunity: lifecycle.handleReopenOpportunity,
    handleAssignOwner: lifecycle.handleAssignOwner,
    openAssignOwnerDialog: lifecycle.openAssignOwnerDialog,
    lookupPartyOptions: (query?: string) =>
      lookupOpportunityPartyOptions(getCrmContainer().accountRepository, query),
    clearSubmitError: () => setSubmitError(null),
    refresh,
    items,
    loading: oppQuery.isLoading,
    error: queryError,
    pagination: buildOpportunitiesPagination(page, pageSize, totalCount, handlePageChange, handlePageSizeChange),
    searchValue: search,
    selectedItems,
    setSelectedItems,
    isCreateModalOpen: false,
    setIsCreateModalOpen: setIsCreateOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    editingItem,
    viewItem,
    openEditModal: (item: CrmOpportunity) => { setEditingItem(item); setIsEditModalOpen(true); },
    closeEditModal: () => { setIsEditModalOpen(false); setEditingItem(null); },
    openViewModal: (item: CrmOpportunity) => { setViewItem(item); setViewModalOpen(true); },
    closeViewModal: () => { setViewModalOpen(false); setViewItem(null); },
    changePage: handlePageChange,
    changePageSize: handlePageSizeChange,
    refreshItems: refresh,
    createItem: stageActions.handleCreateOpportunity,
  };
}
