/**
 * Generic Tree View Model Hook
 *
 * A comprehensive, reusable hook for managing hierarchical tree data with:
 * - **TanStack Query integration** for caching and deduplication
 * - Type-safe CRUD operations
 * - Tree traversal and selection
 * - Auto-parent selection
 * - Form handling for create/edit
 *
 * @version 2.0.0 - TanStack Query Integration
 */
"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { PaginationInfo } from "@core/common/pagination";
import { useEnhancedDelete } from "@core/hooks/use-enhanced-delete";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

export interface TreeService<T extends TreeNode, TCreate, TUpdate> {
  getWithChildren: (params: { page: number; pageSize: number; PageSearch: string }) => Promise<{
    data: T[];
    pagination: PaginationInfo;
  }>;
  create: (data: TCreate) => Promise<T>;
  update: (id: string, data: TUpdate) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

// Create a generic mock service for selectable mode
export function createMockTreeService<T extends TreeNode>(
  mockData: T[],
  searchFields: (keyof T)[] = []
): TreeService<T, any, any> {
  return {
    getWithChildren: async (params) => {
      // Apply search filter if provided
      let filteredData = mockData;
      if (params.PageSearch && searchFields.length > 0) {
        const searchTerm = params.PageSearch.toLowerCase();
        filteredData = mockData.filter((item: any) =>
          searchFields.some((field) => item[field]?.toString().toLowerCase().includes(searchTerm))
        );
      }

      // Apply pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          itemsCount: filteredData.length,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.ceil(filteredData.length / params.pageSize),
        },
      };
    },
    create: async () => {
      throw new Error("Not implemented for mock service");
    },
    update: async () => {
      throw new Error("Not implemented for mock service");
    },
    delete: async () => {
      throw new Error("Not implemented for mock service");
    },
  };
}

export interface TreeViewModelConfig<T extends TreeNode> {
  /** TanStack Query key for caching and invalidation */
  queryKey?: string[];
  // Core configuration - make everything optional for maximum flexibility
  itemTypeName?: string;
  itemTypeNamePlural?: string;
  getItemDisplayName?: (item: T) => string;
  getFormFieldName?: (item: T) => string;
  createFormData?: (values: any) => any;
  updateFormData?: (values: any, item: T) => any;
  getInitialFormValues?: (item?: T, parent?: T) => any;

  // Selectable mode configuration
  selectable?: boolean;
  disabled?: boolean; // Disable selection interactions while maintaining visual state
  getValueToSend?: (item: T) => string;
  initialSelectedValues?: string[];
  onSelectionChange?: (selectedValues: string[]) => void;
  autoSelectParents?: boolean; // Auto-select parent nodes when child is selected

  // Control behavior
  autoLoad?: boolean; // Whether to automatically load data on mount
  staticData?: T[]; // Provide static data instead of using service
  disableOperations?: boolean; // Disable CRUD operations for read-only mode
  /** Stale time in milliseconds (default: 30 seconds) */
  staleTime?: number;
}

