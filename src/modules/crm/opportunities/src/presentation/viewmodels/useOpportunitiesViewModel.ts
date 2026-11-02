"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type { CrmOpportunity, CreateOpportunityInput, AssignOpportunityOwnerInput, MoveOpportunityStageInput, CloseOpportunityInput, ReopenOpportunityInput, OpportunityStatus, PipelineDefinition, UpdateDefaultPipelineInput, } from "../../domain/entities/OpportunityEntity";
/**
 * State contract for opportunities viewmodel.
 */
export interface OpportunitiesState { stage: "idle" | "loading" | "success" | "failed";
  items: CrmOpportunity[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null; }
/**
 * ViewModel hook managing opportunities listing, search filters, and lifecycle dialog state.
 */
export function useOpportunitiesViewModel(initialSearch?: string) { const [state, setState] = useState<OpportunitiesState>({
    stage: "loading", items: [],
    totalCount: 0, page: 1,
    pageSize: 20, error: null,
  });
  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | undefined>(undefined);
  const [pipeline, setPipeline] = useState<PipelineDefinition | null>(null);
  const [isPipelineAdminOpen, setIsPipelineAdminOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMoveStageOpen, setIsMoveStageOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [activeOpportunity, setActiveOpportunity] = useState<CrmOpportunity | null>(null);
  const [closeInitialOutcome, setCloseInitialOutcome] = useState<OpportunityStatus>("Won");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  // GenericCrudView adapter state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmOpportunity | null>(null);
  const [viewItem, setViewItem] = useState<CrmOpportunity | null>(null);
  const fetchOpportunities = useCallback(
    async (pageToLoad = 1, currentSearch = search, currentStage = stageFilter, currentStatus = statusFilter) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        if (!repo) { throw new Error("OpportunityRepository is not registered in CRM container");
        }
        const result = await repo.getOpportunities({ page: pageToLoad,
          pageSize: state.pageSize, search: currentSearch.trim() || undefined,
          stageKey: currentStage || undefined, status: currentStatus || undefined,
        });
        setState({ stage: "success",
          items: result.items, totalCount: result.totalCount,
          page: result.page, pageSize: result.pageSize,
          error: null, });
      } catch (err: any) { setState((prev) => ({
          ...prev, stage: "failed",
          error: err.message || "Failed to load opportunities", }));
      } },
    [search, stageFilter, statusFilter, state.pageSize] );
  const fetchPipeline = useCallback(async () => { try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      if (repo?.getDefaultPipeline) { const pipe = await repo.getDefaultPipeline();
        setPipeline(pipe); }
    } catch {
      // Fallback to default canonical stages if pipeline endpoint is unavailable
    } }, []);
  useEffect(() => { fetchOpportunities(1);
    fetchPipeline(); }, [fetchOpportunities, fetchPipeline]);
  const handleUpdatePipeline = useCallback( async (input: UpdateDefaultPipelineInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        const updated = await repo.updateDefaultPipeline(input);
        setPipeline(updated);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        setIsPipelineAdminOpen(false);
        return true; } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to update pipeline configuration");
        return false; }
    }, [fetchOpportunities, state.page]
  );
  const handleSearchChange = useCallback( (value: string) => {
      setSearch(value);
      startTransition(() => { fetchOpportunities(1, value, stageFilter, statusFilter);
      }); },
    [fetchOpportunities, stageFilter, statusFilter] );
  const handleStageFilterChange = useCallback( (stageKey: string | undefined) => {
      setStageFilter(stageKey);
      startTransition(() => { fetchOpportunities(1, search, stageKey, statusFilter);
      }); },
    [fetchOpportunities, search, statusFilter] );
  const handleStatusFilterChange = useCallback( (status: OpportunityStatus | undefined) => {
      setStatusFilter(status);
      startTransition(() => { fetchOpportunities(1, search, stageFilter, status);
      }); },
    [fetchOpportunities, search, stageFilter] );
  const handlePageChange = useCallback( (newPage: number) => {
      fetchOpportunities(newPage, search, stageFilter, statusFilter); },
    [fetchOpportunities, search, stageFilter, statusFilter] );
  const handleCreateOpportunity = useCallback( async (input: CreateOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.createOpportunity(input);
        await fetchOpportunities(1);
        setIsSubmitting(false);
        return true; } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to create opportunity");
        return false; }
    }, [fetchOpportunities]
  );
  const handleMoveStage = useCallback( async (input: MoveOpportunityStageInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.moveStage(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true; } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to move opportunity stage");
        return false; }
    }, [fetchOpportunities, state.page]
  );
  const handleMoveStageOptimistic = useCallback( async (
      opportunity: CrmOpportunity, targetStageKey: string,
      overrideReason?: string ): Promise<boolean> => {
      if (opportunity.stageKey === targetStageKey) { return true;
      }
      setSubmitError(null);
      setState((prev) => ({ ...prev,
        items: prev.items.map((item) =>
          item.id === opportunity.id ? { ...item, stageKey: targetStageKey } : item ),
      }));
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        const updatedOpp = await repo.moveStage({ opportunityId: opportunity.id,
          targetStageKey, overrideReason,
        });
        if (updatedOpp && updatedOpp.id) { setState((prev) => ({
            ...prev, items: prev.items.map((item) =>
              item.id === updatedOpp.id ? updatedOpp : item ),
          })); }
        await fetchOpportunities(state.page);
        return true; } catch (err: any) {
        setState((prev) => ({ ...prev,
          items: prev.items.map((item) =>
            item.id === opportunity.id ? { ...item, stageKey: opportunity.stageKey } : item ),
        }));
        const message = err.message || "Failed to move opportunity stage";
        setSubmitError(message);
        return false; }
    }, [fetchOpportunities, state.page]
  );
  const handleCloseOpportunity = useCallback( async (input: CloseOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.closeOpportunity(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true; } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to close opportunity");
        return false; }
    }, [fetchOpportunities, state.page]
  );
  const handleReopenOpportunity = useCallback( async (input: ReopenOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.reopenOpportunity(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true; } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to reopen opportunity");
        return false; }
    }, [fetchOpportunities, state.page]
  );
  const handleAssignOwner = useCallback( async (input: AssignOpportunityOwnerInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.assignOwner(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true; } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to assign owner");
        return false; }
    }, [fetchOpportunities, state.page]
  );
  const openMoveStageDialog = useCallback((opp: CrmOpportunity) => { setActiveOpportunity(opp);
    setSubmitError(null);
    setIsMoveStageOpen(true); }, []);
  const openCloseDialog = useCallback((opp: CrmOpportunity, outcome: OpportunityStatus = "Won") => { setActiveOpportunity(opp);
    setCloseInitialOutcome(outcome);
    setSubmitError(null);
    setIsCloseOpen(true); }, []);
  const openReopenDialog = useCallback((opp: CrmOpportunity) => { setActiveOpportunity(opp);
    setSubmitError(null);
    setIsReopenOpen(true); }, []);
  const openAssignOwnerDialog = useCallback((opp: CrmOpportunity) => { setActiveOpportunity(opp);
    setSubmitError(null);
    setIsAssignOwnerOpen(true); }, []);
  const refresh = useCallback(() => fetchOpportunities(state.page), [fetchOpportunities, state.page]);
  return { state,
    search, stageFilter,
    statusFilter, pipeline,
    pipelineStages: pipeline?.stages ?? [], isPipelineAdminOpen,
    isCreateOpen, isMoveStageOpen,
    isCloseOpen, isReopenOpen,
    isAssignOwnerOpen, activeOpportunity,
    closeInitialOutcome, isSubmitting,
    submitError, setIsPipelineAdminOpen,
    openPipelineAdminDialog: () => setIsPipelineAdminOpen(true), handleUpdatePipeline,
    fetchPipeline, setIsCreateOpen,
    setIsMoveStageOpen, setIsCloseOpen,
    setIsReopenOpen, setIsAssignOwnerOpen,
    handleSearchChange, handleStageFilterChange,
    handleStatusFilterChange, handlePageChange,
    handleCreateOpportunity, handleMoveStage,
    handleMoveStageOptimistic, handleCloseOpportunity,
    handleReopenOpportunity, handleAssignOwner,
    openMoveStageDialog, openCloseDialog,
    openReopenDialog, openAssignOwnerDialog,
    clearSubmitError: () => setSubmitError(null), refresh,
    // GenericCrudView Adapter compatibility
    items: state.items, loading: state.stage === "loading",
    error: state.error, pagination: {
      page: state.page || 1, currentPage: state.page || 1, pageSize: state.pageSize || 20,
      itemsCount: state.totalCount, pagesCount: Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 20))),
      totalCount: state.totalCount, totalPages: Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 20))),
      hasNextPage: state.page * state.pageSize < state.totalCount, hasPreviousPage: state.page > 1,
      onPageChange: handlePageChange, onPageSizeChange: (_size: number) => {
        fetchOpportunities(1, search, stageFilter, statusFilter); },
    }, searchValue: search,
    selectedItems, setSelectedItems,
    isCreateModalOpen: isCreateOpen, setIsCreateModalOpen: setIsCreateOpen,
    isEditModalOpen, setIsEditModalOpen,
    viewModalOpen, setViewModalOpen,
    editingItem, viewItem,
    openEditModal: (item: CrmOpportunity) => { setEditingItem(item);
      setIsEditModalOpen(true); },
    closeEditModal: () => { setIsEditModalOpen(false);
      setEditingItem(null); },
    openViewModal: (item: CrmOpportunity) => { setViewItem(item);
      setViewModalOpen(true); },
    closeViewModal: () => { setViewModalOpen(false);
      setViewItem(null); },
    changePage: handlePageChange, changePageSize: (_size: number) => {
      fetchOpportunities(1, search, stageFilter, statusFilter); },
    refreshItems: refresh, createItem: handleCreateOpportunity,
  }; }
