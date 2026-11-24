"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { usePermissions } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
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
  platformOnly?: boolean;
}

export function usePermissionCatalog() {
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const { isPlatformSuperAdmin, has: hasPerm } = usePermissions();
  const { currentTenant, isInTenantWorld } = useTenantContext();
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;
  const effectiveTenantId = isInTenantWorld ? currentTenant?.id : userTenantId;
  const useCrossTenantEndpoint = Boolean(
    !isSystemCatalogMode &&
      effectiveTenantId &&
      (isPlatformSuperAdmin || (effectiveTenantId !== userTenantId && hasPerm(SYSTEM_PERMISSIONS.TENANTS_VIEW)))
  );

  return useQuery<PermissionCatalogItem[]>({
    queryKey: [
      "permissions",
      "catalog",
      isSystemCatalogMode ? "system" : "tenant",
      effectiveTenantId ?? "platform",
      useCrossTenantEndpoint,
    ],
    queryFn: async () => {
      const { permissionRepository } = identityContainer;
      const items =
        !useCrossTenantEndpoint || !effectiveTenantId
          ? ((await permissionRepository.getAll()) as unknown as PermissionCatalogItem[])
          : ((await permissionRepository.getForTenant(
              effectiveTenantId
            )) as unknown as PermissionCatalogItem[]);
      if (isSystemCatalogMode) return items;
      return items.filter(
        (p) => (p as { platformOnly?: boolean }).platformOnly !== true
      );
    },
    staleTime: 10 * 60 * 1000,
  });
}
