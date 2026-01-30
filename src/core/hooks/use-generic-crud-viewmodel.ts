/**
 * Generic CRUD View Model Hook
 * 
 * A comprehensive, reusable hook for managing CRUD operations with the following features:
 * - Type-safe CRUD operations (Create, Read, Update, Delete)
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
 *   itemTypeName: "Admin",
 *   itemTypeNamePlural: "Admins", 
 *   getItemDisplayName: (admin) => admin.username,
 *   searchParamName: "PageSearch"
 * });
 * ```
 * 
 * @author Seif
 * @version 2.0.0
 * @since 1.0.0
 */
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
  itemTypeName: string;
  itemTypeNamePlural: string;
  getItemDisplayName: (item: TItem) => string;
  searchParamName: "search" | "PageSearch"; // Different APIs use different parameter names
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
  TDropdownItem = any
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
  TDropdownItem = any
>(
  service: GenericCrudService<TItem, TCreate, TUpdate, TResponse>,
  config: GenericCrudConfigWithDropdowns<TItem, TCreate, TUpdate, TDropdownItem>
) {
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
  const [dropdownOptions, setDropdownOptions] = useState<TDropdownItem[]>([]);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");

  // Data state
  const [data, setData] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable list()
  const paginationRef = useRef(pagination);
  const searchTermRef = useRef(searchTerm);
  const mountedRef = useRef(true);
  paginationRef.current = pagination;
  searchTermRef.current = searchTerm;

  // Keep service fns in refs
  const getDataRef = useRef(service.getData);
  const createRef = useRef(service.create);
  const updateRef = useRef(service.update);
  const deleteRef = useRef(service.delete);

  useEffect(() => { getDataRef.current = service.getData; }, [service.getData]);
  useEffect(() => { createRef.current  = service.create;   }, [service.create]);
  useEffect(() => { updateRef.current  = service.update;   }, [service.update]);
  useEffect(() => { deleteRef.current  = service.delete;   }, [service.delete]);

  // Keep config bits in refs
  const searchParamNameRef = useRef(config.searchParamName);
  const getItemDisplayNameRef = useRef(config.getItemDisplayName);
  useEffect(() => { searchParamNameRef.current = config.searchParamName; }, [config.searchParamName]);
  useEffect(() => { getItemDisplayNameRef.current = config.getItemDisplayName; }, [config.getItemDisplayName]);

  // Dropdown service refs
  const dropdownServiceRef = useRef(config.dropdownService);
  const dropdownSearchParamNameRef = useRef(config.dropdownSearchParamName);
  useEffect(() => { dropdownServiceRef.current = config.dropdownService; }, [config.dropdownService]);
  useEffect(() => { dropdownSearchParamNameRef.current = config.dropdownSearchParamName; }, [config.dropdownSearchParamName]);

  // Core list function — ALWAYS returns TItem[]
  const list = useCallback(async (): Promise<TItem[]> => {
    const currentPagination = paginationRef.current;
    const currentSearchTerm = searchTermRef.current;
    const wasSearchFocused = searchInputRef.current === document.activeElement;
    
    // Create abort controller for this request
    const abortController = new AbortController();
    
    // Maintain focus during the entire API request process
    const maintainFocus = () => {
      if (!mountedRef.current) return; // Prevent focus on unmounted components
      if (wasSearchFocused && searchInputRef.current && document.activeElement !== searchInputRef.current) {
        try {
          searchInputRef.current.focus();
        } catch (error) {
          // Ignore focus errors (component might be unmounted)
        }
      }
    };

    try {
      setLoading(true);
      setError(null);

      const paramName = searchParamNameRef.current;
      const apiParams =
        paramName === "search"
          ? { page: currentPagination.page, pageSize: currentPagination.pageSize, search: currentSearchTerm }
          : { page: currentPagination.page, pageSize: currentPagination.pageSize, PageSearch: currentSearchTerm };

      const res = await getDataRef.current(apiParams);

      if (!mountedRef.current) {
        // don't update state after unmount; still return a valid array
        return [];
      }

      // Maintain focus immediately after getting response
      maintainFocus();

      // Update pagination but preserve user-selected page & pageSize
      setPagination(prev => {
        const next: PaginationInfo = { ...res.pagination, page: prev.page, pageSize: prev.pageSize };
        const same =
          prev.itemsCount === next.itemsCount &&
          prev.pageSize   === next.pageSize &&
          prev.page       === next.page &&
          prev.pagesCount === next.pagesCount;
        return same ? prev : next;
      });

      setData(res.data ?? []);
      
      // Maintain focus after state updates with proper cleanup
      const focusTimeout = setTimeout(() => {
        if (mountedRef.current) {
          maintainFocus();
        }
      }, 10);

      // Always return array
      return res.data ?? [];
    } catch (err) {
      // Check if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      
      setError(err instanceof Error ? err.message : "Failed to load data");
      return []; // return empty array on error
    } finally {
      if (!mountedRef.current) return[];
      setLoading(false);
      
      // Final focus restoration (exactly like tree view)
      setTimeout(() => maintainFocus(), 50);
      setTimeout(() => maintainFocus(), 100);
    }
  }, []); // stable

  // Remove the old useEffect since we now handle debouncing in handleSearchChange

  // Debounced dropdown search
  useEffect(() => {
    const svc = dropdownServiceRef.current;
    if (!svc) return;

    const timer = setTimeout(async () => {
      try {
        const paramName = dropdownSearchParamNameRef.current ?? "PageSearch";
        const params =
          paramName === "search"
            ? { page: 1, pageSize: 50, search: dropdownSearchTerm }
            : { page: 1, pageSize: 50, PageSearch: dropdownSearchTerm };

        const res = await svc.getData(params);
        if (!mountedRef.current) return;
        setDropdownOptions(res.data);
      } catch (e) {
        // eslint-disable-next-line no-appLogger
        appLogger.error("Error loading dropdown options:", e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dropdownSearchTerm]);

  // CRUD service binding with stable references
  const crudService = useMemo(
    () => ({
      list,
      create: (d: TCreate) => createRef.current(d),
      update: (id: string, d: TUpdate) => updateRef.current(id, d),
      delete: (id: string) => deleteRef.current(id),
    }),
    [list]
  );

  // Enhanced toast notifications
  const { operationSuccess, operationError } = useEnhancedToast();

  // Enhanced CRUD VM (modals + confirmation)
  const crud = useCrudViewModel<TItem, TCreate, TUpdate>(crudService, {
    itemTypeName: config.itemTypeName,
    itemTypeNamePlural: config.itemTypeNamePlural,
    getItemDisplayName: (item: TItem) => getItemDisplayNameRef.current(item),
    notifications: {
      operationSuccess,
      operationError,
    },
  });

  // Handle input change (exactly like tree view)
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
      setSearchTerm(value); // This triggers the API call
    }, 300); // 300ms debounce
  }, []);

  // Mount / unmount
  useEffect(() => {
    mountedRef.current = true;
    list(); // initial load
    return () => {
      mountedRef.current = false;
    };
  }, [list]);

  // Re-run on debounced search term
  useEffect(() => {
    list();
  }, [searchTerm, list]);

  // Pagination handlers
  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    setTimeout(() => { list(); }, 0);
  }, [list]);

  const changePageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
    setTimeout(() => { list(); }, 0);
  }, [list]);

  // Legacy compatibility
  const searchItems = useCallback((term: string) => {
    handleSearchChange(term);
  }, [handleSearchChange]);

  const dropdownOptionsMapped = useMemo(() => {
    const svc = dropdownServiceRef.current;
    if (!svc) return [];
    return dropdownOptions.map(item => ({
      label: svc.getLabel(item),
      value: svc.getValue(item),
    }));
  }, [dropdownOptions]);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<TItem | null>(null);

  // View handlers
  const openViewModal = useCallback((item: TItem) => {
    setViewItem(item);
    setViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewModalOpen(false);
    setViewItem(null);
  }, []);

  return {
    // Enhanced CRUD functionality (modals, confirmations, etc.)
    ...crud,

    // Managed state
    data,
    loading,
    error,
    items: data, // legacy alias

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

    // Manual refresh
    refresh: list,

    // Dropdowns
    dropdownOptions: dropdownOptionsMapped,
    searchDropdown: setDropdownSearchTerm,

    // View functionality
    viewModalOpen,
    viewItem,
    openViewModal,
    closeViewModal,
  };
}
