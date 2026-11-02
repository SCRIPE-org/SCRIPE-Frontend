"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type { CrmLead, CreateLeadInput, QualifyLeadInput, LinkPartyToLeadInput, ConvertLeadInput, ConvertLeadResult, LeadStatus, } from "../../domain/models/crm-lead.types";
export interface LeadsState { stage: "idle" | "loading" | "success" | "failed";
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null; }
export function useLeadsViewModel(initialSearch?: string) { const [state, setState] = useState<LeadsState>({
    stage: "loading", items: [],
    totalCount: 0, page: 1,
    pageSize: 20, error: null,
  });
  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQualifyOpen, setIsQualifyOpen] = useState(false);
  const [isLinkPartyOpen, setIsLinkPartyOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<CrmLead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const handleSetIsCreateOpen = useCallback((open: boolean) => { setIsCreateOpen(open);
    if (!open) { setSubmitError(null);
    } }, []);
  const handleSetIsQualifyOpen = useCallback((open: boolean) => { setIsQualifyOpen(open);
    if (!open) { setSubmitError(null);
      setActiveLead(null); }
  }, []);
  const handleSetIsLinkPartyOpen = useCallback((open: boolean) => { setIsLinkPartyOpen(open);
    if (!open) { setSubmitError(null);
      setActiveLead(null); }
  }, []);
  const handleSetIsConvertOpen = useCallback((open: boolean) => { setIsConvertOpen(open);
    if (!open) { setSubmitError(null);
      setActiveLead(null); }
  }, []);
  const loadLeads = useCallback( async (pageToLoad = 1, searchQuery?: string, status?: LeadStatus) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try { const container = getCrmContainer();
        const result = await container.leadRepository.getLeads({ page: pageToLoad,
          pageSize: 20, search: searchQuery,
          status, });
        setState({ stage: "success",
          items: result.items, totalCount: result.totalCount,
          page: result.page, pageSize: result.pageSize,
          error: null, });
      } catch (err) { setState((prev) => ({
          ...prev, stage: "failed",
          error: err instanceof Error ? err.message : "Failed to load leads", }));
      } },
    [] );
  useEffect(() => { startTransition(() => {
      loadLeads(1, search, statusFilter); });
  }, [loadLeads, search, statusFilter]);
  const refresh = useCallback(() => { loadLeads(state.page, search, statusFilter);
  }, [loadLeads, state.page, search, statusFilter]);
  const handleSearchChange = useCallback((newSearch: string) => { setSearch(newSearch);
  }, []);
  const handleStatusFilterChange = useCallback((newStatus?: LeadStatus) => { setStatusFilter(newStatus);
  }, []);
  const handlePageChange = useCallback( (newPage: number) => {
      loadLeads(newPage, search, statusFilter); },
    [loadLeads, search, statusFilter] );
  const handleCreateLead = useCallback( async (input: CreateLeadInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const container = getCrmContainer();
        await container.leadRepository.createLead(input);
        setIsSubmitting(false);
        // Refresh list after successful creation
        loadLeads(1, search, statusFilter);
        return true; } catch (err) {
        setIsSubmitting(false);
        const errMsg = err instanceof Error ? err.message : "Failed to create lead";
        setSubmitError(errMsg);
        setState((prev) => ({ ...prev,
          error: errMsg, }));
        return false; }
    }, [loadLeads, search, statusFilter]
  );
  const handleUpdateLeadStatus = useCallback( async (lead: CrmLead, newStatus: string): Promise<boolean> => {
      const previousItems = state.items;
      setState((prev) => ({ ...prev,
        items: prev.items.map((item) =>
          item.id === lead.id
            ? { ...item, status: newStatus as LeadStatus, statusName: newStatus }
            : item ),
      }));
      try { const container = getCrmContainer();
        if ((container.leadRepository as any).updateLead) { await (container.leadRepository as any).updateLead(lead.id, {
            status: newStatus as LeadStatus, rowVersion: lead.rowVersion,
          }); }
        return true; } catch (err) {
        setState((prev) => ({ ...prev,
          items: previousItems, error: err instanceof Error ? err.message : "Failed to update lead status",
        }));
        return false; }
    }, [state.items]
  );
  const handleQualifyLead = useCallback( async (input: QualifyLeadInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const container = getCrmContainer();
        await container.leadRepository.qualifyLead(input);
        setIsSubmitting(false);
        setIsQualifyOpen(false);
        setActiveLead(null);
        loadLeads(state.page, search, statusFilter);
        return true; } catch (err) {
        setIsSubmitting(false);
        const errMsg = err instanceof Error ? err.message : "Failed to qualify lead";
        setSubmitError(errMsg);
        return false; }
    }, [loadLeads, state.page, search, statusFilter]
  );
  const handleLinkParty = useCallback( async (input: LinkPartyToLeadInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const container = getCrmContainer();
        await container.leadRepository.linkParty(input);
        setIsSubmitting(false);
        setIsLinkPartyOpen(false);
        setActiveLead(null);
        loadLeads(state.page, search, statusFilter);
        return true; } catch (err) {
        setIsSubmitting(false);
        const errMsg = err instanceof Error ? err.message : "Failed to link party";
        setSubmitError(errMsg);
        return false; }
    }, [loadLeads, state.page, search, statusFilter]
  );
  const handleConvertLead = useCallback( async (input: ConvertLeadInput): Promise<ConvertLeadResult | null> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try { const container = getCrmContainer();
        const result = await container.leadRepository.convertLead(input);
        setIsSubmitting(false);
        setIsConvertOpen(false);
        setActiveLead(null);
        loadLeads(state.page, search, statusFilter);
        return result; } catch (err) {
        setIsSubmitting(false);
        const errMsg = err instanceof Error ? err.message : "Failed to convert lead";
        setSubmitError(errMsg);
        return null; }
    }, [loadLeads, state.page, search, statusFilter]
  );
  const openQualifyDialog = useCallback((lead: CrmLead) => { setActiveLead(lead);
    setSubmitError(null);
    setIsQualifyOpen(true); }, []);
  const openLinkPartyDialog = useCallback((lead: CrmLead) => { setActiveLead(lead);
    setSubmitError(null);
    setIsLinkPartyOpen(true); }, []);
  const openConvertDialog = useCallback((lead: CrmLead) => { setActiveLead(lead);
    setSubmitError(null);
    setIsConvertOpen(true); }, []);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmLead | null>(null);
  const [viewItem, setViewItem] = useState<CrmLead | null>(null);
  return {
    // Standard ViewModel properties
    state, search,
    statusFilter, isCreateOpen,
    isQualifyOpen, isLinkPartyOpen,
    isConvertOpen, activeLead,
    isSubmitting, submitError,
    isPending, setIsCreateOpen: handleSetIsCreateOpen,
    setIsQualifyOpen: handleSetIsQualifyOpen, setIsLinkPartyOpen: handleSetIsLinkPartyOpen,
    setIsConvertOpen: handleSetIsConvertOpen, setActiveLead,
    setSubmitError, handleSearchChange,
    handleStatusFilterChange, handlePageChange,
    handleCreateLead, handleQualifyLead,
    handleLinkParty, handleConvertLead,
    openQualifyDialog, openLinkPartyDialog,
    openConvertDialog, handleUpdateLeadStatus,
    refresh,
    // GenericCrudView Adapter compatibility
    items: state.items, loading: state.stage === "loading",
    error: state.error, pagination: {
      page: state.page || 1, currentPage: state.page || 1, pageSize: state.pageSize || 20,
      itemsCount: state.totalCount, pagesCount: Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 20))),
      totalCount: state.totalCount, totalPages: Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 20))),
      hasNextPage: state.page * state.pageSize < state.totalCount, hasPreviousPage: state.page > 1,
      onPageChange: handlePageChange, onPageSizeChange: (_size: number) => {
        loadLeads(1, search, statusFilter); },
    }, searchValue: search,
    selectedItems, setSelectedItems,
    isCreateModalOpen: isCreateOpen, setIsCreateModalOpen: handleSetIsCreateOpen,
    isEditModalOpen, setIsEditModalOpen,
    viewModalOpen, setViewModalOpen,
    editingItem, viewItem,
    openEditModal: (item: CrmLead) => { setEditingItem(item);
      setIsEditModalOpen(true); },
    closeEditModal: () => { setIsEditModalOpen(false);
      setEditingItem(null); },
    openViewModal: (item: CrmLead) => { setViewItem(item);
      setViewModalOpen(true); },
    closeViewModal: () => { setViewModalOpen(false);
      setViewItem(null); },
    changePage: handlePageChange, changePageSize: (_size: number) => {
      loadLeads(1, search, statusFilter); },
    refreshItems: refresh, createItem: handleCreateLead,
  }; }
