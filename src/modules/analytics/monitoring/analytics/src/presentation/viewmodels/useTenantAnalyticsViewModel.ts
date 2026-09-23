"use client";

/**
 * Tenant Analytics ViewModel (Orchestrator)
 *
 * Composes tenant analytics data from the dedicated analytics repository.
 * NO LONGER borrows from dashboardRepository — uses its own analyticsRepository.
 * All query keys include tenantId for tenant-aware caching.
 */
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { monitoringContainer } from "@modules/monitoring/di";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";

// ─── Query keys ──────────────────────────────────────────────────────
/**
 * Exported constant defining parameters and fields for analytics keys configurations.
 */
export const analyticsKeys = {
  all: (tenantId: string | null) => ["analytics", tenantId ?? "system"] as const,
  summary: (tenantId: string | null) => [...analyticsKeys.all(tenantId), "summary"] as const,
  distribution: (days: number, tenantId: string | null) =>
    [...analyticsKeys.all(tenantId), "distribution", days] as const,
  comparison: (days: number, tenantId: string | null) =>
    [...analyticsKeys.all(tenantId), "comparison", days] as const,
};

// ─── KPI Metrics ─────────────────────────────────────────────────────
/**
 * React hook/ViewModel orchestrating state and data flows for tenant metrics view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantMetricsViewModel(tenantId: string | null) {
  const repo = monitoringContainer.analyticsRepository;

  const summaryQuery = useQuery({
    queryKey: analyticsKeys.summary(tenantId),
    queryFn: () => repo.getSummary(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const d = summaryQuery.data;
  const metrics = d
    ? {
        totalTenants: d.totalTenants,
        activeTenants: d.totalTenants, // All tenants are active until we have a separate count
        totalUsers: d.totalUsers,
        avgUsersPerTenant: d.totalTenants > 0 ? Math.round(d.totalUsers / d.totalTenants) : 0,
      }
    : null;

  return {
    data: metrics,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    refetch: summaryQuery.refetch,
  };
}

// ─── Admin Distribution ──────────────────────────────────────────────
/**
 * React hook/ViewModel orchestrating state and data flows for admin distribution view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useAdminDistributionViewModel(tenantId: string | null) {
  const repo = monitoringContainer.analyticsRepository;

  return useQuery({
    queryKey: analyticsKeys.distribution(30, tenantId),
    queryFn: () => repo.getEventDistribution(30),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ─── Login Comparison ────────────────────────────────────────────────
/**
 * React hook/ViewModel orchestrating state and data flows for tenant comparison view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantComparisonViewModel(days: number = 30, tenantId: string | null = null) {
  const repo = monitoringContainer.analyticsRepository;

  return useQuery({
    queryKey: analyticsKeys.comparison(days, tenantId),
    queryFn: () => repo.getLoginActivity(days),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ─── Orchestrator ────────────────────────────────────────────────────
/**
 * React hook/ViewModel orchestrating state and data flows for tenant analytics view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantAnalyticsViewModel() {
  const tenantId = useCurrentTenantId();
  const metrics = useTenantMetricsViewModel(tenantId);
  const distribution = useAdminDistributionViewModel(tenantId);
  const comparison = useTenantComparisonViewModel(30, tenantId);

  const isLoading = metrics.isLoading || distribution.isLoading;

  const refetchAll = useCallback(() => {
    metrics.refetch();
    distribution.refetch();
    comparison.refetch();
  }, [metrics, distribution, comparison]);

  return {
    metrics,
    distribution,
    comparison,
    isLoading,
    refetchAll,
    exportEndpoint: monitoringContainer.analyticsRepository.exportEndpoint,
  };
}
