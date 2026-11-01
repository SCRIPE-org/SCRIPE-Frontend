"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmOpportunity,
  OpportunityDetailResult,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  AssignOpportunityOwnerInput,
  MoveOpportunityStageInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  OpportunityStatus,
} from "../../domain/entities/OpportunityEntity";

/**
 * State contract for opportunities viewmodel.
 */
export interface OpportunitiesState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmOpportunity[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/**
 * ViewModel hook managing opportunities listing, search filters, and lifecycle dialog state.
 */
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
  const [isMoveStageOpen, setIsMoveStageOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);

  const [activeOpportunity, setActiveOpportunity] = useState<CrmOpportunity | null>(null);
  const [closeInitialOutcome, setCloseInitialOutcome] = useState<OpportunityStatus>("Won");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchOpportunities = useCallback(
    async (pageToLoad = 1, currentSearch = search, currentStage = stageFilter, currentStatus = statusFilter) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        if (!repo) {
          throw new Error("OpportunityRepository is not registered in CRM container");
        }

        const result = await repo.getOpportunities({
          page: pageToLoad,
          pageSize: state.pageSize,
          search: currentSearch.trim() || undefined,
          stageKey: currentStage || undefined,
          status: currentStatus || undefined,
        });

        setState({
          stage: "success",
          items: result.items,
          totalCount: result.totalCount,
          page: result.page,
          pageSize: result.pageSize,
          error: null,
        });
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          stage: "failed",
          error: err.message || "Failed to load opportunities",
        }));
      }
    },
    [search, stageFilter, statusFilter, state.pageSize]
  );

  useEffect(() => {
    fetchOpportunities(1);
  }, [fetchOpportunities]);

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
      fetchOpportunities(1, newSearch, stageFilter, statusFilter);
    },
    [fetchOpportunities, stageFilter, statusFilter]
  );

  const handleStageFilterChange = useCallback(
    (newStage: string | undefined) => {
      setStageFilter(newStage);
      fetchOpportunities(1, search, newStage, statusFilter);
    },
    [fetchOpportunities, search, statusFilter]
  );

  const handleStatusFilterChange = useCallback(
    (newStatus: OpportunityStatus | undefined) => {
      setStatusFilter(newStatus);
      fetchOpportunities(1, search, stageFilter, newStatus);
    },
    [fetchOpportunities, search, stageFilter]
  );

  const handleCreateOpportunity = useCallback(
    async (input: CreateOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.createOpportunity(input);
        await fetchOpportunities(1);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to create opportunity");
        return false;
      }
    },
    [fetchOpportunities]
  );

  const handleMoveStage = useCallback(
    async (input: MoveOpportunityStageInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.moveStage(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to move stage");
        return false;
      }
    },
    [fetchOpportunities, state.page]
  );

  const handleMoveStageOptimistic = useCallback(
    async (opportunity: CrmOpportunity, targetStageKey: string, reason?: string): Promise<boolean> => {
      const prevItems = state.items;

      // 1. Optimistic update: move card to target stage immediately
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === opportunity.id ? { ...item, stageKey: targetStageKey } : item
        ),
      }));
      setSubmitError(null);

      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        if (!repo) {
          throw new Error("OpportunityRepository is not registered in CRM container");
        }

        const stageKeys = [
          "default.discovery",
          "default.qualification",
          "default.solution_fit",
          "default.proposal",
          "default.negotiation",
        ];
        const curIdx = stageKeys.indexOf(opportunity.stageKey);
        const tgtIdx = stageKeys.indexOf(targetStageKey);
        const isAdjacentForward = tgtIdx === curIdx + 1;

        // Provide default audited reason if skipping or moving backward
        const moveReason =
          reason || (isAdjacentForward ? undefined : "Audited stage override from Kanban board");

        const updatedOpp = await repo.moveStage({
          opportunityId: opportunity.id,
          targetStageKey,
          reason: moveReason,
          expectedRowVersion: opportunity.rowVersion,
        });

        // Immediately update state with server-authoritative record (including fresh RowVersion)
        if (updatedOpp && updatedOpp.id) {
          setState((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
              item.id === updatedOpp.id ? updatedOpp : item
            ),
          }));
        }

        // Re-fetch in background to sync total counts, pagination, and audit snapshot
        await fetchOpportunities(state.page);
        return true;
      } catch (err: any) {
        // Rollback only the specific target opportunity's stageKey to its original snapshot
        setState((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === opportunity.id ? { ...item, stageKey: opportunity.stageKey } : item
          ),
        }));
        const message = err.message || "Failed to move opportunity stage";
        setSubmitError(message);
        return false;
      }
    },
    [fetchOpportunities, state.page]
  );

  const handleCloseOpportunity = useCallback(
    async (input: CloseOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.closeOpportunity(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to close opportunity");
        return false;
      }
    },
    [fetchOpportunities, state.page]
  );

  const handleReopenOpportunity = useCallback(
    async (input: ReopenOpportunityInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.reopenOpportunity(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to reopen opportunity");
        return false;
      }
    },
    [fetchOpportunities, state.page]
  );

  const handleAssignOwner = useCallback(
    async (input: AssignOpportunityOwnerInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const repo = (getCrmContainer() as any).opportunityRepository;
        await repo.assignOwner(input);
        await fetchOpportunities(state.page);
        setIsSubmitting(false);
        return true;
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || "Failed to assign owner");
        return false;
      }
    },
    [fetchOpportunities, state.page]
  );

  const openMoveStageDialog = useCallback((opp: CrmOpportunity) => {
    setActiveOpportunity(opp);
    setSubmitError(null);
    setIsMoveStageOpen(true);
  }, []);

  const openCloseDialog = useCallback((opp: CrmOpportunity, outcome: OpportunityStatus = "Won") => {
    setActiveOpportunity(opp);
    setCloseInitialOutcome(outcome);
    setSubmitError(null);
    setIsCloseOpen(true);
  }, []);

  const openReopenDialog = useCallback((opp: CrmOpportunity) => {
    setActiveOpportunity(opp);
    setSubmitError(null);
    setIsReopenOpen(true);
  }, []);

  const openAssignOwnerDialog = useCallback((opp: CrmOpportunity) => {
    setActiveOpportunity(opp);
    setSubmitError(null);
    setIsAssignOwnerOpen(true);
  }, []);

  return {
    state,
    search,
    stageFilter,
    statusFilter,
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
    clearSubmitError: () => setSubmitError(null),
    refresh: () => fetchOpportunities(state.page),
  };
}
