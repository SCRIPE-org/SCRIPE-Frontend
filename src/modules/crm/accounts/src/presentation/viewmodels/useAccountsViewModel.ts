"use client";

import { useState, useCallback, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { CrmAccount, CreateAccountInput, PagedAccountsResult } from "../../domain/entities/AccountEntity";

/** State snapshot for CRM accounts list and pagination. */
export interface AccountsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmAccount[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/**
 * Presentation ViewModel hook for the commercial CRM Accounts list and search interface
 * powered by TanStack Query v5.
 */
export function useAccountsViewModel(initialSearch?: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [tierFilter, setTierFilter] = useState<string | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmAccount | null>(null);
  const [viewItem, setViewItem] = useState<CrmAccount | null>(null);

  const queryParams = {
    page,
    pageSize,
    search: search.trim() || undefined,
    tierCode: tierFilter || undefined,
  };

  const accountsQuery = useQuery<PagedAccountsResult>(
    {
      queryKey: qk.crm.accounts(tenantId, queryParams),
      queryFn: () => getCrmContainer().accountRepository.getAccounts(queryParams),
      staleTime: 30_000,
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

  const handleTierFilterChange = useCallback((tier: string | undefined) => {
    setTierFilter(tier);
    startTransition(() => { setPage(1); });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleCreateAccount = useCallback(
    async (input: CreateAccountInput, customFieldValues?: Record<string, unknown>): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const created = await getCrmContainer().accountRepository.createAccount(input);
        if (created?.id && customFieldValues && Object.keys(customFieldValues).length > 0) {
          try {
            const { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } = await import("@core/crud/customFieldsExtension");
            const ext = getCustomFieldsExtension();
            const normalized = normalizeCustomFieldValuesForSave(customFieldValues);
            if (ext?.saveValues && Object.keys(normalized).length > 0) {
              await ext.saveValues("crm.account", created.id, normalized);
            }
          } catch { /* non-blocking custom fields persistence */ }
        }
        setIsCreateOpen(false);
        setPage(1);
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.accounts(tenantId) });
        return true;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Failed to create commercial account");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [safeQueryClient, tenantId]
  );

  const refresh = useCallback(() => accountsQuery.refetch().then(() => undefined), [accountsQuery]);

  const lookupCandidateOrganizations = useCallback(async (query?: string) => {
    return getCrmContainer().accountRepository.lookupCandidateParties(query, "Organization");
  }, []);

  const items = accountsQuery.data?.items ?? [];
  const totalCount = accountsQuery.data?.totalCount ?? 0;
  const currentPage = accountsQuery.data?.page ?? page;
  const currentSize = accountsQuery.data?.pageSize ?? pageSize;
  const errorMsg = accountsQuery.error instanceof Error ? accountsQuery.error.message : null;
  const state: AccountsState = {
    stage: accountsQuery.isLoading ? "loading" : accountsQuery.isError ? "failed" : "success",
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
    tierFilter,
    isCreateOpen,
    isSubmitting,
    submitError,
    setIsCreateOpen: handleSetIsCreateOpen,
    handleSearchChange,
    handleTierFilterChange,
    handlePageChange,
    handleCreateAccount,
    lookupCandidateOrganizations,
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
    openEditModal: (item: CrmAccount) => { setEditingItem(item); setIsEditModalOpen(true); },
    closeEditModal: () => { setIsEditModalOpen(false); setEditingItem(null); },
    openViewModal: (item: CrmAccount) => { setViewItem(item); setViewModalOpen(true); },
    closeViewModal: () => { setViewModalOpen(false); setViewItem(null); },
    changePage: handlePageChange,
    changePageSize: handlePageSizeChange,
    refreshItems: refresh,
    createItem: handleCreateAccount,
  };
}
