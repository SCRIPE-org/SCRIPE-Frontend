'use client';

/**
 * Security Dashboard ViewModel (Orchestrator)
 *
 * Composes security-related data from the dashboard repository.
 * Reuses existing dashboard endpoints for security events, blocked IPs, and login activity.
 */
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getSystemContainer } from '@modules/system/di';
import { dashboardKeys } from '@modules/system/dashboard/src/presentation/viewmodels/useDashboardViewModel';

// ─── Threat Summary ViewModel ────────────────────────────────────────
export function useThreatSummaryViewModel() {
      const repo = getSystemContainer().dashboardRepository;

      const securityEvents = useQuery({
            queryKey: dashboardKeys.securityEvents(7),
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
export function useFailedLoginsViewModel(days: number = 30) {
      const repo = getSystemContainer().dashboardRepository;

      const query = useQuery({
            queryKey: dashboardKeys.loginActivity(days),
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
export function useBlockedIPsViewModel(days: number = 30, limit: number = 20) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.topBlockedIPs(days, limit),
            queryFn: () => repo.getTopBlockedIPs(days, limit),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

// ─── Security Timeline ViewModel ─────────────────────────────────────
export function useSecurityTimelineViewModel(limit: number = 20) {
      const repo = getSystemContainer().dashboardRepository;

      return useQuery({
            queryKey: dashboardKeys.recentChanges(limit),
            queryFn: () => repo.getRecentChanges(limit),
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
      });
}

// ─── Orchestrator ────────────────────────────────────────────────────
export function useSecurityDashboardViewModel() {
      const threats = useThreatSummaryViewModel();
      const failedLogins = useFailedLoginsViewModel(30);
      const blockedIPs = useBlockedIPsViewModel(30, 20);
      const timeline = useSecurityTimelineViewModel(20);

      const isLoading = useMemo(() =>
            threats.isLoading || failedLogins.isLoading,
            [threats.isLoading, failedLogins.isLoading]);

      const refetchAll = useCallback(() => {
            threats.refetch();
            failedLogins.refetch();
            blockedIPs.refetch();
            timeline.refetch();
      }, [threats, failedLogins, blockedIPs, timeline]);

      return {
            threats,
            failedLogins,
            blockedIPs,
            timeline,
            isLoading,
            refetchAll,
      };
}
