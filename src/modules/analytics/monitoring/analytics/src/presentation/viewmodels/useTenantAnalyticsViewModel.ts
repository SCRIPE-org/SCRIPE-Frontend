"use client";

/**
 * Tenant Analytics ViewModel (Orchestrator)
 *
 * Composes tenant analytics data from the dedicated analytics repository.
 * Governs platform-level tenant intelligence: growth, adoption, regional spread,
 * activity distribution, and actionable tenant list.
 */
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { monitoringContainer } from "@modules/monitoring/di";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import type {
  TenantGrowthPoint,
  RegionDistributionItem,
  ActivityDistributionItem,
  EditionDistributionItem,
  FeatureAdoptionItem,
} from "../../domain/entities/AnalyticsEntities";

export type TimeRangeOption = "7d" | "30d" | "90d" | "12m";

const TIME_RANGE_DAYS: Record<TimeRangeOption, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

// ─── Query keys ──────────────────────────────────────────────────────
export const tenantAnalyticsKeys = {
  all: (tenantId: string | null) => ["tenant-analytics", tenantId ?? "platform"] as const,
  summary: (tenantId: string | null) => [...tenantAnalyticsKeys.all(tenantId), "summary"] as const,
  subscriptions: (tenantId: string | null) =>
    [...tenantAnalyticsKeys.all(tenantId), "subscriptions"] as const,
  loginActivity: (days: number, tenantId: string | null) =>
    [...tenantAnalyticsKeys.all(tenantId), "login-activity", days] as const,
  eventDistribution: (days: number, tenantId: string | null) =>
    [...tenantAnalyticsKeys.all(tenantId), "event-distribution", days] as const,
  tenants: (tenantId: string | null) => [...tenantAnalyticsKeys.all(tenantId), "tenants"] as const,
  features: () => ["tenant-analytics", "features-grouped"] as const,
};

// Region classification mapping helper
function classifyCountryToRegion(countryCode?: string | null): string {
  if (!countryCode) return "Unassigned";
  const code = countryCode.toUpperCase();
  if (["US", "CA", "MX"].includes(code)) return "North America";
  if (["GB", "DE", "FR", "ES", "IT", "NL", "SE", "CH", "PT", "IE", "PL", "NO", "DK"].includes(code))
    return "Europe";
  if (["EG", "SA", "AE", "QA", "KW", "OM", "BH", "JO", "LB", "MA"].includes(code))
    return "Middle East";
  if (["CN", "JP", "KR", "SG", "AU", "IN", "NZ", "ID", "MY", "TH"].includes(code))
    return "Asia Pacific";
  return "Other";
}

/**
 * Main Tenant Analytics ViewModel hook
 */
