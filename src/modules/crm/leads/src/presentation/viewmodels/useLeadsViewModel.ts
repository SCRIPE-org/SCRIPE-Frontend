"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type { CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type { CrmLead, CreateLeadInput, LeadStatus } from "../../domain/models/crm-lead.types";
import { useLeadWorkflowActions } from "./useLeadWorkflowActions";

export interface LeadsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

export function useLeadsViewModel(initialSearch?: string) {
  const [state, setState] = useState<LeadsState>({
    stage: "loading",
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  });

  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmLead | null>(null);
  const [viewItem, setViewItem] = useState<CrmLead | null>(null);

  const handleSetIsCreateOpen = useCallback((open: boolean) => {
    setIsCreateOpen(open);
    if (!open) setSubmitError(null);
  }, []);

  const loadLeads = useCallback(
    async (pageToLoad = 1, searchQuery?: string, status?: LeadStatus, sizeToLoad = 20) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        const result = await container.leadRepository.getLeads({
          page: pageToLoad,
          pageSize: sizeToLoad,
          search: searchQuery,
          status,
        });
        setState({
          stage: "success",
          items: result.items,
          totalCount: result.totalCount,
          page: result.page,
          pageSize: result.pageSize || sizeToLoad,
          error: null,
        });
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
        const container = getCrmContainer();
        const created = await container.leadRepository.createLead(input);
        if (created?.id && customFieldValues && Object.keys(customFieldValues).length > 0) {
          try {
            const { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } = await import(
              "@core/crud/customFieldsExtension"
            );
            const ext = getCustomFieldsExtension();
            const normalized = normalizeCustomFieldValuesForSave(customFieldValues);
            if (ext?.saveValues && Object.keys(normalized).length > 0) {
              await ext.saveValues("crm.lead", created.id, normalized);
            }
          } catch {}
        }
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
    [loadLeads, search, statusFilter, state.pageSize],
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
        const container = getCrmContainer();
        await container.leadRepository.moveLeadStage({
          leadId: payload.entityId,
          targetStageKey: payload.targetStageKey,
          transitionId: payload.transitionId,
          expectedRowVersion: payload.expectedRowVersion,
          partyId: payload.partyId,
          accountId: payload.accountId,
          estimatedValue: payload.estimatedAmount,
          closeNotes: payload.closeNotes,
          disqualificationReasonCode: payload.disqualificationReasonCode,
          reopenReason: payload.reopenReason,
          reason: payload.reason,
          auditNote: payload.auditNote,
          convertDealTitle: payload.convertDealTitle,
          targetDealPipelineId: payload.targetDealPipelineId,
        });
        setIsSubmitting(false);
        refresh();
        return true;
      } catch (err) {
        setIsSubmitting(false);
        const msg = err instanceof Error ? err.message : "Failed to move stage";
        setSubmitError(msg);
        return false;
      }
    },
    [refresh],
  );

  const clearError = useCallback(() => {
    setSubmitError(null);
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    search,
    statusFilter,
    isCreateOpen,
    isQualifyOpen: wfActions.isQualifyOpen,
    qualifyDefaultDecision: wfActions.qualifyDefaultDecision,
    isLinkPartyOpen: wfActions.isLinkPartyOpen,
    isConvertOpen: wfActions.isConvertOpen,
    activeLead: wfActions.activeLead,
    isSubmitting,
    submitError,
    isPending,
    setIsCreateOpen: handleSetIsCreateOpen,
    setIsQualifyOpen: wfActions.setIsQualifyOpen,
    setIsLinkPartyOpen: wfActions.setIsLinkPartyOpen,
    setIsConvertOpen: wfActions.setIsConvertOpen,
    setActiveLead: wfActions.setActiveLead,
    setSubmitError,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageChange,
    handleCreateLead,
    handleQualifyLead: wfActions.handleQualifyLead,
    handleLinkParty: wfActions.handleLinkParty,
    handleConvertLead: wfActions.handleConvertLead,
    openQualifyDialog: wfActions.openQualifyDialog,
    openLinkPartyDialog: wfActions.openLinkPartyDialog,
    openConvertDialog: wfActions.openConvertDialog,
    handleUpdateLeadStatus: wfActions.handleUpdateLeadStatus,
    handleTransitionSubmit,
    lookupCandidateParties: wfActions.lookupCandidateParties,
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
    setIsCreateModalOpen: handleSetIsCreateOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    editingItem,
    viewItem,
    openEditModal: (item: CrmLead) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
    },
    closeEditModal: () => {
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    openViewModal: (item: CrmLead) => {
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
    createItem: handleCreateLead,
    clearError,
  };
}
