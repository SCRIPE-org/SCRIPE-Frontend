import { useState, useCallback, useRef } from "react";
import { useGenericQuery } from "./useGenericQuery";
import { useGenericMutations } from "./useGenericMutations";
import { PaginationInfo } from "@core/common/pagination";
import { BaseEntity, PaginatedResult } from "../types";

export interface CrudViewModelOptions {
  initialPageSize?: number;
  enabled?: boolean;
}

export function useCrudViewModel<T extends BaseEntity, TCreate = any, TUpdate = any>(
  key: any[],
  services: {
    getAll: (params: any) => Promise<PaginatedResult<T>>;
    create?: (data: TCreate) => Promise<T>;
    update?: (id: string, data: TUpdate) => Promise<T>;
    delete?: (id: string) => Promise<void>;
  },
  options: CrudViewModelOptions = {}
) {
  // UI State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.initialPageSize || 10);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [viewItem, setViewItem] = useState<T | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 1. Data Fetching
  const query = useGenericQuery<T>(
    key,
    services.getAll,
    { page, pageSize, search: searchValue },
    options.enabled !== false
  );

  // 2. Mutations
  const mutations = useGenericMutations<T, TCreate, TUpdate>(key, services, {
    onSuccess: () => {
      setIsCreateModalOpen(false);
      closeEditModal();
    },
  });

  // Actions
  const handleSearchChange = useCallback((term: string) => {
    setSearchValue(term);
    setPage(1); // Reset to page 1 on search
  }, []);

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingItem(null);
    setIsEditModalOpen(false);
  }, []);

  const openViewModal = useCallback((item: T) => {
    setViewItem(item);
    setViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewItem(null);
    setViewModalOpen(false);
  }, []);

  const refreshItems = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    // Data
    items: query.data?.items || [],
    pagination: query.data?.pagination || { itemsCount: 0, pageSize, page, pagesCount: 0 },
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,

    // State
    page,
    pageSize,
    searchValue,
    searchInputRef,
    selectedItems,
    setSelectedItems,

    // Modals
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    viewItem,
    editingItem,

    // Actions
    handleSearchChange,
    changePage,
    changePageSize,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    refreshItems,
    refresh: refreshItems, // Alias

    // Mutation Wrappers
    createItem: mutations.create,
    updateItem: mutations.update,
    deleteItem: mutations.remove,

    // Loading States
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting,
  };
}
