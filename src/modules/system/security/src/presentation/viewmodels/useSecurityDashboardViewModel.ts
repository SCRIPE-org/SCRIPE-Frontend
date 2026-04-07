"use client";

/**
 * Security Dashboard ViewModel (Orchestrator)
 *
 * Composes security-related data from the dedicated security repository.
 * NO LONGER borrows from dashboardRepository — uses its own securityRepository.
 * All query keys include tenantId for tenant-aware caching.
 */
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getSystemContainer } from "@modules/system/di";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";

// ─── Query key factory ───────────────────────────────────────────────
export const securityKeys = {
  all: (tenantId: string | null) => ["security", tenantId ?? "system"] as const,
  securityEvents: (days: number, tenantId: string | null) =>
    [...securityKeys.all(tenantId), "security-events", days] as const,
  loginActivity: (days: number, tenantId: string | null) =>
    [...securityKeys.all(tenantId), "login-activity", days] as const,
  topBlockedIPs: (days: number, limit: number, tenantId: string | null) =>
    [...securityKeys.all(tenantId), "blocked-ips", days, limit] as const,
  recentChanges: (limit: number, tenantId: string | null) =>
    [...securityKeys.all(tenantId), "recent-changes", limit] as const,
};

// ─── Threat Summary ViewModel ────────────────────────────────────────
export function useThreatSummaryViewModel(tenantId: string | null) {
  const repo = getSystemContainer().securityRepository;

  const securityEvents = useQuery({
    queryKey: securityKeys.securityEvents(7, tenantId),
    queryFn: () => repo.getSecurityEvents(7),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const threatCards = useMemo(() => {
    if (!securityEvents.data) return [];
    return securityEvents.data.map((e) => ({
      type: e.eventType,
      count: e.count,
    }));
  }, [securityEvents.data]);

  return {
    data: threatCards,
    isLoading: securityEvents.isLoading,
    error: securityEvents.error,
    refetch: securityEvents.refetch,
  };
}

// ─── Failed Logins Heatmap ViewModel ─────────────────────────────────
export function useFailedLoginsViewModel(days: number = 30, tenantId: string | null = null) {
  const repo = getSystemContainer().securityRepository;

  const query = useQuery({
    queryKey: securityKeys.loginActivity(days, tenantId),
    queryFn: () => repo.getLoginActivity(days),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const heatmapData = useMemo(() => {
    if (!query.data) return [];
    return query.data.map((point) => ({
      date: point.date,
      failed: point.failedCount,
      total: point.successCount + point.failedCount,
    }));
  }, [query.data]);

  return {
    data: heatmapData,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ─── Blocked IPs ViewModel ───────────────────────────────────────────
export function useBlockedIPsViewModel(days: number = 30, limit: number = 20, tenantId: string | null = null) {
  const repo = getSystemContainer().securityRepository;

  return useQuery({
    queryKey: securityKeys.topBlockedIPs(days, limit, tenantId),
    queryFn: () => repo.getTopBlockedIPs(days, limit),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ─── Security Timeline ViewModel ─────────────────────────────────────
export function useSecurityTimelineViewModel(limit: number = 20, tenantId: string | null = null) {
  const repo = getSystemContainer().securityRepository;

  return useQuery({
    queryKey: securityKeys.recentChanges(limit, tenantId),
    queryFn: () => repo.getRecentChanges(limit),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ─── Orchestrator ────────────────────────────────────────────────────
export function useSecurityDashboardViewModel() {
  const tenantId = useCurrentTenantId();
  const threats = useThreatSummaryViewModel(tenantId);
  const failedLogins = useFailedLoginsViewModel(30, tenantId);
  const blockedIPs = useBlockedIPsViewModel(30, 20, tenantId);
  const timeline = useSecurityTimelineViewModel(20, tenantId);

  const isLoading = useMemo(
    () => threats.isLoading || failedLogins.isLoading,
    [threats.isLoading, failedLogins.isLoading]
  );

  const refetchAll = useCallback(() => {
    threats.refetch();
    failedLogins.refetch();
    blockedIPs.refetch();
    timeline.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threats.refetch, failedLogins.refetch, blockedIPs.refetch, timeline.refetch]);

  return {
    threats,
    failedLogins,
    blockedIPs,
    timeline,
    isLoading,
    refetchAll,
  };
}
