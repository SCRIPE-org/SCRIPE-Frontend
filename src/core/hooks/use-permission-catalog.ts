"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { identityContainer } from "@modules/identity/di";

export interface PermissionCatalogItem {
  id: string;
  code: string;
  displayNameEn?: string;
  displayNameAr?: string;
  nameEn?: string;
  nameAr?: string;
  module?: string;
  resource?: string;
}

export function usePermissionCatalog() {
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const { currentTenant, isInTenantWorld } = useTenantContext();
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;
  const effectiveTenantId = isInTenantWorld ? currentTenant?.id : userTenantId;

  return useQuery<PermissionCatalogItem[]>({
    queryKey: ["permissions", "catalog", effectiveTenantId],
    queryFn: async () => {
      const { permissionRepository } = identityContainer;
      if (isSystemCatalogMode || !effectiveTenantId) {
        return (await permissionRepository.getAll()) as unknown as PermissionCatalogItem[];
      }
      return (await permissionRepository.getForTenant(effectiveTenantId)) as unknown as PermissionCatalogItem[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
