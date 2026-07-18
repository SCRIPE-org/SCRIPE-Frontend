/**
 * Features ViewModel
 *
 * Context-aware: system administrators manage the complete feature catalog;
 * tenant contexts see their resolved, read-only feature values.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import type { Feature } from "../../domain/entities/Feature";
import type { TenantEffectiveFeature } from "../../domain/entities/TenantEffectiveFeature";
import type {
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from "../../domain/entities/FeatureRequests";

/**
 * Fetches the complete catalog through the repository's bounded auto-pagination.
 * The catalog view can therefore apply accurate client-side filters and metrics
 * without bypassing the repository/service layers.
 */
export function useFeatureCatalogViewModel(enabled: boolean) {
  const { featureRepository } = entitlementsContainer;

  return useCrudViewModel<Feature, CreateFeatureRequest, UpdateFeatureRequest>(
    ["entitlements", "features", "catalog-all"],
    {
      getAll: async () => {
        const items = await featureRepository.getAllFeatures();
        return {
          items,
          pagination: {
            itemsCount: items.length,
            pageSize: Math.max(items.length, 1),
            page: 1,
            pagesCount: items.length > 0 ? 1 : 0,
          },
        };
      },
      create: async (data) => {
        const id = await featureRepository.create(data);
        return featureRepository.getById(id);
      },
      update: async (id, data) => {
        await featureRepository.update(id, data);
        return featureRepository.getById(id);
      },
      delete: async (id) => {
        await featureRepository.delete(id);
      },
    },
    { enabled, initialPageSize: 100 }
  );
}

export type FeatureCatalogViewModel = Omit<
  ReturnType<typeof useFeatureCatalogViewModel>,
  "searchInputRef"
>;

/**
 * React hook/ViewModel orchestrating state and data flows for the features page.
 */
export function useFeaturesViewModel() {
  const { featureRepository } = entitlementsContainer;

  // System admins have no tenant in their JWT. Drill-down/impersonation moves
  // them into the effective tenant view and must disable the catalog request.
  const userTenantId = useAppStore((state) => state.user?.tenantId);
  const { isInTenantWorld } = useTenantContext();
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;

  const catalogVm = useFeatureCatalogViewModel(isSystemCatalogMode);

  const effectiveQuery = useQuery<TenantEffectiveFeature[]>({
    queryKey: ["entitlements", "effective-features", userTenantId ?? "self", isInTenantWorld],
    queryFn: () => featureRepository.getEffective(),
    enabled: !isSystemCatalogMode,
  });

  return {
    isSystemCatalogMode,
    catalogVm: isSystemCatalogMode ? catalogVm : undefined,
    effectiveFeatures: effectiveQuery.data ?? [],
    isLoadingEffective: effectiveQuery.isLoading,
    effectiveError: effectiveQuery.error,
  };
}
