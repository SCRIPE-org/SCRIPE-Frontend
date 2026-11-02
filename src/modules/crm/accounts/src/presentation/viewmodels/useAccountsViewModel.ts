"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmAccount,
  CreateAccountInput,
} from "../../domain/entities/AccountEntity";

/**
 * State snapshot for CRM accounts list and pagination.
 */
export interface AccountsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmAccount[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/**
 * Presentation ViewModel hook for the commercial CRM Accounts list and search interface.
 * Connects directly to the scoped CRM DI container repository layer.
 *
 * @param initialSearch - Optional initial filter term for party legal name search.
 * @returns State, pagination controls, filter actions, and mutation handlers.
 */
export function useAccountsViewModel(initialSearch?: string) {
  const [state, setState] = useState<AccountsState>({
    stage: "loading",
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  });

  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [tierFilter, setTierFilter] = useState<string | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // GenericCrudView adapter state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmAccount | null>(null);
  const [viewItem, setViewItem] = useState<CrmAccount | null>(null);

  const handleSetIsCreateOpen = useCallback((open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setSubmitError(null);
    }
  }, []);

  const loadAccounts = useCallback(
    async (pageToLoad = 1, searchQuery?: string, tier?: string) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        const result = await container.accountRepository.getAccounts({
          page: pageToLoad,
          pageSize: 20,
          search: searchQuery,
          tierCode: tier,
        });

        startTransition(() => {
          setState({
            stage: "success",
            items: result.items ?? [],
            totalCount: result.totalCount ?? 0,
            page: result.page ?? pageToLoad,
            pageSize: result.pageSize ?? 20,
            error: null,
          });
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load CRM accounts";
        startTransition(() => {
          setState((prev) => ({
            ...prev,
            stage: "failed",
            error: message,
          }));
        });
      }
    },
    []
  );

  useEffect(() => {
    loadAccounts(1, search, tierFilter);
  }, [loadAccounts, search, tierFilter]);

  const handleSearchChange = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleTierFilterChange = useCallback((tier: string | undefined) => {
    setTierFilter(tier);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      loadAccounts(newPage, search, tierFilter);
    },
    [loadAccounts, search, tierFilter]
  );

  const handleCreateAccount = useCallback(
    async (input: CreateAccountInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.accountRepository.createAccount(input);
        setIsCreateOpen(false);
        await loadAccounts(1, search, tierFilter);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create commercial account";
        setSubmitError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAccounts, search, tierFilter]
  );

  const refresh = useCallback(() => {
    return loadAccounts(state.page, search, tierFilter);
  }, [loadAccounts, state.page, search, tierFilter]);

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
    refresh,

    // GenericCrudView Adapter compatibility
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
      onPageSizeChange: (_size: number) => {
        loadAccounts(1, search, tierFilter);
      },
    },
    searchValue: search,
    selectedItems,
    setSelectedItems,
    isCreateModalOpen: isCreateOpen,
    setIsCreateModalOpen: handleSetIsCreateOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    editingItem,
    viewItem,
    openEditModal: (item: CrmAccount) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
    },
    closeEditModal: () => {
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    openViewModal: (item: CrmAccount) => {
      setViewItem(item);
      setViewModalOpen(true);
    },
    closeViewModal: () => {
      setViewModalOpen(false);
      setViewItem(null);
    },
    changePage: handlePageChange,
    changePageSize: (_size: number) => {
      loadAccounts(1, search, tierFilter);
    },
    refreshItems: refresh,
    createItem: handleCreateAccount,
  };
}
