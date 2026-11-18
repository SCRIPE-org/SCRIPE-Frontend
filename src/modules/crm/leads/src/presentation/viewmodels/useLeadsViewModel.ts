"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import type { CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type {
  CrmLead,
  CreateLeadInput,
  LeadStatus,
  AssignLeadOwnerInput,
  LinkPartyToLeadInput,
} from "../../domain/models/crm-lead.types";
import { buildLeadsPagination } from "../utils/leadTransitionHelpers";
import {
  INITIAL_LEADS_STATE,
  executeAssignLeadOwnerMutation,
  executeCreateLeadMutation,
  executeLeadTransitionMutation,
  executeLinkLeadPartyMutation,
  fetchLeadsPageMutation,
} from "../utils/leadMutationHelpers";
import { useLeadWorkflowActions } from "./useLeadWorkflowActions";
import { useLeadModalState } from "./useLeadModalState";

export interface LeadsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

export function useLeadsViewModel(initialSearch?: string) {
  const [state, setState] = useState<LeadsState>(INITIAL_LEADS_STATE);

  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const modalState = useLeadModalState();
  const { handleSetIsCreateOpen, setIsAssignOwnerOpen, setIsSubmitting, setSubmitError } = modalState;

  const loadLeads = useCallback(
    async (pageToLoad = 1, searchQuery?: string, status?: LeadStatus, sizeToLoad = 20) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        setState(await fetchLeadsPageMutation(pageToLoad, sizeToLoad, searchQuery, status));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          stage: "failed",
          error: err instanceof Error ? err.message : "Failed to load leads",
        }));
      }
    },
    [],
  );

  useEffect(() => {
    startTransition(() => {
      loadLeads(1, search, statusFilter, state.pageSize);
    });
  }, [loadLeads, search, statusFilter, state.pageSize]);

  const refresh = useCallback(() => {
    loadLeads(state.page, search, statusFilter, state.pageSize);
  }, [loadLeads, state.page, search, statusFilter, state.pageSize]);

  const handleSearchChange = useCallback((newSearch: string) => setSearch(newSearch), []);
  const handleStatusFilterChange = useCallback((newStatus?: LeadStatus) => setStatusFilter(newStatus), []);
  const handlePageChange = useCallback(
    (newPage: number) => loadLeads(newPage, search, statusFilter, state.pageSize),
    [loadLeads, search, statusFilter, state.pageSize],
  );
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setState((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
      loadLeads(1, search, statusFilter, newSize);
    },
    [loadLeads, search, statusFilter],
  );

  const handleCreateLead = useCallback(
    async (input: CreateLeadInput, customFieldValues?: Record<string, unknown>): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await executeCreateLeadMutation(input, customFieldValues);
        setIsSubmitting(false);
        loadLeads(1, search, statusFilter, state.pageSize);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        const errMsg = err instanceof Error ? err.message : "Failed to create lead";
        setSubmitError(errMsg);
        setState((prev) => ({ ...prev, error: errMsg }));
        return false;
      }
    },
    [loadLeads, search, statusFilter, state.pageSize, setIsSubmitting, setSubmitError],
  );

  const setStateItemsAndError = useCallback((items: CrmLead[], error: string | null) => {
    setState((prev) => ({ ...prev, items, error }));
  }, []);

  const setStateError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const wfActions = useLeadWorkflowActions(
    state.items,
    state.page,
    state.pageSize,
    search,
    statusFilter,
    loadLeads,
    setStateItemsAndError,
    setStateError,
    setIsSubmitting,
    setSubmitError,
  );

  const handleTransitionSubmit = useCallback(
    async (payload: CrmWorkflowTransitionSubmitPayload): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await executeLeadTransitionMutation(payload);
        setIsSubmitting(false);
        refresh();
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to move stage");
        return false;
      }
    },
    [refresh, setIsSubmitting, setSubmitError],
  );

  const openAssignOwnerDialog = useCallback(
    (lead: CrmLead) => {
      setSubmitError(null);
      wfActions.setActiveLead(lead);
      setIsAssignOwnerOpen(true);
    },
    [wfActions, setSubmitError, setIsAssignOwnerOpen],
  );

  const handleAssignLeadOwner = useCallback(
    async (input: AssignLeadOwnerInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await executeAssignLeadOwnerMutation(input);
        setIsSubmitting(false);
        setIsAssignOwnerOpen(false);
        wfActions.setActiveLead(null);
        refresh();
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to assign lead owner");
        return false;
      }
    },
    [refresh, wfActions, setIsSubmitting, setSubmitError, setIsAssignOwnerOpen],
  );

  const linkPartyBeforeConvert = useCallback(
    async (input: LinkPartyToLeadInput): Promise<CrmLead | null> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const updated = await executeLinkLeadPartyMutation(input);
        setIsSubmitting(false);
        return updated;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to link account or contact");
        return null;
      }
    },
    [setIsSubmitting, setSubmitError],
  );

  const clearError = useCallback(() => {
    setSubmitError(null);
    setState((prev) => ({ ...prev, error: null }));
  }, [setSubmitError]);

  return {
    ...modalState,
    state,
    search,
    statusFilter,
    isPending,
    isQualifyOpen: wfActions.isQualifyOpen,
    qualifyDefaultDecision: wfActions.qualifyDefaultDecision,
    isLinkPartyOpen: wfActions.isLinkPartyOpen,
    isConvertOpen: wfActions.isConvertOpen,
    activeLead: wfActions.activeLead,
    setIsCreateOpen: handleSetIsCreateOpen,
    setIsQualifyOpen: wfActions.setIsQualifyOpen,
    setIsLinkPartyOpen: wfActions.setIsLinkPartyOpen,
    setIsConvertOpen: wfActions.setIsConvertOpen,
    setActiveLead: wfActions.setActiveLead,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageChange,
    handleCreateLead,
    handleQualifyLead: wfActions.handleQualifyLead,
    handleLinkParty: wfActions.handleLinkParty,
    handleConvertLead: wfActions.handleConvertLead,
    handleAssignLeadOwner,
    linkPartyBeforeConvert,
    openQualifyDialog: wfActions.openQualifyDialog,
    openLinkPartyDialog: wfActions.openLinkPartyDialog,
    openConvertDialog: wfActions.openConvertDialog,
    openAssignOwnerDialog,
    handleUpdateLeadStatus: wfActions.handleUpdateLeadStatus,
    handleTransitionSubmit,
    lookupCandidateParties: wfActions.lookupCandidateParties,
    refresh,
    items: state.items,
    loading: state.stage === "loading",
    error: state.error,
    pagination: buildLeadsPagination(state.page, state.pageSize, state.totalCount, handlePageChange, handlePageSizeChange),
    searchValue: search,
    isCreateModalOpen: false,
    setIsCreateModalOpen: handleSetIsCreateOpen,
    changePage: handlePageChange,
    changePageSize: handlePageSizeChange,
    refreshItems: refresh,
    createItem: handleCreateLead,
    clearError,
  };
}
