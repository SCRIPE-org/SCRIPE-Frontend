/**
 * Features ViewModel
 *
 * Context-aware: detects whether the viewer is a system admin or tenant admin.
 * - System admin (no tenant context, no drill-down): shows global feature catalog (CRUD)
 * - Tenant admin / super admin drill-down / impersonation: shows tenant's effective features (read-only)
 *
 * Uses useTenantContext() for reactive drill-down detection — the hook updates
 * immediately when drill-down enters or exits, unlike raw sessionStorage reads.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import type { Feature } from "../../domain/entities/Feature";
import type { TenantEffectiveFeature } from "../../domain/entities/TenantEffectiveFeature";

export function useFeaturesViewModel() {
  const { featureRepository } = entitlementsContainer;

  // ── Detect context ──
  // System admin = tenantId is null (from JWT); tenant admin = tenantId is set
  const userTenantId = useAppStore((s) => s.user?.tenantId);

  // Reactive drill-down context (updates when entering/exiting tenant world)
  const { isInTenantWorld } = useTenantContext();

  // System catalog mode: system admin (tenantId == null) with NO drill-down context
  // - userTenantId: null for system admins, set for tenant admins / impersonation
  // - isInTenantWorld: set when super admin drills into a tenant
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;

  // ── CATALOG MODE: Global feature catalog (existing CRUD) ──
  // Only enabled for system admins — tenant admins never fire this API call
  const catalogVm = useCrudViewModel<Feature, never, never>(
    ["entitlements", "features"],
    {
      getAll: async (params) => {
        const res = await featureRepository.getAll({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        });
        return {
          items: res.items || [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: res.totalPages,
          },
        };
      },
      // Features are system-seeded — no create, update, or delete
    },
    { enabled: isSystemCatalogMode }
  );

  // ── EFFECTIVE MODE: Tenant's resolved features ──
  // Key includes isInTenantWorld so it refetches when entering/exiting drill-down
  const effectiveQuery = useQuery<TenantEffectiveFeature[]>({
    queryKey: ["entitlements", "effective-features", userTenantId ?? "self", isInTenantWorld],
    queryFn: () => featureRepository.getEffective(),
    enabled: !isSystemCatalogMode,
  });

  return {
    // Mode flag
    isSystemCatalogMode,

    // Catalog mode data (for GenericCrudView)
    catalogVm: isSystemCatalogMode ? catalogVm : undefined,

    // Effective mode data
    effectiveFeatures: effectiveQuery.data ?? [],
    isLoadingEffective: effectiveQuery.isLoading,
    effectiveError: effectiveQuery.error,
  };
}