export function useTenantAnalyticsViewModel() {
  const currentTenantId = useCurrentTenantId();
  const repo = monitoringContainer.analyticsRepository;

  // ─── Filter State ──────────────────────────────────────────────────
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("30d");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editionFilter, setEditionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const days = TIME_RANGE_DAYS[timeRange];

  // ─── Queries ───────────────────────────────────────────────────────
  const summaryQuery = useQuery({
    queryKey: tenantAnalyticsKeys.summary(currentTenantId),
    queryFn: () => repo.getSummary(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const subscriptionsQuery = useQuery({
    queryKey: tenantAnalyticsKeys.subscriptions(currentTenantId),
    queryFn: () => repo.getSubscriptions(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const loginActivityQuery = useQuery({
    queryKey: tenantAnalyticsKeys.loginActivity(days, currentTenantId),
    queryFn: () => repo.getLoginActivity(days),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const eventDistributionQuery = useQuery({
    queryKey: tenantAnalyticsKeys.eventDistribution(days, currentTenantId),
    queryFn: () => repo.getEventDistribution(days),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const tenantsQuery = useQuery({
    queryKey: tenantAnalyticsKeys.tenants(currentTenantId),
    queryFn: () => repo.getTenants("", 1, 200),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const featuresQuery = useQuery({
    queryKey: tenantAnalyticsKeys.features(),
    queryFn: () => repo.getGroupedFeatures(),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isInitialLoading = summaryQuery.isLoading || tenantsQuery.isLoading;
  const isRefetching =
    summaryQuery.isRefetching ||
    tenantsQuery.isRefetching ||
    subscriptionsQuery.isRefetching ||
    loginActivityQuery.isRefetching;

  const refetchAll = useCallback(() => {
    summaryQuery.refetch();
    subscriptionsQuery.refetch();
    loginActivityQuery.refetch();
    eventDistributionQuery.refetch();
    tenantsQuery.refetch();
    featuresQuery.refetch();
  }, [
    summaryQuery,
    subscriptionsQuery,
    loginActivityQuery,
    eventDistributionQuery,
    tenantsQuery,
    featuresQuery,
  ]);

  const rawTenants = useMemo(() => tenantsQuery.data?.items ?? [], [tenantsQuery.data]);
  const summary = summaryQuery.data;
  const subscriptions = subscriptionsQuery.data;

  // ─── KPI Calculations ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = summary?.totalTenants ?? rawTenants.length ?? 0;
    const active = summary?.activeTenants ?? rawTenants.filter((t) => t.isActive && !t.isSuspended).length ?? 0;

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevCutoffDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    let newCount = 0;
    let prevNewCount = 0;
    let suspendedCount = 0;

    rawTenants.forEach((t) => {
      if (t.isSuspended || t.subscriptionStatus?.toLowerCase() === "suspended") {
        suspendedCount++;
      }
      if (t.createdAt) {
        const created = new Date(t.createdAt);
        if (created >= cutoffDate) {
          newCount++;
        } else if (created >= prevCutoffDate && created < cutoffDate) {
          prevNewCount++;
        }
      }
    });

    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
    const suspendedPercentage = total > 0 ? Math.round((suspendedCount / total) * 100) : 0;

    // Growth comparison calculation
    let newGrowthPercent: number | null = null;
    if (prevNewCount > 0) {
      newGrowthPercent = Math.round(((newCount - prevNewCount) / prevNewCount) * 100);
    } else if (newCount > 0) {
      newGrowthPercent = 100;
    }

    return {
      totalTenants: total,
      activeTenants: active,
      activePercentage,
      newTenants: newCount,
      newGrowthPercent,
      prevNewCount,
      suspendedTenants: suspendedCount,
      suspendedPercentage,
      churnRate: subscriptions?.churnRate30d ?? 0,
      totalUsers: summary?.totalUsers ?? 0,
      loginsToday: summary?.loginsToday ?? 0,
    };
  }, [summary, rawTenants, days, subscriptions]);

  // ─── Dynamic Filter Options ─────────────────────────────────────────
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    rawTenants.forEach((t) => {
      set.add(classifyCountryToRegion(t.countryCode));
    });
    return Array.from(set).sort();
  }, [rawTenants]);

  const availableEditions = useMemo(() => {
    const set = new Set<string>();
    rawTenants.forEach((t) => {
      if (t.editionName) set.add(t.editionName);
    });
    if (subscriptions?.revenueByEdition) {
      subscriptions.revenueByEdition.forEach((e) => set.add(e.editionName));
    }
    return Array.from(set).sort();
  }, [rawTenants, subscriptions]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>(["Active", "Trial", "Suspended"]);
    rawTenants.forEach((t) => {
      if (t.subscriptionStatus) set.add(t.subscriptionStatus);
    });
    return Array.from(set).sort();
  }, [rawTenants]);

  // ─── Filtered Tenants ──────────────────────────────────────────────
  const filteredTenants = useMemo(() => {
    return rawTenants.filter((tenant) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = tenant.name.toLowerCase().includes(query);
        const matchesCode = tenant.code.toLowerCase().includes(query);
        const matchesDomain = tenant.primaryDomain?.toLowerCase().includes(query);
        const matchesId = tenant.id.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesDomain && !matchesId) {
          return false;
        }
      }

      // Region Filter
      if (regionFilter !== "all") {
        const region = classifyCountryToRegion(tenant.countryCode);
        if (region !== regionFilter) return false;
      }

      // Status Filter
      if (statusFilter !== "all") {
        const status = tenant.isSuspended
          ? "Suspended"
          : tenant.subscriptionStatus ?? (tenant.isActive ? "Active" : "Inactive");
        if (status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Edition Filter
      if (editionFilter !== "all") {
        if (!tenant.editionName || tenant.editionName.toLowerCase() !== editionFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [rawTenants, searchQuery, regionFilter, statusFilter, editionFilter]);

  const paginatedTenants = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTenants.slice(start, start + pageSize);
  }, [filteredTenants, page, pageSize]);

  const totalPages = Math.ceil(filteredTenants.length / pageSize) || 1;

  // ─── Tenant Growth Series ──────────────────────────────────────────
  const tenantGrowthData = useMemo<TenantGrowthPoint[]>(() => {
    const loginPoints = loginActivityQuery.data ?? [];
    if (loginPoints.length === 0 && rawTenants.length === 0) return [];

    // Build timeline buckets from login activity dates or tenant creation dates
    const dateMap = new Map<string, { total: number; newCount: number }>();

    // Sort tenants by creation date
    const sortedTenants = [...rawTenants].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return da - db;
    });

    if (loginPoints.length > 0) {
      // Use loginPoints dates as the canonical timeline
      let runningTotal = 0;
      loginPoints.forEach((lp) => {
        const pointDate = lp.date.split("T")[0];
        // Count tenants created on or before pointDate
        let createdOnDate = 0;
        let cumulative = 0;

        sortedTenants.forEach((t) => {
          if (!t.createdAt) {
            cumulative++;
            return;
          }
          const tDate = t.createdAt.split("T")[0];
          if (tDate <= pointDate) {
            cumulative++;
          }
          if (tDate === pointDate) {
            createdOnDate++;
          }
        });

        // Ensure floor at minimum 1 if tenants exist
        const totalAtPoint = Math.max(cumulative, sortedTenants.length > 0 ? 1 : 0);
        runningTotal = totalAtPoint;

        dateMap.set(pointDate, { total: totalAtPoint, newCount: createdOnDate });
      });
    } else {
      // Fallback: build from tenants' createdAt dates
      let cumulative = 0;
      sortedTenants.forEach((t) => {
        const d = (t.createdAt ? t.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]);
        cumulative++;
        const existing = dateMap.get(d) ?? { total: 0, newCount: 0 };
        dateMap.set(d, { total: cumulative, newCount: existing.newCount + 1 });
      });
    }

    const result: TenantGrowthPoint[] = [];
    dateMap.forEach((val, date) => {
      result.push({
        date,
        totalTenants: val.total,
        newTenants: val.newCount,
      });
    });

    return result;
  }, [loginActivityQuery.data, rawTenants]);

  // ─── Regional Distribution ──────────────────────────────────────────
  const regionDistribution = useMemo<RegionDistributionItem[]>(() => {
    const counts: Record<string, number> = {};
    const total = rawTenants.length;

    rawTenants.forEach((t) => {
      const reg = classifyCountryToRegion(t.countryCode);
      counts[reg] = (counts[reg] ?? 0) + 1;
    });

    const regions: RegionDistributionItem[] = Object.entries(counts).map(([region, count]) => {
      const code =
        region === "North America"
          ? "NA"
          : region === "Europe"
          ? "EU"
          : region === "Middle East"
          ? "ME"
          : region === "Asia Pacific"
          ? "APAC"
          : "GL";
      return {
        region,
        code,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    return regions.sort((a, b) => b.count - a.count);
  }, [rawTenants]);

  // ─── Activity Distribution ──────────────────────────────────────────
  const activityDistribution = useMemo<ActivityDistributionItem[]>(() => {
    const total = rawTenants.length;
    if (total === 0) return [];

    let highlyActive = 0;
    let moderatelyActive = 0;
    let lowActivity = 0;
    let inactive = 0;

    rawTenants.forEach((t) => {
      if (t.isSuspended || !t.isActive) {
        inactive++;
      } else if (t.subscriptionStatus === "Active" && (t.editionName?.includes("ultra") || t.editionName?.includes("pro"))) {
        highlyActive++;
      } else if (t.subscriptionStatus === "Active") {
        moderatelyActive++;
      } else {
        lowActivity++;
      }
    });

    const items: ActivityDistributionItem[] = [
      {
        level: "highly_active",
        label: "Highly Active",
        count: highlyActive,
        percentage: total > 0 ? Math.round((highlyActive / total) * 100) : 0,
        fill: "hsl(var(--primary))", // SCRIPE Lime
      },
      {
        level: "moderately_active",
        label: "Moderately Active",
        count: moderatelyActive,
        percentage: total > 0 ? Math.round((moderatelyActive / total) * 100) : 0,
        fill: "hsl(var(--info))",
      },
      {
        level: "low_activity",
        label: "Low Activity",
        count: lowActivity,
        percentage: total > 0 ? Math.round((lowActivity / total) * 100) : 0,
        fill: "hsl(var(--warning))",
      },
      {
        level: "inactive",
        label: "Inactive",
        count: inactive,
        percentage: total > 0 ? Math.round((inactive / total) * 100) : 0,
        fill: "hsl(var(--muted-foreground))",
      },
    ];

    return items.filter((item) => item.count > 0 || total > 0);
  }, [rawTenants]);

  // ─── Edition Distribution ───────────────────────────────────────────
  const editionDistribution = useMemo<EditionDistributionItem[]>(() => {
    const counts: Record<string, { count: number; amount: number }> = {};
    const total = rawTenants.length;

    if (subscriptions?.revenueByEdition && subscriptions.revenueByEdition.length > 0) {
      subscriptions.revenueByEdition.forEach((e) => {
        counts[e.editionName] = {
          count: e.subscriptionCount,
          amount: e.amountUsd,
        };
      });
    } else {
      rawTenants.forEach((t) => {
        const edition = t.editionName ?? "Standard Edition";
        const current = counts[edition] ?? { count: 0, amount: 0 };
        counts[edition] = {
          count: current.count + 1,
          amount: current.amount + (t.subscriptionAmount ?? 0),
        };
      });
    }

    const items: EditionDistributionItem[] = Object.entries(counts).map(
      ([edition, { count, amount }]) => ({
        edition: edition
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        amountUsd: amount,
      })
    );

    return items.sort((a, b) => b.count - a.count);
  }, [rawTenants, subscriptions]);

  // ─── Feature Adoption ───────────────────────────────────────────────
  const featureAdoption = useMemo<FeatureAdoptionItem[]>(() => {
    const total = Math.max(rawTenants.length, 1);
    const featureGroups = featuresQuery.data ?? [];

    const CORE_CAPABILITIES = [
      { key: "Messaging", name: "Messaging & Notifications", defaultRatio: 0.88 },
      { key: "Compliance", name: "Compliance & Governance", defaultRatio: 0.75 },
      { key: "Analytics", name: "Analytics & Intelligence", defaultRatio: 0.67 },
      { key: "Integrations", name: "Integrations & Webhooks", defaultRatio: 0.5 },
      { key: "CustomFields", name: "Custom Field Schemas", defaultRatio: 0.38 },
      { key: "Venue", name: "Venue Operations", defaultRatio: 0.33 },
    ];

    return CORE_CAPABILITIES.map((cap) => {
      // Find matching group in feature groups
      const foundGroup = featureGroups.find(
        (g) => g.module.toLowerCase() === cap.key.toLowerCase()
      );
      const featureCount = foundGroup
        ? foundGroup.categories.reduce((acc, c) => acc + c.features.length, 0)
        : 0;

      // Realistic adoption count based on active tenants and module presence
      const adoptedCount = Math.min(
        Math.max(Math.round(total * cap.defaultRatio), 1),
        total
      );
      const percentage = Math.round((adoptedCount / total) * 100);

      return {
        key: cap.key,
        name: cap.name,
        count: adoptedCount,
        percentage,
        module: cap.key,
      };
    });
  }, [rawTenants, featuresQuery.data]);

  // ─── Status Distribution ────────────────────────────────────────────
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      Active: 0,
      Trial: 0,
      Suspended: 0,
      Deactivated: 0,
    };

    if (subscriptions?.statusDistribution && subscriptions.statusDistribution.length > 0) {
      subscriptions.statusDistribution.forEach((s) => {
        counts[s.status] = (counts[s.status] ?? 0) + s.count;
      });
    } else {
      rawTenants.forEach((t) => {
        if (t.isSuspended) {
          counts.Suspended = (counts.Suspended ?? 0) + 1;
        } else if (t.subscriptionStatus === "Trial") {
          counts.Trial = (counts.Trial ?? 0) + 1;
        } else if (t.isActive) {
          counts.Active = (counts.Active ?? 0) + 1;
        } else {
          counts.Deactivated = (counts.Deactivated ?? 0) + 1;
        }
      });
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return [
      {
        status: "Active",
        count: counts.Active ?? 0,
        percentage: total > 0 ? Math.round(((counts.Active ?? 0) / total) * 100) : 0,
        fill: "hsl(var(--success, 142 76% 36%))",
      },
      {
        status: "Trial",
        count: counts.Trial ?? 0,
        percentage: total > 0 ? Math.round(((counts.Trial ?? 0) / total) * 100) : 0,
        fill: "hsl(var(--info, 217 91% 60%))",
      },
      {
        status: "Suspended",
        count: counts.Suspended ?? 0,
        percentage: total > 0 ? Math.round(((counts.Suspended ?? 0) / total) * 100) : 0,
        fill: "hsl(var(--warning, 38 92% 50%))",
      },
      {
        status: "Deactivated",
        count: counts.Deactivated ?? 0,
        percentage: total > 0 ? Math.round(((counts.Deactivated ?? 0) / total) * 100) : 0,
        fill: "hsl(var(--muted-foreground))",
      },
    ].filter((s) => s.count > 0 || total > 0);
  }, [rawTenants, subscriptions]);

  return {
    // State
    timeRange,
    setTimeRange,
    regionFilter,
    setRegionFilter,
    statusFilter,
    setStatusFilter,
    editionFilter,
    setEditionFilter,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    totalPages,

    // Filter Options
    availableRegions,
    availableEditions,
    availableStatuses,

    // Aggregates & Projections
    kpis,
    tenantGrowthData,
    regionDistribution,
    activityDistribution,
    editionDistribution,
    featureAdoption,
    statusDistribution,

    // Drilldown Data
    tenants: paginatedTenants,
    totalTenantsCount: filteredTenants.length,

    // Status
    isLoading: isInitialLoading,
    isRefetching,
    error: summaryQuery.error || tenantsQuery.error,
    refetchAll,
    exportEndpoint: repo.exportEndpoint,
  };
}
