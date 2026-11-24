/**
 * Permissions ViewModel
 *
 * Context-aware: system admin sees full catalog, tenant admin / drill-down see
 * only the permissions assigned to that tenant (via TenantPermission table).
 *
 * SOLID: All state logic lives here, View is pure UI.
 */
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useDebounce } from "@core/hooks/use-validation";
import { useAppStore } from "@core/store/useAppStore";
import { usePermissions } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import type { PermissionModuleGroup } from "../../domain/entities/Permission";

const EMPTY_PERMISSION_GROUPS: PermissionModuleGroup[] = [];

/**
 * React hook/ViewModel orchestrating state and data flows for permissions view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function usePermissionsViewModel() {
  const { permissionRepository } = identityContainer;

  // ── Context detection (same pattern as features/editions) ──
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const { isPlatformSuperAdmin, has: hasPerm } = usePermissions();
  const { currentTenant, isInTenantWorld } = useTenantContext();

  // System catalog mode: system admin (tenantId == null) with no drill-down
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;

  // Effective tenant ID for scoped queries
  // Drill-down uses currentTenant.id, tenant admin uses their own tenantId
  const effectiveTenantId = isInTenantWorld ? currentTenant?.id : userTenantId;

  // /Tenants/{id}/permissions[/grouped] enforces `tenants.view`; own-tenant admins
  // without `tenants.view` use `/permissions[/grouped]`, which the backend scopes to their active tenant.
  const useCrossTenantEndpoint = Boolean(
    !isSystemCatalogMode &&
      effectiveTenantId &&
      (isPlatformSuperAdmin || (effectiveTenantId !== userTenantId && hasPerm(SYSTEM_PERMISSIONS.TENANTS_VIEW)))
  );

  // === FILTER STATE (owned by ViewModel, not View) ===
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const debouncedSearch = useDebounce(searchInput, 300);

  // Derived filter state for queries
  const category = categoryFilter;
  const search = debouncedSearch;

  // ── CATALOG / OWN-TENANT MODE: `/permissions` (system admin: full catalog; tenant admin: tenant-filtered pool) ──
  const catalogQuery = useQuery({
    queryKey: ["permissions", isSystemCatalogMode ? "catalog" : "own-tenant", effectiveTenantId ?? "platform", { category, search }],
    queryFn: () => permissionRepository.getAll({ category, search }),
    enabled: isSystemCatalogMode || !useCrossTenantEndpoint,
  });

  // ── CROSS-TENANT MODE: Explicit tenant permissions endpoint (requires `tenants.view`) ──
  const tenantQuery = useQuery({
    queryKey: ["permissions", "tenant", effectiveTenantId, { search }],
    queryFn: () => permissionRepository.getForTenant(effectiveTenantId!, { search }),
    enabled: useCrossTenantEndpoint && !!effectiveTenantId,
  });

  // Resolved data (defensively strip PlatformOnly items when not in platform catalog mode)
  const rawPermissions = useCrossTenantEndpoint ? tenantQuery.data : catalogQuery.data;
  const permissions = useMemo(() => {
    if (!rawPermissions) return rawPermissions;
    if (isSystemCatalogMode) return rawPermissions;
    return rawPermissions.filter(
      (p) => (p as { platformOnly?: boolean }).platformOnly !== true
    );
  }, [rawPermissions, isSystemCatalogMode]);
  const isLoading = useCrossTenantEndpoint ? tenantQuery.isLoading : catalogQuery.isLoading;
  const isError = useCrossTenantEndpoint ? tenantQuery.isError : catalogQuery.isError;
  const error = useCrossTenantEndpoint ? tenantQuery.error : catalogQuery.error;
  const refetch = useCrossTenantEndpoint ? tenantQuery.refetch : catalogQuery.refetch;

  // Fetch categories (for catalog & own-tenant modes)
  const { data: categories } = useQuery({
    queryKey: ["permissions", "categories", effectiveTenantId ?? "platform"],
    queryFn: () => permissionRepository.getCategories(),
    enabled: isSystemCatalogMode || !useCrossTenantEndpoint,
  });

  // Group permissions by category
  // ── CATALOG / OWN-TENANT GROUPED MODE: backend-driven Module → Category → Permission[] ──
  // ZERO client-side groupBy — backend sends the tree.
  const groupedQuery = useQuery({
    queryKey: ["permissions", isSystemCatalogMode ? "grouped" : "own-tenant-grouped", effectiveTenantId ?? "platform", { search }],
    queryFn: () => permissionRepository.getGrouped(search || undefined),
    enabled: isSystemCatalogMode || !useCrossTenantEndpoint,
  });

  // ── CROSS-TENANT GROUPED MODE: grouped permissions for a specific tenant ──
  const tenantGroupedQuery = useQuery({
    queryKey: ["permissions", "tenant-grouped", effectiveTenantId, { search }],
    queryFn: () =>
      permissionRepository.getGroupedForTenant(effectiveTenantId!, search || undefined),
    enabled: useCrossTenantEndpoint && !!effectiveTenantId,
  });

  const groupedQueryData = useCrossTenantEndpoint
    ? tenantGroupedQuery.data
    : groupedQuery.data;
  const groupedPermissions: PermissionModuleGroup[] = useMemo(() => {
    const rawGroupedPermissions = groupedQueryData ?? EMPTY_PERMISSION_GROUPS;
    if (isSystemCatalogMode) return rawGroupedPermissions;
    return rawGroupedPermissions
      .map((mg) => ({
        ...mg,
        categories: mg.categories
          .map((cat) => ({
            ...cat,
            permissions: cat.permissions.filter(
              (p) => (p as { platformOnly?: boolean }).platformOnly !== true
            ),
          }))
          .filter((cat) => cat.permissions.length > 0),
      }))
      .filter((mg) => mg.categories.length > 0);
  }, [groupedQueryData, isSystemCatalogMode]);

  // The grouped query is what the view actually renders — its own error state
  // must be surfaced, otherwise a failed /permissions/grouped call resolves to
  // an empty array and reads as "no permissions" instead of "request failed".
  const isGroupedError = useCrossTenantEndpoint ? tenantGroupedQuery.isError : groupedQuery.isError;
  const groupedError = useCrossTenantEndpoint ? tenantGroupedQuery.error : groupedQuery.error;
  const refetchGrouped = useCrossTenantEndpoint ? tenantGroupedQuery.refetch : groupedQuery.refetch;

  return {
    // Data
    permissions: permissions ?? [],
    groupedPermissions,
    categories: categories ?? [],
    totalCount: permissions?.length ?? 0,
    isSystemCatalogMode,
    isGroupedLoading: useCrossTenantEndpoint ? tenantGroupedQuery.isLoading : groupedQuery.isLoading,
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
