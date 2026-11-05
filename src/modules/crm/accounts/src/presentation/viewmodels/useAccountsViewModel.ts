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
    async (pageToLoad = 1, searchQuery?: string, tier?: string, sizeToLoad = 20) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        const result = await container.accountRepository.getAccounts({
          page: pageToLoad,
          pageSize: sizeToLoad,
          search: searchQuery,
          tierCode: tier,
        });

        startTransition(() => {
          setState({
            stage: "success",
            items: result.items ?? [],
            totalCount: result.totalCount ?? 0,
            page: result.page ?? pageToLoad,
            pageSize: result.pageSize ?? sizeToLoad,
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
      loadAccounts(newPage, search, tierFilter, state.pageSize);
    },
    [loadAccounts, search, tierFilter, state.pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setState((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
      loadAccounts(1, search, tierFilter, newSize);
    },
    [loadAccounts, search, tierFilter]
  );

  const handleCreateAccount = useCallback(
    async (
      input: CreateAccountInput,
      customFieldValues?: Record<string, unknown>
    ): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const created = await container.accountRepository.createAccount(input);
        if (created?.id && customFieldValues && Object.keys(customFieldValues).length > 0) {
          try {
            const { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } = await import(
              "@core/crud/customFieldsExtension"
            );
            const ext = getCustomFieldsExtension();
            const normalized = normalizeCustomFieldValuesForSave(customFieldValues);
            if (ext?.saveValues && Object.keys(normalized).length > 0) {
              await ext.saveValues("crm.account", created.id, normalized);
            }
          } catch {
            // Non-blocking custom fields persistence
          }
        }
        setIsCreateOpen(false);
        await loadAccounts(1, search, tierFilter, state.pageSize);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create commercial account";
        setSubmitError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAccounts, search, tierFilter, state.pageSize]
  );

  const refresh = useCallback(() => {
    return loadAccounts(state.page, search, tierFilter, state.pageSize);
  }, [loadAccounts, state.page, search, tierFilter, state.pageSize]);

  const lookupCandidateOrganizations = useCallback(async (query?: string) => {
    const container = getCrmContainer();
    return container.accountRepository.lookupCandidateParties(query, "Organization");
  }, []);

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
    changePageSize: handlePageSizeChange,
    refreshItems: refresh,
    createItem: handleCreateAccount,
  };
}
