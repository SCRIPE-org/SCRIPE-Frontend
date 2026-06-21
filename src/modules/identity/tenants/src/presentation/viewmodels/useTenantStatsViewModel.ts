"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseTenantStatsViewModelProps {
  tenantId: string;
  enabled?: boolean;
}

export function useTenantStatsViewModel({ tenantId, enabled }: UseTenantStatsViewModelProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";

  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ["tenant-stats", tenantId],
    queryFn: async () => {
      const data = await identityContainer.tenantRepository.getStats(tenantId);
      return {
        adminsCount: data.adminsCount,
        rolesCount: data.rolesCount,
        subTenantsCount: data.subTenantsCount,
        permissionsCount: data.permissionsCount,
      };
    },
    enabled: enabled !== undefined ? enabled && !!tenantId : !!tenantId,
  });

  return {
    t,
    direction,
    isRtl,
    stats,
    loading,
  };
}
