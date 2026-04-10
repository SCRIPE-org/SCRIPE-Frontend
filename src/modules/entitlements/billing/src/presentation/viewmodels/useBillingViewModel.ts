"use client";

import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useAppStore } from "@/core/store/useAppStore";

export function useBillingViewModel() {
  const { billingRepository } = entitlementsContainer;
  const tenantId = useAppStore((s) => s.user?.tenantId ?? "");

  const configQuery = useQuery({
    queryKey: ["billing", "config", tenantId],
    queryFn: () => billingRepository.getConfig(tenantId),
    enabled: !!tenantId,
  });

  const revenueQuery = useQuery({
    queryKey: ["billing", "revenue"],
    queryFn: () => billingRepository.getRevenue(),
  });

  const featuresQuery = useQuery({
    queryKey: ["billing", "features"],
    queryFn: () => billingRepository.getFeatures(),
  });

  const config = (configQuery.data ?? {}) as Record<string, unknown>;
  const revenue = (revenueQuery.data ?? {}) as Record<string, unknown>;
  const features = (featuresQuery.data ?? []) as unknown[];

  return {
    config,
    revenue,
    features,
    isLoading: configQuery.isLoading || revenueQuery.isLoading,
    error: configQuery.error || revenueQuery.error,
    refetch: () => {
      configQuery.refetch();
      revenueQuery.refetch();
      featuresQuery.refetch();
    },
    tenantId,
  };
}
