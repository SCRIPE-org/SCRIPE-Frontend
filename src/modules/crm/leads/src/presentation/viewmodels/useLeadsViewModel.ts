"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import { useCrmWorkflowsStore, type CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type { CrmLead, CreateLeadInput, LeadStatus, AssignLeadOwnerInput, LinkPartyToLeadInput, PagedLeadsResult } from "../../domain/models/crm-lead.types";
import { buildLeadsPagination } from "../utils/leadTransitionHelpers";
import { executeAssignLeadOwnerMutation, executeCreateLeadMutation, executeLeadTransitionMutation, executeLinkLeadPartyMutation } from "../utils/leadMutationHelpers";
import { useLeadWorkflowActions } from "./useLeadWorkflowActions";
import { useLeadModalState } from "./useLeadModalState";

/** State snapshot for CRM leads list and pagination. */
export interface LeadsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/** Primary ViewModel hook for CRM Leads workspace powered by TanStack Query v5. */
export function useLeadsViewModel(initialSearch?: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [optimisticItems, setOptimisticItems] = useState<CrmLead[] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const modalState = useLeadModalState();
  const { handleSetIsCreateOpen, setIsAssignOwnerOpen, setIsSubmitting, setSubmitError } = modalState;

  const queryParams = { page, pageSize, search: search.trim() || undefined, status: statusFilter || undefined };
  const leadsQuery = useQuery<PagedLeadsResult>(
    { queryKey: qk.crm.leads(tenantId, queryParams), queryFn: () => getCrmContainer().leadRepository.getLeads(queryParams), staleTime: 30_000 },
    safeQueryClient
  );

  const pipelinesQuery = useQuery(
    {
      queryKey: qk.crm.pipelines(tenantId),
      queryFn: async () => {
        const wfRepo = getCrmContainer().workflowRepository;
        return typeof wfRepo?.getPipelines === "function" ? wfRepo.getPipelines("lead") : [];
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

  const queryItems = leadsQuery.data?.items ?? [];
  const items = optimisticItems ?? queryItems;
  const totalCount = leadsQuery.data?.totalCount ?? 0;
  const currentPage = leadsQuery.data?.page ?? page;
  const currentSize = leadsQuery.data?.pageSize ?? pageSize;
  const queryError = leadsQuery.error instanceof Error ? leadsQuery.error.message : null;
  const state: LeadsState = {
    stage: leadsQuery.isLoading ? "loading" : leadsQuery.isError ? "failed" : "success",
    items,
    totalCount,
    page: currentPage,
    pageSize: currentSize,
    error: actionError ?? queryError,
  };

  const loadLeads = useCallback(
    async (pageToLoad?: number, _search?: string, _status?: LeadStatus, _size?: number) => {
      setOptimisticItems(null);
      if (typeof pageToLoad === "number" && pageToLoad !== page) setPage(pageToLoad);
      await safeQueryClient.invalidateQueries({ queryKey: qk.crm.leads(tenantId) });
    },
    [page, safeQueryClient, tenantId]
  );

  const refresh = useCallback(() => {
    setOptimisticItems(null);
    return leadsQuery.refetch().then(() => undefined);
  }, [leadsQuery]);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    startTransition(() => { setPage(1); });
  }, []);

  const handleStatusFilterChange = useCallback((newStatus?: LeadStatus) => {
    setStatusFilter(newStatus);
    startTransition(() => { setPage(1); });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setOptimisticItems(null);
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setOptimisticItems(null);
    setPageSize(newSize);
    setPage(1);
  }, []);

  const runMutation = useCallback(
    async (op: () => Promise<void>, fallbackError: string, onSuccess?: () => void): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await op();
        setIsSubmitting(false);
        onSuccess?.();
        await loadLeads();
        return true;
      } catch (err) {
        setIsSubmitting(false);
        const msg = err instanceof Error ? err.message : fallbackError;
        setSubmitError(msg);
        setActionError(msg);
        return false;
      }
    },
    [loadLeads, setIsSubmitting, setSubmitError]
  );

  const handleCreateLead = useCallback(
    (input: CreateLeadInput, customFieldValues?: Record<string, unknown>) =>
      runMutation(async () => {
        await executeCreateLeadMutation(getCrmContainer().leadRepository, input, customFieldValues);
        setPage(1);
      }, "Failed to create lead"),
    [runMutation]
  );

  const setStateItemsAndError = useCallback((nextItems: CrmLead[], err: string | null) => {
    setOptimisticItems(nextItems);
    setActionError(err);
  }, []);

  const wfActions = useLeadWorkflowActions(
    items, currentPage, currentSize, search, statusFilter,
    loadLeads, setStateItemsAndError, setActionError, setIsSubmitting, setSubmitError
  );

  const handleTransitionSubmit = useCallback(
    (payload: CrmWorkflowTransitionSubmitPayload) =>
      runMutation(() => executeLeadTransitionMutation(getCrmContainer().leadRepository, payload), "Failed to move stage"),
    [runMutation]
  );

  const openAssignOwnerDialog = useCallback(
    (lead: CrmLead) => {
      setSubmitError(null);
      wfActions.setActiveLead(lead);
      setIsAssignOwnerOpen(true);
    },
    [wfActions, setSubmitError, setIsAssignOwnerOpen]
  );

  const handleAssignLeadOwner = useCallback(
    (input: AssignLeadOwnerInput) =>
      runMutation(
        () => executeAssignLeadOwnerMutation(getCrmContainer().leadRepository, input),
        "Failed to assign lead owner",
        () => { setIsAssignOwnerOpen(false); wfActions.setActiveLead(null); }
      ),
    [runMutation, setIsAssignOwnerOpen, wfActions]
  );

  const linkPartyBeforeConvert = useCallback(
    async (input: LinkPartyToLeadInput): Promise<CrmLead | null> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const updated = await executeLinkLeadPartyMutation(getCrmContainer().leadRepository, input);
        setIsSubmitting(false);
        return updated;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to link account or contact");
        return null;
      }
    },
    [setIsSubmitting, setSubmitError]
  );

  const clearError = useCallback(() => {
    setSubmitError(null);
    setActionError(null);
  }, [setSubmitError]);

  return {
    ...modalState, state, search, statusFilter, isPending,
    isQualifyOpen: wfActions.isQualifyOpen, qualifyDefaultDecision: wfActions.qualifyDefaultDecision,
    isLinkPartyOpen: wfActions.isLinkPartyOpen, isConvertOpen: wfActions.isConvertOpen, activeLead: wfActions.activeLead,
    setIsCreateOpen: handleSetIsCreateOpen, setIsQualifyOpen: wfActions.setIsQualifyOpen,
    setIsLinkPartyOpen: wfActions.setIsLinkPartyOpen, setIsConvertOpen: wfActions.setIsConvertOpen, setActiveLead: wfActions.setActiveLead,
    handleSearchChange, handleStatusFilterChange, handlePageChange, handleCreateLead,
    handleQualifyLead: wfActions.handleQualifyLead, handleLinkParty: wfActions.handleLinkParty,
    handleConvertLead: wfActions.handleConvertLead, handleAssignLeadOwner, linkPartyBeforeConvert,
    openQualifyDialog: wfActions.openQualifyDialog, openLinkPartyDialog: wfActions.openLinkPartyDialog,
    openConvertDialog: wfActions.openConvertDialog, openAssignOwnerDialog,
    handleUpdateLeadStatus: wfActions.handleUpdateLeadStatus, handleTransitionSubmit,
    lookupCandidateParties: wfActions.lookupCandidateParties, refresh, items,
    loading: state.stage === "loading", error: state.error,
    pagination: buildLeadsPagination(currentPage, currentSize, totalCount, handlePageChange, handlePageSizeChange),
    searchValue: search, isCreateModalOpen: false, setIsCreateModalOpen: handleSetIsCreateOpen,
    changePage: handlePageChange, changePageSize: handlePageSizeChange, refreshItems: refresh, createItem: handleCreateLead, clearError,
  };
}
