"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmContact,
  CreateContactInput,
} from "../../domain/entities/ContactEntity";

/**
 * State contract for the contacts listing and directory viewmodel.
 */
export interface ContactsState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmContact[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/**
 * ViewModel hook managing contact person directories, search filters, and association workflows.
 * @param initialSearch - Initial text query filter.
 * @param initialAccountId - Optional initial parent commercial account identifier.
 * @returns State and operations for the contacts presentation view.
 */
export function useContactsViewModel(initialSearch?: string, initialAccountId?: string) {
  const [state, setState] = useState<ContactsState>({
    stage: "loading",
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    error: null,
  });

  const [search, setSearch] = useState<string>(initialSearch ?? "");
  const [accountId, setAccountId] = useState<string | undefined>(initialAccountId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // GenericCrudView adapter state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CrmContact | null>(null);
  const [viewItem, setViewItem] = useState<CrmContact | null>(null);

  const handleSetIsCreateOpen = useCallback((open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setSubmitError(null);
    }
  }, []);

  const loadContacts = useCallback(
    async (pageToLoad = 1, searchQuery?: string, accId?: string) => {
      setState((prev) => ({ ...prev, stage: "loading", error: null }));
      try {
        const container = getCrmContainer();
        const result = await container.contactRepository.getContacts({
          page: pageToLoad,
          pageSize: 20,
          search: searchQuery,
          accountId: accId,
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
        const message = err instanceof Error ? err.message : "Failed to load commercial contacts";
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
    loadContacts(1, search, accountId);
  }, [loadContacts, search, accountId]);

  const handleSearchChange = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleAccountFilterChange = useCallback((accId: string | undefined) => {
    setAccountId(accId);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      loadContacts(newPage, search, accountId);
    },
    [loadContacts, search, accountId]
  );

  const handleCreateContact = useCallback(
    async (input: CreateContactInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.contactRepository.createContact(input);
        setIsCreateOpen(false);
        await loadContacts(1, search, accountId);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create commercial contact";
        setSubmitError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadContacts, search, accountId]
  );

  const refresh = useCallback(() => {
    return loadContacts(state.page, search, accountId);
  }, [loadContacts, state.page, search, accountId]);

  return {
    state,
    search,
    accountId,
    isCreateOpen,
    isSubmitting,
    submitError,
    setIsCreateOpen: handleSetIsCreateOpen,
    handleSearchChange,
    handleAccountFilterChange,
    handlePageChange,
    handleCreateContact,
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
        loadContacts(1, search, accountId);
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
    openEditModal: (item: CrmContact) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
    },
    closeEditModal: () => {
      setIsEditModalOpen(false);
      setEditingItem(null);
    },
    openViewModal: (item: CrmContact) => {
      setViewItem(item);
      setViewModalOpen(true);
    },
    closeViewModal: () => {
      setViewModalOpen(false);
      setViewItem(null);
    },
    changePage: handlePageChange,
    changePageSize: (_size: number) => {
      loadContacts(1, search, accountId);
    },
    refreshItems: refresh,
    createItem: handleCreateContact,
  };
}
