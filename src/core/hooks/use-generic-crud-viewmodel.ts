/**
 * Generic CRUD View Model Hook
 *
 * A comprehensive, reusable hook for managing CRUD operations with the following features:
 * - Type-safe CRUD operations (Create, Read, Update, Delete)
 * - **TanStack Query integration** for caching and deduplication
 * - Advanced pagination with customizable page sizes
 * - Debounced search with focus management
 * - Loading states and error handling
 * - Modal management for create/edit/view operations
 * - Bulk selection and operations
 * - Dropdown data management for form fields
 * - Optimistic updates and data synchronization
 * - Memory leak prevention and cleanup
 *
 * @example
 * ```typescript
 * const vm = useGenericCrudViewModel(adminService, {
 *   queryKey: ['admins'],
 *   itemTypeName: "Admin",
 *   itemTypeNamePlural: "Admins",
 *   getItemDisplayName: (admin) => admin.username,
 *   searchParamName: "PageSearch"
 * });
 * ```
 *
 * @author Seif
 * @version 3.0.0 - TanStack Query Integration
 * @since 1.0.0
 */
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { PaginationInfo } from "@core/common/pagination";
import { useCrudViewModel } from "@core/hooks/use-crud-view-model";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { appLogger } from "@core/common/logger";

/* =========================
 * Types
 * ========================= */
export interface GenericCrudService<TItem, TCreate, TUpdate, TResponse> {
  getData(params: {
    page: number;
    pageSize: number;
    search?: string;
    PageSearch?: string;
  }): Promise<TResponse>;
  create(data: TCreate): Promise<TItem>;
  update(id: string, data: TUpdate): Promise<TItem>;
  delete(id: string): Promise<void>;
}

export interface GenericCrudConfig<TItem, TCreate, TUpdate> {
  /** TanStack Query key for caching and invalidation */
  queryKey: string[];
  itemTypeName: string;
  itemTypeNamePlural: string;
  getItemDisplayName: (item: TItem) => string;
  searchParamName: "search" | "PageSearch"; // Different APIs use different parameter names
  /** Stale time in milliseconds (default: 30 seconds) */
  staleTime?: number;
}

export interface DropdownService<TDropdownItem> {
  getData(params: {
    page: number;
    pageSize: number;
    PageSearch?: string;
    search?: string;
  }): Promise<{ data: TDropdownItem[] }>;
  getLabel: (item: TDropdownItem) => string;
  getValue: (item: TDropdownItem) => string;
}

export interface GenericCrudConfigWithDropdowns<
  TItem,
  TCreate,
  TUpdate,
  TDropdownItem = any,
> extends GenericCrudConfig<TItem, TCreate, TUpdate> {
  dropdownService?: DropdownService<TDropdownItem>;
  dropdownSearchParamName?: "search" | "PageSearch";
}

/* =========================
 * Hook
 * ========================= */
export function useGenericCrudViewModel<
  TItem extends { id: string },
  TCreate,
  TUpdate,
  TResponse extends { data: TItem[]; pagination: PaginationInfo },
  TDropdownItem = any,