export function useTreeViewModel<T extends TreeNode, TCreate = any, TUpdate = any>(
  service?: TreeService<T, TCreate, TUpdate> | null,
  config: TreeViewModelConfig<T> = {}
) {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState<PaginationInfo>({
    itemsCount: 0,
    pageSize: 10,
    page: 1,
    pagesCount: 1,
  });

  // Selectable mode state
  const [selectedValues, setSelectedValues] = useState<string[]>(
    config.initialSelectedValues || []
  );

  // Update selected values when config changes (for initial permissions)
  useEffect(() => {
    if (config.initialSelectedValues) {
      setSelectedValues(config.initialSelectedValues);
    }
  }, [config.initialSelectedValues]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [parentForNew, setParentForNew] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<any>(config.getInitialFormValues?.() || {});

  // Search state - separate display value from search term
  const [searchValue, setSearchValue] = useState<string>(""); // What user types (immediate)
  const [searchTerm, setSearchTerm] = useState<string>(""); // What triggers API (debounced)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useEnhancedToast();
  const { t } = useI18n();
  const deleteHook = useEnhancedDelete();

  // Build query key
  const effectiveQueryKey = config.queryKey ?? ["tree"];

  // Build query params
  const queryParams = useMemo(
    () => ({
      page: pagination.page,
      pageSize: pagination.pageSize,
      PageSearch: searchTerm,
    }),
    [pagination.page, pagination.pageSize, searchTerm]
  );

  // ==========================================
  // TanStack Query - Main Data Fetching
  // ==========================================
  const {
    data: queryData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...effectiveQueryKey, queryParams],
    queryFn: () => service?.getWithChildren(queryParams),
    enabled: !!service && !config.staticData && config.autoLoad !== false,
    placeholderData: keepPreviousData,
    staleTime: config.staleTime ?? 30 * 1000,
  });

  // Derive tree data from query or static data
  const tree = useMemo(() => {
    if (config.staticData) {
      return config.staticData;
    }
    return queryData?.data ?? [];
  }, [config.staticData, queryData?.data]);

  // Update pagination from query response
  useEffect(() => {
    if (queryData?.pagination) {
      setPagination((prev) => ({
        ...queryData.pagination,
        pageSize: prev.pageSize, // Keep user-selected page size
      }));
    }
  }, [queryData?.pagination]);

  // ==========================================
  // TanStack Mutations
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (data: TCreate) => {
      if (!service) throw new Error("Service not available");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: effectiveQueryKey });
      toast({
        title: t("toast.created").replace(
          "{itemType}",
          t(`${config.itemTypeNamePlural || "items"}`)
        ),
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: t("toast.createError").replace(
          "{itemType}",
          t(`${config.itemTypeNamePlural || "items"}`)
        ),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) => {
      if (!service) throw new Error("Service not available");
      return service.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: effectiveQueryKey });
      toast({
        title: t("toast.updated").replace(
          "{itemType}",
          t(`${config.itemTypeNamePlural || "items"}`)
        ),
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: t("toast.updateError").replace(
          "{itemType}",
          t(`${config.itemTypeNamePlural || "items"}`)
        ),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!service) throw new Error("Service not available");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: effectiveQueryKey });
      toast({
        title: t("toast.deleted"),
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: t("toast.deleteError"),
        variant: "destructive",
      });
    },
  });

  // ==========================================
  // Tree Helpers
  // ==========================================

  // Helper function to find all parent IDs for a given item
  const findAllParents = useCallback((itemId: string, treeData: T[]): string[] => {
    const parents: string[] = [];

    const findParent = (nodes: T[], targetId: string, currentParents: string[] = []): boolean => {
      for (const node of nodes) {
        if (node.id === targetId) {
          parents.push(...currentParents);
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findParent(node.children as T[], targetId, [...currentParents, node.id])) {
            return true;
          }
        }
      }
      return false;
    };

    findParent(treeData, itemId);
    return parents;
  }, []);

  // Helper function to find the immediate parent of a given item
  const findImmediateParent = useCallback((itemId: string, treeData: T[]): T | null => {
    const findParent = (nodes: T[], targetId: string): T | null => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const hasTargetChild = (node.children as T[]).some((child) => child.id === targetId);
          if (hasTargetChild) {
            return node;
          }
          const found = findParent(node.children as T[], targetId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return findParent(treeData, itemId);
  }, []);

  // ==========================================
  // Selection handlers
  // ==========================================
  const handleSelectionChange = useCallback(
    (newSelectedValues: string[]) => {
      if (config.disabled) {
        return;
      }

      const finalSelectedValues = [...newSelectedValues];

      // Auto-select parents if enabled
      if (config.autoSelectParents) {
        const allParentsToAdd = new Set<string>();

        newSelectedValues.forEach((selectedId) => {
          const parents = findAllParents(selectedId, tree);
          parents.forEach((parentId) => allParentsToAdd.add(parentId));
        });

        allParentsToAdd.forEach((parentId) => {
          if (!finalSelectedValues.includes(parentId)) {
            finalSelectedValues.push(parentId);
          }
        });
      }

      setSelectedValues(finalSelectedValues);
      if (config.onSelectionChange) {
        config.onSelectionChange(finalSelectedValues);
      }
    },
    [config, tree, findAllParents]
  );

  const clearSelection = useCallback(() => {
    setSelectedValues([]);
    if (config.onSelectionChange) {
      config.onSelectionChange([]);
    }
  }, [config]);

  const selectAll = useCallback(() => {
    const allValues: string[] = [];
    const walk = (nodes: T[]) => {
      nodes.forEach((node) => {
        if (config.getValueToSend) {
          allValues.push(config.getValueToSend(node));
        } else {
          allValues.push(node.id);
        }
        if (node.children && node.children.length > 0) {
          walk(node.children as T[]);
        }
      });
    };
    walk(tree);

    setSelectedValues(allValues);
    if (config.onSelectionChange) {
      config.onSelectionChange(allValues);
    }
  }, [tree, config]);

  // ==========================================
  // CRUD Operations (using mutations)
  // ==========================================
  const createItem = useCallback(
    async (data: TCreate) => {
      if (config.disableOperations) {
        throw new Error("Create operation not available");
      }
      return createMutation.mutateAsync(data);
    },
    [config.disableOperations, createMutation]
  );

  const updateItem = useCallback(
    async (id: string, data: TUpdate) => {
      if (config.disableOperations) {
        throw new Error("Update operation not available");
      }
      return updateMutation.mutateAsync({ id, data });
    },
    [config.disableOperations, updateMutation]
  );

  const deleteItem = useCallback(
    async (item: T) => {
      if (config.disableOperations) {
        throw new Error("Delete operation not available");
      }

      await deleteHook.confirmDelete(
        async () => {
          await deleteMutation.mutateAsync(item.id);
        },
        {
          itemType: t(`${config.itemTypeNamePlural || "items"}`),
          itemName: config.getItemDisplayName?.(item) || "Item",
        }
      );
    },
    [config, deleteHook, t, deleteMutation]
  );

  // ==========================================
  // Pagination handlers
  // ==========================================
  const changePage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, page: 1 }));
  }, []);

  // ==========================================
  // Search handling
  // ==========================================
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        searchInputRef.current.focus();
      }

      setPagination((prev) => ({ ...prev, page: 1 }));
      setSearchTerm(value);
    }, 300);
  }, []);

  const searchItems = useCallback(
    (term: string) => {
      handleSearchChange(term);
    },
    [handleSearchChange]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================
  // Form handling
  // ==========================================
  const resetForm = useCallback(() => {
    setEditing(null);
    setParentForNew(null);
    setFormValues(config.getInitialFormValues?.() || {});
  }, [config]);

  const openAddChild = useCallback(
    (parent: T | null) => {
      // Only block if trying to add a child under a parent when tree is empty
      // Allow adding root items (parent === null) even when tree is empty
      if (parent !== null && (!tree || tree.length === 0)) {
        return;
      }

      setEditing(null);
      setParentForNew(parent);
      const initialValues = config.getInitialFormValues?.(undefined, parent || undefined) || {};
      setFormValues(initialValues);
      setModalOpen(true);
    },
    [config, tree]
  );

  const openEdit = useCallback(
    (item: T) => {
      if (!tree || tree.length === 0) {
        return;
      }

      setEditing(item);
      const parent = findImmediateParent(item.id, tree);
      setParentForNew(parent);
      const initialValues = config.getInitialFormValues?.(item, parent || undefined) || {};
      setFormValues(initialValues);
      setModalOpen(true);
    },
    [config, findImmediateParent, tree]
  );

  const onSubmit = useCallback(
    async (data?: any) => {
      if (config.disableOperations) {
        return;
      }
      // Use passed data or fallback to state (though GenericForm always passes data)
      const dataToSubmit = data || formValues;

      try {
        if (editing) {
          const updateData = config.updateFormData?.(dataToSubmit, editing) || dataToSubmit;
          await updateItem(editing.id, updateData);
        } else {
          const createData = config.createFormData?.(dataToSubmit) || dataToSubmit;
          await createItem(createData);
        }

        setModalOpen(false);
        resetForm();
      } catch (error) {
        // Error handling is already done in mutations
      }
    },
    [editing, formValues, createItem, updateItem, config, resetForm]
  );

  // Parent options for forms (flatten current tree)
  const parentOptions = useMemo(() => {
    const result: { id: string; name: string }[] = [];
    const walk = (nodes: T[]) => {
      nodes.forEach((n) => {
        result.push({ id: n.id, name: config.getItemDisplayName?.(n) || n.id });
        if (n.children && n.children.length) walk(n.children as T[]);
      });
    };
    walk(tree);
    return result;
  }, [tree, config]);

  return {
    // Tree data
    tree,
    loading: isLoading,
    isFetching,
    pagination,
    searchValue,
    searchTerm,
    searchInputRef,

    // Tree operations
    listTree: refetch,
    createItem,
    updateItem,
    deleteItem,
    changePage,
    changePageSize,
    handleSearchChange,
    searchItems,

    // Modal and form
    modalOpen,
    setModalOpen,
    editing,
    parentForNew,
    formValues,
    setFormValues,
    parentOptions,
    resetForm,
    openAddChild,
    openEdit,
    onSubmit,

    // Enhanced delete properties
    isDeleting: deleteHook.isDeleting || deleteMutation.isPending,
    showConfirmation: deleteHook.showConfirmation,
    deleteOptions: deleteHook.deleteOptions,
    executeDelete: deleteHook.executeDelete,
    cancelDelete: deleteHook.cancelDelete,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,

    // Selectable mode properties
    selectedValues,
    handleSelectionChange,
    clearSelection,
    selectAll,
    disabled: config.disabled,

    // Config
    config,
  };
}

export type TreeViewModel<T extends TreeNode, TCreate, TUpdate> = ReturnType<
  typeof useTreeViewModel<T, TCreate, TUpdate>
>;
