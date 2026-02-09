'use client';

/**
 * Dashboard ViewModel (Orchestrator)
 *
 * Composes all section ViewModels for the dashboard page.
 * Follows SOLID pattern: each concern has its own hook.
 */
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getSystemContainer } from '@modules/system/di';

// ─── Query key factory ───────────────────────────────────────────────
export const dashboardKeys = {
      all: ['dashboard'] as const,
      summary: () => [...dashboardKeys.all, 'summary'] as const,
      loginActivity: (days: number) => [...dashboardKeys.all, 'login-activity', days] as const,
      recentChanges: (limit: number) => [...dashboardKeys.all, 'recent-changes', limit] as const,
      eventDistribution: (days: number) => [...dashboardKeys.all, 'event-distribution', days] as const,
      securityEvents: (days: number) => [...dashboardKeys.all, 'security-events', days] as const,
      topBlockedIPs: (days: number, limit: number) => [...dashboardKeys.all, 'blocked-ips', days, limit] as const,
};

// ─── Section Hooks ───────────────────────────────────────────────────

/** KPI Summary Hook */
export function useDashboardSummary() {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.summary(),
            queryFn: () => repo.getSummary(),
            staleTime: 60 * 1000,
            refetchInterval: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

/** Login Activity Chart Hook */
export function useLoginActivity(days: number = 30) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.loginActivity(days),
            queryFn: () => repo.getLoginActivity(days),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

/** Recent Changes Hook */
export function useRecentChanges(limit: number = 10) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.recentChanges(limit),
            queryFn: () => repo.getRecentChanges(limit),
            staleTime: 30 * 1000,
            refetchInterval: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

/** Event Distribution Hook */
export function useEventDistribution(days: number = 30) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.eventDistribution(days),
            queryFn: () => repo.getEventDistribution(days),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

/** Security Events Hook */
export function useSecurityEvents(days: number = 7) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.securityEvents(days),
            queryFn: () => repo.getSecurityEvents(days),
            staleTime: 60 * 1000,
            refetchInterval: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

/** Top Blocked IPs Hook */
export function useTopBlockedIPs(days: number = 30, limit: number = 10) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.topBlockedIPs(days, limit),
            queryFn: () => repo.getTopBlockedIPs(days, limit),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

// ─── Orchestrator ────────────────────────────────────────────────────

/**
 * Dashboard Page ViewModel (Orchestrator)
 *
 * Composes all individual hooks into a single typed interface for the View.
 * Exposes data, loading, error, and refetch for each section.
 */
export function useDashboardViewModel() {
      const summary = useDashboardSummary();
      const loginActivity = useLoginActivity(30);
      const recentChanges = useRecentChanges(10);
      const eventDistribution = useEventDistribution(30);
      const securityEvents = useSecurityEvents(7);
      const topBlockedIPs = useTopBlockedIPs(30, 10);

      const isLoading = useMemo(() =>
            summary.isLoading ||
            loginActivity.isLoading ||
            recentChanges.isLoading,
            [summary.isLoading, loginActivity.isLoading, recentChanges.isLoading]);

      const hasError = useMemo(() =>
            summary.isError ||
            loginActivity.isError ||
            recentChanges.isError ||
            eventDistribution.isError ||
            securityEvents.isError ||
            topBlockedIPs.isError,
            [summary.isError, loginActivity.isError, recentChanges.isError, eventDistribution.isError, securityEvents.isError, topBlockedIPs.isError]);

      const refetchAll = useCallback(() => {
            summary.refetch();
            loginActivity.refetch();
            recentChanges.refetch();
            eventDistribution.refetch();
            securityEvents.refetch();
            topBlockedIPs.refetch();
      }, [summary, loginActivity, recentChanges, eventDistribution, securityEvents, topBlockedIPs]);

      return {
            summary,
            loginActivity,
            recentChanges,
            eventDistribution,
            securityEvents,
            topBlockedIPs,
            isLoading,
            hasError,
            refetchAll,
      };
}
