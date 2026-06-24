"use client";

/**
 * Overview ViewModel (Orchestrator)
 *
 * Composes dashboard summary + recent changes for the Overview page.
 * Uses the shared system DI container to access dashboard repository.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";

// ─── Query Keys ──────────────────────────────────────────────────────
// Include tenantContextId so TanStack Query caches separately per tenant
const overviewKeys = {
  summary: (tenantId: string | null) => ["overview", "summary", tenantId ?? "system"] as const,
  recentActivity: (tenantId: string | null) =>
    ["overview", "recent-activity", tenantId ?? "system"] as const,
};

// ─── Sub-Hooks ───────────────────────────────────────────────────────

function useOverviewSummary(enabled: boolean, tenantId: string | null) {
  return useQuery({
    queryKey: overviewKeys.summary(tenantId),
    queryFn: async () => {
      const { monitoringContainer } = await import("@modules/monitoring/di");
      return monitoringContainer.dashboardRepository.getSummary();
    },
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

function useOverviewRecentActivity(limit = 5, enabled = true, tenantId: string | null) {
  return useQuery({
    queryKey: overviewKeys.recentActivity(tenantId),
    queryFn: async () => {
      const { monitoringContainer } = await import("@modules/monitoring/di");
      return monitoringContainer.dashboardRepository.getRecentChanges(limit);
    },
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ─── Greeting Logic ──────────────────────────────────────────────────

function useGreeting() {
  const user = useAppStore((state) => state.user);
  const { t } = useI18n();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("overview.greeting.morning");
    if (hour < 18) return t("overview.greeting.afternoon");
    return t("overview.greeting.evening");
  }, [t]);

  const displayName = useMemo(() => {
    if (!user) return "";
    const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return full || user.username || "";
  }, [user]);

  return { greeting, displayName };
}

// ─── Orchestrator ────────────────────────────────────────────────────

/**
 * @param hasDashboardPermission — set to false to disable dashboard API calls
 */
export function useOverviewViewModel(hasDashboardPermission = true) {
  const tenantId = useCurrentTenantId();
  const summary = useOverviewSummary(hasDashboardPermission, tenantId);
  const recentActivity = useOverviewRecentActivity(5, hasDashboardPermission, tenantId);
  const { greeting, displayName } = useGreeting();

  const refetchAll = useCallback(() => {
    summary.refetch();
    recentActivity.refetch();
  }, [summary, recentActivity]);

  return {
    greeting,
    displayName,
    summary,
    recentActivity,
    refetchAll,
    hasDashboardPermission,
  };
}
