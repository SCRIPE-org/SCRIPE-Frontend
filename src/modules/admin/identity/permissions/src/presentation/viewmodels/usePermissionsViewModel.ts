/**
 * Permissions ViewModel
 *
 * Context-aware: system admin sees full catalog, tenant admin / drill-down see
 * only the permissions assigned to that tenant (via TenantPermission table).
 *
 * SOLID: All state logic lives here, View is pure UI.
 */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useDebounce } from "@core/hooks/use-validation";
import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import type { PermissionModuleGroup } from "../../domain/entities/Permission";

/**
 * React hook/ViewModel orchestrating state and data flows for permissions view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function usePermissionsViewModel() {
  const { permissionRepository } = identityContainer;

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
  // ── CATALOG MODE GROUPED: backend-driven Module → Category → Permission[] ──
  // ZERO client-side groupBy — backend sends the tree.
  const groupedQuery = useQuery({
    queryKey: ["permissions", "grouped", { search }],
    queryFn: () => permissionRepository.getGrouped(search || undefined),
    enabled: isSystemCatalogMode,
  });

  // ── TENANT MODE GROUPED: grouped permissions for a specific tenant ──
  const tenantGroupedQuery = useQuery({
    queryKey: ["permissions", "tenant-grouped", effectiveTenantId, { search }],
    queryFn: () =>
      permissionRepository.getGroupedForTenant(effectiveTenantId!, search || undefined),
    enabled: !isSystemCatalogMode && !!effectiveTenantId,
  });

  const groupedPermissions: PermissionModuleGroup[] = isSystemCatalogMode
    ? (groupedQuery.data ?? [])
    : (tenantGroupedQuery.data ?? []);

  // The grouped query is what the view actually renders — its own error state
  // must be surfaced, otherwise a failed /permissions/grouped call resolves to
  // an empty array and reads as "no permissions" instead of "request failed".
  const isGroupedError = isSystemCatalogMode ? groupedQuery.isError : tenantGroupedQuery.isError;
  const groupedError = isSystemCatalogMode ? groupedQuery.error : tenantGroupedQuery.error;
  const refetchGrouped = isSystemCatalogMode ? groupedQuery.refetch : tenantGroupedQuery.refetch;

  return {
    // Data
    permissions: permissions ?? [],
    groupedPermissions,
    categories: categories ?? [],
    totalCount: permissions?.length ?? 0,
    isSystemCatalogMode,
    isGroupedLoading: isSystemCatalogMode ? groupedQuery.isLoading : tenantGroupedQuery.isLoading,
    isGroupedError,
    groupedError,

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

    refetch: () => refetch(),
    // Retries the grouped tree specifically — the query the view renders —
    // in addition to the flat list query the refresh button already covers.
    refetchGrouped: () => refetchGrouped(),
  };
}