>(
  service: GenericCrudService<TItem, TCreate, TUpdate, TResponse>,
  config: GenericCrudConfigWithDropdowns<TItem, TCreate, TUpdate, TDropdownItem>
) {
  const queryClient = useQueryClient();

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    itemsCount: 0,
    pageSize: 10,
    page: 1,
    pagesCount: 1,
  });

  // Search state
  const [searchValue, setSearchValue] = useState<string>(""); // what user types
  const [searchTerm, setSearchTerm] = useState<string>(""); // debounced, used for API
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dropdown state
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (config.searchParamName === "search") {
      params.search = searchTerm;
    } else {
      params.PageSearch = searchTerm;
    }
    return params;
  }, [pagination.page, pagination.pageSize, searchTerm, config.searchParamName]);

  // ==========================================
  // TanStack Query - Main Data Fetching
  // ==========================================
  const {
    data: queryData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [...config.queryKey, queryParams],
    queryFn: () => service.getData(queryParams),
    placeholderData: keepPreviousData,
    staleTime: config.staleTime ?? 30 * 1000, // 30 seconds default
  });

  // Update pagination from query response (render-time, no setState in effect)
  const prevPaginationRef = useRef<{ itemsCount: number; pagesCount: number } | null>(null);
  if (queryData?.pagination) {
    const qp = queryData.pagination;
    if (!prevPaginationRef.current || prevPaginationRef.current.itemsCount !== qp.itemsCount || prevPaginationRef.current.pagesCount !== qp.pagesCount) {
      prevPaginationRef.current = { itemsCount: qp.itemsCount, pagesCount: qp.pagesCount };
      setPagination((prev) => ({
        ...qp,
        page: prev.page,
        pageSize: prev.pageSize,
      }));
    }
  }

  // ==========================================
  // TanStack Mutations
  // ==========================================
  const { operationSuccess, operationError } = useEnhancedToast();

  const createMutation = useMutation({
    mutationFn: (data: TCreate) => service.create(data),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      operationSuccess("Create", config.itemTypeName);
    },
    onError: (error: any) => {
      operationError("Create", config.itemTypeName, error.message || "Failed to create");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) => service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      operationSuccess("Update", config.itemTypeName);
    },
    onError: (error: any) => {
      operationError("Update", config.itemTypeName, error.message || "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      operationSuccess("Delete", config.itemTypeName);
    },
    onError: (error: any) => {
      operationError("Delete", config.itemTypeName, error.message || "Failed to delete");
    },
  });

  // ==========================================
  // Dropdown Query
  // ==========================================
  const dropdownParams = useMemo(() => {
    const params: any = { page: 1, pageSize: 50 };
    const paramName = config.dropdownSearchParamName ?? "PageSearch";
    if (paramName === "search") {
      params.search = dropdownSearchTerm;
    } else {
      params.PageSearch = dropdownSearchTerm;
    }
    return params;
  }, [dropdownSearchTerm, config.dropdownSearchParamName]);

  const { data: dropdownData } = useQuery({
    queryKey: [...config.queryKey, "dropdown", dropdownParams],
    queryFn: () => config.dropdownService?.getData(dropdownParams),
    enabled: !!config.dropdownService,
    staleTime: 60 * 1000, // 1 minute for dropdowns
  });

  // ==========================================
  // CRUD service binding for useCrudViewModel
  // ==========================================
  const crudService = useMemo(
    () => ({
      list: async () => {
        const result = await refetch();
        return result.data?.data ?? [];
      },
      create: (d: TCreate) => createMutation.mutateAsync(d),
      update: (id: string, d: TUpdate) => updateMutation.mutateAsync({ id, data: d }),
      delete: (id: string) => deleteMutation.mutateAsync(id),
    }),
    [refetch, createMutation, updateMutation, deleteMutation]
  );

  // Enhanced CRUD VM (modals + confirmation)
  const crud = useCrudViewModel<TItem, TCreate, TUpdate>(crudService, {
    itemTypeName: config.itemTypeName,
    itemTypeNamePlural: config.itemTypeNamePlural,
    getItemDisplayName: config.getItemDisplayName,
    notifications: {
      operationSuccess,
      operationError,
    },
  });

  // ==========================================
  // Search handling with debounce
  // ==========================================
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value); // Update display immediately

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced API call
    searchTimeoutRef.current = setTimeout(() => {
      // Ensure focus is maintained before making the API call
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        searchInputRef.current.focus();
      }

      setPagination((prev) => ({ ...prev, page: 1 }));
      setSearchTerm(value); // This triggers the query via queryKey change
    }, 300); // 300ms debounce
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================
  // Pagination handlers
  // ==========================================
  const changePage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Legacy compatibility
  const searchItems = useCallback(
    (term: string) => {
      handleSearchChange(term);
    },
    [handleSearchChange]
  );

  // ==========================================
  // Dropdown options
  // ==========================================
  const dropdownOptionsMapped = useMemo(() => {
    if (!config.dropdownService || !dropdownData?.data) return [];
    return dropdownData.data.map((item) => ({
      label: config.dropdownService!.getLabel(item),
      value: config.dropdownService!.getValue(item),
    }));
  }, [dropdownData?.data, config.dropdownService]);

  // ==========================================
  // View modal state
  // ==========================================
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<TItem | null>(null);

  const openViewModal = useCallback((item: TItem) => {
    setViewItem(item);
    setViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewModalOpen(false);
    setViewItem(null);
  }, []);

  // ==========================================
  // Return
  // ==========================================
  return {
    // Enhanced CRUD functionality (modals, confirmations, etc.)
    ...crud,

    // Managed state from TanStack Query
    data: queryData?.data ?? [],
    loading: isLoading,
    isFetching,
    error: queryError?.message ?? null,
    items: queryData?.data ?? [], // legacy alias

    // Pagination
    pagination,

    // Search
    searchValue,
    searchTerm,
    searchInputRef,
    handleSearchChange,
    searchItems, // legacy

    // Pagination handlers
    changePage,
    changePageSize,

    // Manual refresh (via TanStack Query)
    refresh: refetch,

    // Dropdowns
    dropdownOptions: dropdownOptionsMapped,
    searchDropdown: setDropdownSearchTerm,

    // View functionality
    viewModalOpen,
    viewItem,
    openViewModal,
    closeViewModal,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
