"use client";

/**
 * Dashboard ViewModel (Orchestrator)
 *
 * Composes all section ViewModels for the dashboard page.
 * Follows SOLID pattern: each concern has its own hook.
 *
 * All query keys include tenantId so TanStack Query caches
 * system-level and tenant-scoped data separately.
 */
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getSystemContainer } from "@modules/system/di";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";

// ─── Query key factory ───────────────────────────────────────────────
// Every key includes tenantId so caching is tenant-aware
export const dashboardKeys = {
  all: (tenantId: string | null) => ["dashboard", tenantId ?? "system"] as const,
  summary: (tenantId: string | null) =>
    [...dashboardKeys.all(tenantId), "summary"] as const,
  loginActivity: (days: number, tenantId: string | null) =>
    [...dashboardKeys.all(tenantId), "login-activity", days] as const,
  recentChanges: (limit: number, tenantId: string | null) =>
    [...dashboardKeys.all(tenantId), "recent-changes", limit] as const,
  eventDistribution: (days: number, tenantId: string | null) =>
    [...dashboardKeys.all(tenantId), "event-distribution", days] as const,
  securityEvents: (days: number, tenantId: string | null) =>
    [...dashboardKeys.all(tenantId), "security-events", days] as const,
  topBlockedIPs: (days: number, limit: number, tenantId: string | null) =>
    [...dashboardKeys.all(tenantId), "blocked-ips", days, limit] as const,
};

// ─── Section Hooks ───────────────────────────────────────────────────

/** KPI Summary Hook */
export function useDashboardSummary(tenantId: string | null) {
  const repo = getSystemContainer().dashboardRepository;

  return useQuery({
    queryKey: dashboardKeys.summary(tenantId),
    queryFn: () => repo.getSummary(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/** Login Activity Chart Hook */
export function useLoginActivity(days: number = 30, tenantId: string | null = null) {
  const repo = getSystemContainer().dashboardRepository;

  return useQuery({
    queryKey: dashboardKeys.loginActivity(days, tenantId),
    queryFn: () => repo.getLoginActivity(days),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/** Recent Changes Hook */
export function useRecentChanges(limit: number = 10, tenantId: string | null = null) {
  const repo = getSystemContainer().dashboardRepository;

  return useQuery({
    queryKey: dashboardKeys.recentChanges(limit, tenantId),
    queryFn: () => repo.getRecentChanges(limit),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/** Event Distribution Hook */
export function useEventDistribution(days: number = 30, tenantId: string | null = null) {
  const repo = getSystemContainer().dashboardRepository;

  return useQuery({
    queryKey: dashboardKeys.eventDistribution(days, tenantId),
    queryFn: () => repo.getEventDistribution(days),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/** Security Events Hook */
export function useSecurityEvents(days: number = 7, enabled = true, tenantId: string | null = null) {
  const repo = getSystemContainer().dashboardRepository;

  return useQuery({
    queryKey: dashboardKeys.securityEvents(days, tenantId),
    queryFn: () => repo.getSecurityEvents(days),
    enabled,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/** Top Blocked IPs Hook */
export function useTopBlockedIPs(days: number = 30, limit: number = 10, enabled = true, tenantId: string | null = null) {
  const repo = getSystemContainer().dashboardRepository;

  return useQuery({
    queryKey: dashboardKeys.topBlockedIPs(days, limit, tenantId),
    queryFn: () => repo.getTopBlockedIPs(days, limit),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ─── Orchestrator ────────────────────────────────────────────────────

/**
 * Dashboard Page ViewModel (Orchestrator)
 *
 * @param hasSecurityPermission — set to false to disable security API calls
 */
export function useDashboardViewModel(hasSecurityPermission = true) {
  const tenantId = useCurrentTenantId();
  const summary = useDashboardSummary(tenantId);
  const loginActivity = useLoginActivity(30, tenantId);
  const recentChanges = useRecentChanges(10, tenantId);
  const eventDistribution = useEventDistribution(30, tenantId);
  const securityEvents = useSecurityEvents(7, hasSecurityPermission, tenantId);
  const topBlockedIPs = useTopBlockedIPs(30, 10, hasSecurityPermission, tenantId);

  const isLoading = useMemo(
    () => summary.isLoading || loginActivity.isLoading || recentChanges.isLoading,
    [summary.isLoading, loginActivity.isLoading, recentChanges.isLoading]
  );

  const hasError = useMemo(
    () =>
      summary.isError ||
      loginActivity.isError ||
      recentChanges.isError ||
      eventDistribution.isError ||
      securityEvents.isError ||
      topBlockedIPs.isError,
    [
      summary.isError,
      loginActivity.isError,
      recentChanges.isError,
      eventDistribution.isError,
      securityEvents.isError,
      topBlockedIPs.isError,
    ]
  );

  const refetchAll = useCallback(() => {
    summary.refetch();
    loginActivity.refetch();
    recentChanges.refetch();
    eventDistribution.refetch();
    securityEvents.refetch();
    topBlockedIPs.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    summary.refetch,
    loginActivity.refetch,
    recentChanges.refetch,
    eventDistribution.refetch,
    securityEvents.refetch,
    topBlockedIPs.refetch,
  ]);

  return {
    summary,
    loginActivity,
    recentChanges,
    eventDistribution,
    securityEvents,
    topBlockedIPs,
    isLoading,
    hasError,
    hasSecurityPermission,
    refetchAll,
  };
}

