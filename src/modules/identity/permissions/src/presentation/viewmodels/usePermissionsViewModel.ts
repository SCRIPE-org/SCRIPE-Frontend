/**
 * Permissions ViewModel
 *
 * Context-aware: system admin sees full catalog, tenant admin / drill-down see
 * only the permissions assigned to that tenant (via TenantPermission table).
 *
 * SOLID: All state logic lives here, View is pure UI.
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@/modules/identity/di";
import { useDebounce } from "@core/hooks/use-validation";
import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";
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

  // ── Context detection (same pattern as features/editions) ──
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const { currentTenant, isInTenantWorld } = useTenantContext();

  // System catalog mode: system admin (tenantId == null) with no drill-down
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;

  // Effective tenant ID for scoped queries
  // Drill-down uses currentTenant.id, tenant admin uses their own tenantId
  const effectiveTenantId = isInTenantWorld ? currentTenant?.id : userTenantId;

  // === FILTER STATE (owned by ViewModel, not View) ===
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const debouncedSearch = useDebounce(searchInput, 300);

  // Derived filter state for queries
  const category = categoryFilter;
  const search = debouncedSearch;

  // ── CATALOG MODE: Full permissions catalog (system admin, no drill-down) ──
  const catalogQuery = useQuery({
    queryKey: ["permissions", "catalog", { category, search }],
    queryFn: () => permissionRepository.getAll({ category, search }),
    enabled: isSystemCatalogMode,
  });

  // ── TENANT MODE: Tenant's assigned permissions ──
  const tenantQuery = useQuery({
    queryKey: ["permissions", "tenant", effectiveTenantId, { search }],
    queryFn: () => permissionRepository.getForTenant(effectiveTenantId!, { search }),
    enabled: !isSystemCatalogMode && !!effectiveTenantId,
  });

  // Resolved data
  const permissions = isSystemCatalogMode ? catalogQuery.data : tenantQuery.data;
  const isLoading = isSystemCatalogMode ? catalogQuery.isLoading : tenantQuery.isLoading;
  const isError = isSystemCatalogMode ? catalogQuery.isError : tenantQuery.isError;
  const error = isSystemCatalogMode ? catalogQuery.error : tenantQuery.error;
  const refetch = isSystemCatalogMode ? catalogQuery.refetch : tenantQuery.refetch;

  // Fetch categories (only in catalog mode — tenant mode shows all returned)
  const { data: categories } = useQuery({
    queryKey: ["permissions", "categories"],
    queryFn: () => permissionRepository.getCategories(),
    enabled: isSystemCatalogMode,
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
    isSystemCatalogMode,

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
