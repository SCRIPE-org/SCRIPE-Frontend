"use client";

import { useState, useCallback, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { CrmAccount } from "@modules/crm";
import type { CrmContact, CreateContactInput, PagedContactsResult } from "../../domain/entities/ContactEntity";

/** State contract for the contacts listing and directory viewmodel. */
export interface ContactsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmContact[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/**
 * ViewModel hook managing contact person directories, search filters, and association workflows
 * powered by TanStack Query v5.
 */
export function useContactsViewModel(initialSearch?: string, initialAccountId?: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [accountId, setAccountId] = useState<string | undefined>(initialAccountId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmContact | null>(null);
  const [viewItem, setViewItem] = useState<CrmContact | null>(null);

  const queryParams = {
    page,
    pageSize,
    search: search.trim() || undefined,
    accountId: accountId || undefined,
  };

  const contactsQuery = useQuery<PagedContactsResult>(
    {
      queryKey: qk.crm.contacts(tenantId, queryParams),
      queryFn: () => getCrmContainer().contactRepository.getContacts(queryParams),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const accountsLookupQuery = useQuery<CrmAccount[]>(
    {
      queryKey: qk.crm.accounts(tenantId, { page: 1, pageSize: 100 }),
      queryFn: async () => {
        const repo = getCrmContainer().accountRepository;
        if (typeof repo?.getAccounts !== "function") return [];
        const res = await repo.getAccounts({ page: 1, pageSize: 100 }).catch(() => null);
        return res?.items ?? [];
      },
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const handleSetIsCreateOpen = useCallback((open: boolean) => {
    setIsCreateOpen(open);
    if (!open) setSubmitError(null);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearch(query);
    startTransition(() => { setPage(1); });
  }, []);

  const handleAccountFilterChange = useCallback((accId: string | undefined) => {
    setAccountId(accId);
    startTransition(() => { setPage(1); });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleCreateContact = useCallback(
    async (input: CreateContactInput, customFieldValues?: Record<string, unknown>): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const created = await getCrmContainer().contactRepository.createContact(input);
        if (created?.id && customFieldValues && Object.keys(customFieldValues).length > 0) {
          try {
            const { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } = await import("@core/crud/customFieldsExtension");
            const ext = getCustomFieldsExtension();
            const normalized = normalizeCustomFieldValuesForSave(customFieldValues);
            if (ext?.saveValues && Object.keys(normalized).length > 0) {
              await ext.saveValues("crm.contact", created.id, normalized);
            }
          } catch { /* non-blocking custom fields persistence */ }
        }
        setIsCreateOpen(false);
        setPage(1);
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.contacts(tenantId) });
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to create commercial contact");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [safeQueryClient, tenantId]
  );

  const refresh = useCallback(() => contactsQuery.refetch().then(() => undefined), [contactsQuery]);

  const lookupCandidatePeople = useCallback(async (query?: string) => {
    return getCrmContainer().accountRepository.lookupCandidateParties(query, "Person");
  }, []);

  const lookupAccounts = useCallback(async () => {
    try {
      const repo = getCrmContainer().accountRepository;
      if (!repo || typeof repo.getAccounts !== "function") return [];
      const res = await repo.getAccounts({ page: 1, pageSize: 100 });
      return res?.items ?? [];
    } catch {
      return [];
    }
  }, []);

  const items = contactsQuery.data?.items ?? [];
  const totalCount = contactsQuery.data?.totalCount ?? 0;
  const currentPage = contactsQuery.data?.page ?? page;
  const currentSize = contactsQuery.data?.pageSize ?? pageSize;
  const errorMsg = contactsQuery.error instanceof Error ? contactsQuery.error.message : null;
  const state: ContactsState = {
    stage: contactsQuery.isLoading ? "loading" : contactsQuery.isError ? "failed" : "success",
    items,
    totalCount,
    page: currentPage,
    pageSize: currentSize,
    error: errorMsg,
  };
  const pagesCount = Math.max(1, Math.ceil(totalCount / (currentSize || 20)));

  return {
    state,
    search,
    accountId,
    accountsList: accountsLookupQuery.data ?? [],
    isCreateOpen,
    isSubmitting,
    submitError,
    setIsCreateOpen: handleSetIsCreateOpen,
    handleSearchChange,
    handleAccountFilterChange,
    handlePageChange,
    handleCreateContact,
    lookupCandidatePeople,
    lookupAccounts,
    refresh,
    items,
    loading: state.stage === "loading",
    error: errorMsg,
    pagination: {
      page: currentPage || 1,
      currentPage: currentPage || 1,
      pageSize: currentSize || 20,
      itemsCount: totalCount,
      pagesCount,
      totalCount,
      totalPages: pagesCount,
      hasNextPage: currentPage * currentSize < totalCount,
      hasPreviousPage: currentPage > 1,
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
    openEditModal: (item: CrmContact) => { setEditingItem(item); setIsEditModalOpen(true); },
    closeEditModal: () => { setIsEditModalOpen(false); setEditingItem(null); },
    openViewModal: (item: CrmContact) => { setViewItem(item); setViewModalOpen(true); },
    closeViewModal: () => { setViewModalOpen(false); setViewItem(null); },
    changePage: handlePageChange,
    changePageSize: handlePageSizeChange,
    refreshItems: refresh,
    createItem: handleCreateContact,
  };
}
