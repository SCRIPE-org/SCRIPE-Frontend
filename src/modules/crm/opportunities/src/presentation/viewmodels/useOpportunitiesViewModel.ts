"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity, OpportunityStatus } from "../../domain/entities/OpportunityEntity";
import { lookupOpportunityPartyOptions } from "./useOpportunityViewModelHelpers";
import { useOpportunityLifecycleActions } from "./useOpportunityLifecycleActions";
import { useOpportunityStageActions } from "./useOpportunityStageActions";

export interface OpportunitiesState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmOpportunity[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

export function useOpportunitiesViewModel(initialSearch?: string) {
  const [state, setState] = useState<OpportunitiesState>({
    stage: "loading",
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  });
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

  const fetchOpportunities = useCallback(
    async (
      pageToLoad = 1,
      currentSearch = search,
      currentStage = stageFilter,
      currentStatus = statusFilter,
      sizeToLoad = state.pageSize,
    ) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        if (!repo) throw new Error("OpportunityRepository is not registered in CRM container");
        const result = await repo.getOpportunities({
          page: pageToLoad,
          pageSize: sizeToLoad,
          search: currentSearch.trim() || undefined,
          stageKey: currentStage || undefined,
          status: currentStatus || undefined,
        });
        setState({
          stage: "success",
          items: result.items,
          totalCount: result.totalCount,
          page: result.page,
          pageSize: result.pageSize || sizeToLoad,
          error: null,
        });
      } catch (err: any) {
        setState((prev) => ({ ...prev, stage: "failed", error: err.message || "Failed to load opportunities" }));
      }
    },
    [search, stageFilter, statusFilter, state.pageSize],
  );

  const lifecycle = useOpportunityLifecycleActions(
    fetchOpportunities,
    state.page,
    setIsSubmitting,
    setSubmitError,
  );

  useEffect(() => {
    fetchOpportunities(1);
    lifecycle.fetchPipeline();
  }, [fetchOpportunities, lifecycle.fetchPipeline]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      startTransition(() => {
        fetchOpportunities(1, value, stageFilter, statusFilter);
      });
    },
    [fetchOpportunities, stageFilter, statusFilter],
  );

  const handleStageFilterChange = useCallback(
    (stageKey: string | undefined) => {
      setStageFilter(stageKey);
      startTransition(() => {
        fetchOpportunities(1, search, stageKey, statusFilter);
      });
    },
    [fetchOpportunities, search, statusFilter],
  );

  const handleStatusFilterChange = useCallback(
    (status: OpportunityStatus | undefined) => {
      setStatusFilter(status);
      startTransition(() => {
        fetchOpportunities(1, search, stageFilter, status);
      });
    },
    [fetchOpportunities, search, stageFilter],
  );

  const handlePageChange = useCallback(
    (newPage: number) => fetchOpportunities(newPage, search, stageFilter, statusFilter),
    [fetchOpportunities, search, stageFilter, statusFilter],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setState((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
      fetchOpportunities(1, search, stageFilter, statusFilter, newSize);
    },
    [fetchOpportunities, search, stageFilter, statusFilter],
  );

  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const effectivePipelineStages =
    activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
      ? activeDealWorkflow.stages
      : lifecycle.pipeline?.stages ?? [];

  const updateItemStageOptimistic = useCallback(
    (oppId: string, newStageKey: string, fullItem?: CrmOpportunity) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === oppId ? (fullItem ?? { ...item, stageKey: newStageKey }) : item,
        ),
      }));
    },
    [],
  );

  const stageActions = useOpportunityStageActions(
    fetchOpportunities,
    state.page,
    effectivePipelineStages,
    lifecycle.openCloseDialog,
    lifecycle.openMoveStageDialog,
    updateItemStageOptimistic,
    setIsSubmitting,
    setSubmitError,
  );

  const refresh = useCallback(() => fetchOpportunities(state.page), [fetchOpportunities, state.page]);

  return {
    state,
    search,
    stageFilter,
    statusFilter,
    pipeline: lifecycle.pipeline,
    pipelineStages: effectivePipelineStages,
    isPipelineAdminOpen: lifecycle.isPipelineAdminOpen,
    isCreateOpen,
    isMoveStageOpen: lifecycle.isMoveStageOpen,
    targetMoveStageKey: lifecycle.targetMoveStageKey,
    isCloseOpen: lifecycle.isCloseOpen,
    isReopenOpen: lifecycle.isReopenOpen,
    isAssignOwnerOpen: lifecycle.isAssignOwnerOpen,
    activeOpportunity: lifecycle.activeOpportunity,
    closeInitialOutcome: lifecycle.closeInitialOutcome,
    isSubmitting,
    submitError,
    setSubmitError,
    pipelineError: lifecycle.pipelineError,
    setIsPipelineAdminOpen: lifecycle.setIsPipelineAdminOpen,
    openPipelineAdminDialog: () => {
      lifecycle.setPipelineError(null);
      lifecycle.setIsPipelineAdminOpen(true);
    },
    handleUpdatePipeline: lifecycle.handleUpdatePipeline,
    fetchPipeline: lifecycle.fetchPipeline,
    setIsCreateOpen,
    setIsMoveStageOpen: lifecycle.setIsMoveStageOpen,
    setIsCloseOpen: lifecycle.setIsCloseOpen,
    setIsReopenOpen: lifecycle.setIsReopenOpen,
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
    openMoveStageDialog: lifecycle.openMoveStageDialog,
    openCloseDialog: lifecycle.openCloseDialog,
    openReopenDialog: lifecycle.openReopenDialog,
    openAssignOwnerDialog: lifecycle.openAssignOwnerDialog,
    lookupPartyOptions: lookupOpportunityPartyOptions,
    clearSubmitError: () => setSubmitError(null),
    refresh,
    items: state.items,
    loading: state.stage === "loading",
    error: state.error,
    pagination: {
      page: state.page || 1,
      currentPage: state.page || 1,
      pageSize: state.pageSize || 20,
      itemsCount: state.totalCount,
      pagesCount: Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 20))),
      totalCount: state.totalCount,
      totalPages: Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 20))),
      hasNextPage: state.page * state.pageSize < state.totalCount,
      hasPreviousPage: state.page > 1,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
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
    openEditModal: (item: CrmOpportunity) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
    },
    closeEditModal: () => {
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    openViewModal: (item: CrmOpportunity) => {
      setViewItem(item);
      setViewModalOpen(true);
    },
    closeViewModal: () => {
      setViewModalOpen(false);
      setViewItem(null);
    },
    changePage: handlePageChange,
    changePageSize: handlePageSizeChange,
    refreshItems: refresh,
    createItem: stageActions.handleCreateOpportunity,
  };
}
