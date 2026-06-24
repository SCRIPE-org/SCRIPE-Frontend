/**
 * useCommissionDashboardViewModel
 * Fetches platform-wide commission KPIs, trend data, and top tenants.
 */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";

/**
 * Exported type defining parameters and fields for trend period configurations.
 */
export type TrendPeriod = 30 | 90 | 365;

/**
 * React hook/ViewModel orchestrating state and data flows for commission dashboard view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useCommissionDashboardViewModel() {
  const { connectRepository } = entitlementsContainer;

  // ── Period filter ─────────────────────────────────────────────────────────
  const [trendDays, setTrendDays] = useState<TrendPeriod>(30);
  const [topN] = useState(10);

  // ── Dashboard KPIs ────────────────────────────────────────────────────────
  const dashboardQuery = useQuery({
    queryKey: ["entitlements", "commissions", "dashboard"],
    queryFn: () => connectRepository.getDashboard(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // ── Trend chart data ──────────────────────────────────────────────────────
  const trendsQuery = useQuery({
    queryKey: ["entitlements", "commissions", "trends", trendDays],
    queryFn: () => connectRepository.getTrends(trendDays),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // ── Top tenants ───────────────────────────────────────────────────────────
  const topTenantsQuery = useQuery({
    queryKey: ["entitlements", "commissions", "top-tenants", topN],
    queryFn: () => connectRepository.getTopTenants(topN),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const isLoading = dashboardQuery.isLoading || trendsQuery.isLoading || topTenantsQuery.isLoading;

  return {
    // KPI data
    dashboard: dashboardQuery.data ?? null,
    isDashboardLoading: dashboardQuery.isLoading,
    isDashboardError: dashboardQuery.isError,

    // Trend chart
    trends: trendsQuery.data ?? [],
    isTrendsLoading: trendsQuery.isLoading,
    trendDays,
    setTrendDays,

    // Top tenants
    topTenants: topTenantsQuery.data ?? [],
    isTopTenantsLoading: topTenantsQuery.isLoading,
    topN,

    // Global
    isLoading,
  };
}
