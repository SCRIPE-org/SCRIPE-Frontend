"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseTenantEntitlementsViewModelProps {
  tenantId: string;
}

export function useTenantEntitlementsViewModel({ tenantId }: UseTenantEntitlementsViewModelProps) {
  const { t, language, direction } = useI18n();
  const isRtl = direction === "rtl";

  // Fetch resolved features using tenantRepository
  const {
    data: features,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tenant-entitlements", tenantId],
    queryFn: () => identityContainer.tenantRepository.getResolvedFeatures(tenantId),
    enabled: !!tenantId,
  });

  return {
    t,
    language,
    direction,
    isRtl,
    features,
    isLoading,
    error: error as Error | null,
  };
}
