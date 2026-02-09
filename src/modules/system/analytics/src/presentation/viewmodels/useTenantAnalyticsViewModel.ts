'use client';

/**
 * Tenant Analytics ViewModel (Orchestrator)
 *
 * Composes tenant analytics data from dashboard repository.
 * Provides KPI metrics, admin distribution, login comparison, and tenant hierarchy.
 */
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getSystemContainer } from '@modules/system/di';
import { dashboardKeys } from '@modules/system/dashboard/src/presentation/viewmodels/useDashboardViewModel';

// ─── Query keys ──────────────────────────────────────────────────────
export const analyticsKeys = {
      all: ['analytics'] as const,
      metrics: () => [...analyticsKeys.all, 'metrics'] as const,
};

// ─── KPI Metrics ─────────────────────────────────────────────────────
export function useTenantMetricsViewModel() {
      const repo = getSystemContainer().dashboardRepository;

      const summaryQuery = useQuery({
            queryKey: dashboardKeys.summary(),
            queryFn: () => repo.getSummary(),
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });

      const metrics = useMemo(() => {
            if (!summaryQuery.data) return null;
            const d = summaryQuery.data;
            return {
                  totalTenants: d.totalTenants,
                  activeTenants: d.totalTenants, // All tenants are active until we have a separate count
                  totalUsers: d.totalUsers,
                  avgUsersPerTenant: d.totalTenants > 0 ? Math.round(d.totalUsers / d.totalTenants) : 0,
            };
      }, [summaryQuery.data]);

      return {
            data: metrics,
            isLoading: summaryQuery.isLoading,
            error: summaryQuery.error,
            refetch: summaryQuery.refetch,
      };
}

// ─── Admin Distribution ──────────────────────────────────────────────
export function useAdminDistributionViewModel() {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.eventDistribution(30),
            queryFn: () => repo.getEventDistribution(30),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

// ─── Login Comparison ────────────────────────────────────────────────
export function useTenantComparisonViewModel(days: number = 30) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.loginActivity(days),
            queryFn: () => repo.getLoginActivity(days),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

// ─── Orchestrator ────────────────────────────────────────────────────
export function useTenantAnalyticsViewModel() {
      const metrics = useTenantMetricsViewModel();
      const distribution = useAdminDistributionViewModel();
      const comparison = useTenantComparisonViewModel(30);

      const isLoading = useMemo(() =>
            metrics.isLoading || distribution.isLoading,
            [metrics.isLoading, distribution.isLoading]);

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
      };
}
