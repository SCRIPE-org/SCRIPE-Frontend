"use client";

/**
 * Overview ViewModel (Orchestrator)
 *
 * Composes dashboard summary + recent changes for the Overview page.
 * Uses the shared system DI container to access dashboard repository.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { getSystemContainer } from "@modules/system/di";
import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";

// ─── Query Keys ──────────────────────────────────────────────────────
const overviewKeys = {
  summary: ["overview", "summary"] as const,
  recentActivity: ["overview", "recent-activity"] as const,
};

// ─── Sub-Hooks ───────────────────────────────────────────────────────

function useOverviewSummary(enabled: boolean) {
  const repo = getSystemContainer().dashboardRepository;
  return useQuery({
    queryKey: overviewKeys.summary,
    queryFn: () => repo.getSummary(),
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

function useOverviewRecentActivity(limit = 5, enabled = true) {
  const repo = getSystemContainer().dashboardRepository;
  return useQuery({
    queryKey: overviewKeys.recentActivity,
    queryFn: () => repo.getRecentChanges(limit),
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
  const summary = useOverviewSummary(hasDashboardPermission);
  const recentActivity = useOverviewRecentActivity(5, hasDashboardPermission);
  const { greeting, displayName } = useGreeting();

  const refetchAll = useCallback(() => {
    summary.refetch();
    recentActivity.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary.refetch, recentActivity.refetch]);

  return {
    greeting,
    displayName,
    summary,
    recentActivity,
    refetchAll,
    hasDashboardPermission,
  };
}
