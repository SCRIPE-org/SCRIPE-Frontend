/**
 * Permissions ViewModel
 *
 * Provides data and operations for the permissions management view.
 * SOLID: All state logic lives here, View is pure UI.
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import { useDebounce } from "@core/hooks/use-validation";
import type { Permission, PermissionCategoryGroup } from "../../domain/entities/Permission";
import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "../../domain/entities/PermissionRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

export function usePermissionsViewModel() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { permissionRepository } = systemContainer;

  // === FILTER STATE (owned by ViewModel, not View) ===
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const debouncedSearch = useDebounce(searchInput, 300);

  // Derived filter state for queries
  const category = categoryFilter;
  const search = debouncedSearch;

  // Query key
  const queryKey = useMemo(() => ["permissions", { category, search }], [category, search]);

  // Fetch permissions
  const {
    data: permissions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => permissionRepository.getAll({ category, search }),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["permissions", "categories"],
    queryFn: () => permissionRepository.getCategories(),
  });

  // Group permissions by category
  const groupedPermissions = useMemo((): PermissionCategoryGroup[] => {
    if (!permissions) return [];

    const groups = new Map<string, Permission[]>();

    permissions.forEach((permission) => {
      const cat = permission.category || "Uncategorized";
      const existing = groups.get(cat) || [];
      groups.set(cat, [...existing, permission]);
    });

    return Array.from(groups.entries())
      .map(([category, perms]) => ({
        category,
        permissions: perms.sort((a, b) => a.displayOrder - b.displayOrder),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [permissions]);

  // Create permission mutation
  const createMutation = useMutation({
    mutationFn: (request: CreatePermissionRequest) => permissionRepository.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      success({
        title: "Permission Created",
        description: "The permission has been created successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: "Create Failed",
        description: err.message || "Failed to create permission.",
      });
    },
  });

  // Update permission mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdatePermissionRequest }) =>
      permissionRepository.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      success({
        title: "Permission Updated",
        description: "The permission has been updated successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: "Update Failed",
        description: err.message || "Failed to update permission.",
      });
    },
  });

  // Delete permission mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => permissionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      success({
        title: "Permission Deleted",
        description: "The permission has been deleted successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: "Delete Failed",
        description: err.message || "Failed to delete permission.",
      });
    },
  });

  // Handlers
  const handleCreate = useCallback(
    (request: CreatePermissionRequest) => createMutation.mutateAsync(request),
    [createMutation]
  );

  const handleUpdate = useCallback(
    (id: string, request: UpdatePermissionRequest) => updateMutation.mutateAsync({ id, request }),
    [updateMutation]
  );

  const handleDelete = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  return {
    // Data
    permissions: permissions ?? [],
    groupedPermissions,
    categories: categories ?? [],
    totalCount: permissions?.length ?? 0,

    // Filter state (View binds to these, no useState in View)
    filter: {
      searchValue: searchInput,
      onSearchChange: setSearchInput,
      categoryFilter,
      onCategoryChange: setCategoryFilter,
    },

    // State
    isLoading,
    isError,
    error,

    // Handlers
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch: () => refetch(),

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
