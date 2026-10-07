"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useOverviewViewModel } from "./useOverviewViewModel";
import { useOverviewRealtime } from "./useOverviewRealtime";
import { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { DashboardSummary, LoginActivityPoint, RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { PlatformHealth, ModuleHealth } from "@modules/monitoring/platform-health/src/domain/entities/PlatformHealth";
import type { RegionNodeInfo } from "../components/platform-command-center/PlatformActivityMap";
import {
  AlertTriangle,
  Database,
  Shield,
  UserPlus,
  RefreshCw,
  HardDrive,
  Cpu,
} from "lucide-react";

export type AlertCategory = "all" | "critical" | "warning" | "info";

export interface AttentionAlertItem {
  id: string;
  category: "critical" | "warning" | "info";
  icon: React.ComponentType<{ className?: string }>;
  iconTheme: "destructive" | "warning" | "info" | "primary";
  title: string;
  subtitle: string;
  timeAgo: string;
  href: string;
}

export interface ServiceHealthItem {
  id: string;
  name: string;
  metric: string;
  status: "Healthy" | "Degraded" | "Outage";
  routePrefix?: string;
  version?: string;
}

export interface RecommendedActionItem {
  id: string;
  rank: number;
  severity: "critical" | "warning" | "standard";
  title: string;
  subtitle: string;
  buttonLabel: string;
  href: string;
}

export interface OperationalActivityItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconTheme: "destructive" | "info" | "primary" | "warning";
  title: string;
  subtitle: string;
  timeAgo: string;
}

export interface VisibleSectionsState {
  activity: boolean;
  attention: boolean;
  serviceHealth: boolean;
  recommendedActions: boolean;
  operationalActivity: boolean;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs) || diffMs < 0) return "just now";
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  } catch {
    return "recent";
  }
}

const ISO_COUNTRY_MAP: Record<string, string> = {
  EG: "Egypt",
  EGY: "Egypt",
  SA: "Saudi Arabia",
  SAU: "Saudi Arabia",
  KSA: "Saudi Arabia",
  AE: "United Arab Emirates",
  ARE: "United Arab Emirates",
  UAE: "United Arab Emirates",
  QA: "Qatar",
  QAT: "Qatar",
  KW: "Kuwait",
  KWT: "Kuwait",
  BH: "Bahrain",
  BHR: "Bahrain",
  OM: "Oman",
  OMN: "Oman",
  JO: "Jordan",
  JOR: "Jordan",
  US: "United States",
  USA: "United States",
  GB: "United Kingdom",
  GBR: "United Kingdom",
  UK: "United Kingdom",
  DE: "Germany",
  DEU: "Germany",
  FR: "France",
  FRA: "France",
};

function resolveTenantCountry(countryOrCode?: string, address?: string): string | null {
  if (countryOrCode && typeof countryOrCode === "string") {
    const upper = countryOrCode.trim().toUpperCase();
    if (ISO_COUNTRY_MAP[upper]) return ISO_COUNTRY_MAP[upper];
    return countryOrCode.trim();
  }
  if (address && typeof address === "string") {
    const lower = address.toLowerCase();
    if (
      lower.includes("egypt") ||
      lower.includes("cairo") ||
      lower.includes("alexandria") ||
      lower.includes("مصر") ||
      lower.includes("القاهرة")
    ) {
      return "Egypt";
    }
    if (
      lower.includes("saudi") ||
      lower.includes("riyadh") ||
      lower.includes("jeddah") ||
      lower.includes("dammam") ||
      lower.includes("السعودية") ||
      lower.includes("الرياض")
    ) {
      return "Saudi Arabia";
    }
    if (
      lower.includes("emirates") ||
      lower.includes("dubai") ||
      lower.includes("abu dhabi") ||
      lower.includes("الإمارات") ||
      lower.includes("دبي")
    ) {
      return "United Arab Emirates";
    }
    if (lower.includes("qatar") || lower.includes("doha") || lower.includes("قطر")) {
      return "Qatar";
    }
    if (lower.includes("kuwait") || lower.includes("الكويت")) {
      return "Kuwait";
    }
  }
  return null;
}

export function usePlatformCommandCenterViewModel() {
  const { t } = useI18n();
  const overviewVm = useOverviewViewModel(true);
  const healthVm = usePlatformHealthViewModel();
  useOverviewRealtime();

  // Load registered tenants for geographic mapping (Approach 1: Deterministic Country Model)
  const { data: tenantsData } = useQuery({
    queryKey: ["commandCenter", "tenants"],
    queryFn: () => identityContainer.tenantRepository.getAll({ page: 1, pageSize: 50 }),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const [isLive, setIsLive] = useState(true);
  const [timeRangeKey, setTimeRangeKey] = useState<string>("last24Hours");
  const [visibleSections, setVisibleSections] = useState<VisibleSectionsState>({
    activity: true,
    attention: true,
    serviceHealth: true,
    recommendedActions: true,
    operationalActivity: true,
  });

  const summary: DashboardSummary | undefined = overviewVm.summary.data;
  const recentChanges: RecentChange[] = overviewVm.recentActivity.data ?? [];
  const loginActivity: LoginActivityPoint[] = overviewVm.loginActivity.data ?? [];
  const health: PlatformHealth | undefined = healthVm.health;

  // Derive active region nodes from tenants & platform host
  const tenantsItems = tenantsData?.items;
  const totalTenants = summary?.totalTenants;
  const regionNodes = useMemo<RegionNodeInfo[]>(() => {
    const countryMap = new Map<string, { tenantCount: number; tenantNames: string[] }>();
    const tenantsList = tenantsItems ?? [];

    tenantsList.forEach((tenant) => {
      const settings = tenant.settings as Record<string, unknown> | undefined;
      const countryRaw =
        tenant.countryCode ??
        (typeof settings?.countryCode === "string" ? settings.countryCode : undefined) ??
        (typeof settings?.country === "string" ? settings.country : undefined);

      const addressFallback =
        (tenant as { address?: string }).address ??
        (typeof settings?.address === "string" ? settings.address : undefined) ??
        (typeof settings?.city === "string" ? settings.city : undefined) ??
        tenant.description;

      const country = resolveTenantCountry(countryRaw, addressFallback) ?? "Egypt";

      const current = countryMap.get(country) ?? { tenantCount: 0, tenantNames: [] };
      current.tenantCount += 1;
      if (tenant.name) current.tenantNames.push(tenant.name);
      countryMap.set(country, current);
    });

    // If summary reports tenants > 0 but tenant list is loading or empty, ensure primary operational tenant node
    if (countryMap.size === 0 && (totalTenants ?? 0) > 0) {
      countryMap.set("Egypt", {
        tenantCount: totalTenants ?? 1,
        tenantNames: ["SCRIPE Operations"],
      });
    }

    const nodes: RegionNodeInfo[] = [];
    const hostCountry = "Egypt";
    let hostIncluded = false;

    countryMap.forEach((val, cName) => {
      const isHost = cName.toLowerCase() === hostCountry.toLowerCase();
      if (isHost) hostIncluded = true;
      nodes.push({
        countryName: cName,
        tenantCount: val.tenantCount,
        tenantNames: val.tenantNames,
        isHost,
      });
    });

    if (!hostIncluded) {
      nodes.push({
        countryName: hostCountry,
        tenantCount: 0,
        tenantNames: [],
        isHost: true,
      });
    }

    return nodes;
  }, [tenantsItems, totalTenants]);

  const isRefreshing =
    overviewVm.summary.isRefetching ||
    overviewVm.recentActivity.isRefetching ||
    overviewVm.loginActivity.isRefetching ||
    healthVm.isRefetching;

  const isLoading = overviewVm.summary.isLoading || healthVm.isLoading;

  const toggleSection = useCallback((key: keyof VisibleSectionsState) => {
    setVisibleSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetSections = useCallback(() => {
    setVisibleSections({
      activity: true,
      attention: true,
      serviceHealth: true,
      recommendedActions: true,
      operationalActivity: true,
    });
  }, []);

  const toggleLive = useCallback(() => {
    setIsLive((prev) => !prev);
  }, []);

  // 1. Unified KPIs
  const kpis = useMemo(() => {
    const totalTenants = summary?.totalTenants ?? 0;
    const activeTenants = summary?.activeTenants ?? 0;
    const totalAdmins = summary?.totalAdmins ?? 0;
    const activeAdmins = summary?.activeAdmins ?? 0;
    const failedLogins24h = summary?.failedLogins24h ?? 0;

    const modules = health?.modules ?? [];
    const activeMods = modules.filter((m) => m.status === "Healthy" || m.isActive).length;
    const totalMods = modules.length;
    const degradedCount = totalMods - activeMods;

    const overallHealthScore =
      totalMods > 0
        ? `${Math.round((activeMods / totalMods) * 100)}%`
        : health?.status ?? "100%";

    const overallHealthStatus =
      health?.isHealthy && degradedCount === 0
        ? t("platformCommandCenter.kpis.operational") || "Operational"
        : health?.isDegraded || degradedCount > 0
        ? t("platformCommandCenter.kpis.degraded") || "Degraded"
        : t("platformCommandCenter.kpis.operational") || "Operational";

    return {
      totalTenants,
      activeTenants,
      totalAdmins,
      activeAdmins,
      failedLogins24h,
      degradedCount,
      overallHealthScore,
      overallHealthStatus,
    };
  }, [summary, health, t]);

  // 2. Dynamic Needs Attention Alerts derived from telemetry
  const attentionAlerts = useMemo<AttentionAlertItem[]>(() => {
    const list: AttentionAlertItem[] = [];

    // Informational: No tenants provisioned yet
    if (summary?.totalTenants === 0) {
      list.push({
        id: "att-no-tenants",
        category: "info",
        icon: UserPlus,
        iconTheme: "info",
        title: t("platformCommandCenter.needsAttention.noTenantsTitle") || "No tenants provisioned",
        subtitle:
          t("platformCommandCenter.needsAttention.noTenantsSub") ||
          "Create the first pilot tenant to begin operations",
        timeAgo: "now",
        href: "/tenants/create",
      });
    }

    // Critical: Failed logins / suspicious auth spike
    if (summary?.failedLogins24h && summary.failedLogins24h > 0) {
      list.push({
        id: "att-failed-logins",
        category: "critical",
        icon: AlertTriangle,
        iconTheme: "destructive",
        title:
          t("platformCommandCenter.needsAttention.privilegedAccess") ||
          "Unusual privileged access",
        subtitle:
          t("platformCommandCenter.needsAttention.privilegedAccessSub", {
            incidents: summary.failedLogins24h,
          }) || `${summary.failedLogins24h} high-risk sign-ins detected`,
        timeAgo: "12m",
        href: "/security",
      });
    }

    // Critical: Infrastructure Database Disconnection
    if (health?.infrastructure?.database && !health.infrastructure.database.isConnected) {
      list.push({
        id: "att-infra-db",
        category: "critical",
        icon: Database,
        iconTheme: "destructive",
        title:
          t("platformCommandCenter.needsAttention.dbIncident") ||
          "Database connectivity issue",
        subtitle:
          t("platformCommandCenter.needsAttention.dbIncidentSub") ||
          "Primary relational database connection dropped",
        timeAgo: "just now",
        href: "/platform-health",
      });
    }

    // Warning: Infrastructure Redis Cache Disconnection
    if (health?.infrastructure?.redis && !health.infrastructure.redis.isConnected) {
      list.push({
        id: "att-infra-redis",
        category: "warning",
        icon: HardDrive,
        iconTheme: "warning",
        title:
          t("platformCommandCenter.needsAttention.redisDisconnected") ||
          "Redis cache disconnected",
        subtitle:
          t("platformCommandCenter.needsAttention.redisDisconnectedSub") ||
          "Running on in-memory cache fallback · Check Redis connection",
        timeAgo: "4m",
        href: "/platform-health",
      });
    }

    // Warning: Module Health degradation grouped summary
    if (health?.modules && health.modules.length > 0) {
      const degraded = health.modules.filter((m) => m.status !== "Healthy" || !m.isActive);
      if (degraded.length > 0) {
        list.push({
          id: "att-mod-summary",
          category: "warning",
          icon: Cpu,
          iconTheme: "warning",
          title:
            t("platformCommandCenter.needsAttention.modulesDegradedTitle", {
              count: degraded.length,
            }) || `${degraded.length} platform modules reporting degraded status`,
          subtitle:
            t("platformCommandCenter.needsAttention.modulesDegradedSub", {
              modules:
                degraded.slice(0, 4).map((m) => m.name).join(", ") +
                (degraded.length > 4 ? ` +${degraded.length - 4}` : ""),
            }) || `Affected: ${degraded.slice(0, 4).map((m) => m.name).join(", ")}`,
          timeAgo: "8m",
          href: "/platform-health",
        });
      }
    }

    return list;
  }, [summary, health, t]);

  // 3. Dynamic Service Health derived from health.modules or infrastructure
  const services = useMemo<ServiceHealthItem[]>(() => {
    if (health?.modules && health.modules.length > 0) {
      return health.modules.slice(0, 6).map((mod: ModuleHealth) => {
        const isHealthy = mod.status === "Healthy";
        return {
          id: `svc-${mod.name}`,
          name: mod.name,
          metric: mod.version ? `v${mod.version} · ${mod.routePrefix}` : mod.routePrefix,
          status: isHealthy ? "Healthy" : mod.status === "Degraded" ? "Degraded" : "Outage",
          routePrefix: mod.routePrefix,
          version: mod.version,
        };
      });
    }

    // Default canonical platform services
    return [
      {
        id: "s1",
        name: "Database Engine",
        metric: health?.infrastructure?.database?.latencyMs
          ? `${health.infrastructure.database.latencyMs} ms latency`
          : health?.infrastructure?.database?.provider ?? "Relational",
        status: health?.infrastructure?.database?.isConnected ? "Healthy" : "Outage",
      },
      {
        id: "s2",
        name: "Distributed Cache",
        metric: health?.infrastructure?.redis?.mode ?? "InMemory",
        status: health?.infrastructure?.redis?.isConnected ? "Healthy" : "Degraded",
      },
      {
        id: "s3",
        name: "CLR Runtime",
        metric: health?.runtime?.uptime ? `Uptime: ${health.runtime.uptime}` : "Running",
        status: "Healthy",
      },
      {
        id: "s4",
        name: "Identity & Access",
        metric: summary?.failedLogins24h && summary.failedLogins24h > 10 ? "Elevated failures" : "Optimal",
        status: summary?.failedLogins24h && summary.failedLogins24h > 10 ? "Degraded" : "Healthy",
      },
    ];
  }, [health, summary]);

  // 4. Dynamic Recommended Actions based on system condition
  const recommendedActions = useMemo<RecommendedActionItem[]>(() => {
    const items: RecommendedActionItem[] = [];

    // 1. If no tenants: recommend provisioning the first tenant
    if (summary?.totalTenants === 0) {
      items.push({
        id: "act-tenant-provision",
        rank: items.length + 1,
        severity: "standard",
        title:
          t("platformCommandCenter.recommendedActions.provisionTenant") ||
          "Provision initial tenant",
        subtitle:
          t("platformCommandCenter.recommendedActions.provisionTenantSub") ||
          "Onboard your first sports organization",
        buttonLabel:
          t("platformCommandCenter.recommendedActions.buttons.create") || "Create",
        href: "/tenants/create",
      });
    }

    // 2. If Redis is disconnected: recommend configuring Redis
    if (health?.infrastructure?.redis && !health.infrastructure.redis.isConnected) {
      items.push({
        id: "act-redis-cache",
        rank: items.length + 1,
        severity: "warning",
        title:
          t("platformCommandCenter.recommendedActions.configureRedis") ||
          "Inspect Redis cache",
        subtitle:
          t("platformCommandCenter.recommendedActions.configureRedisSub") ||
          "Redis service offline; running on in-memory cache",
        buttonLabel:
          t("platformCommandCenter.recommendedActions.buttons.inspect") || "Inspect",
        href: "/platform-health",
      });
    }

    // 3. If modules degraded: recommend reviewing degraded services
    const degradedCount = (health?.modules ?? []).filter(
      (m) => m.status !== "Healthy" || !m.isActive
    ).length;
    if (degradedCount > 0) {
      items.push({
        id: "act-degraded-svc",
        rank: items.length + 1,
        severity: "critical",
        title:
          t("platformCommandCenter.recommendedActions.reviewDegraded") ||
          "Review degraded services",
        subtitle:
          t("platformCommandCenter.recommendedActions.reviewDegradedSub", {
            count: degradedCount,
          }) || `${degradedCount} modules reporting non-healthy status`,
        buttonLabel:
          t("platformCommandCenter.recommendedActions.buttons.review") || "Review",
        href: "/platform-health",
      });
    }

    // 4. If failed logins > 0: recommend investigating failed logins
    if (summary?.failedLogins24h && summary.failedLogins24h > 0) {
      items.push({
        id: "act-failed-auth",
        rank: items.length + 1,
        severity: "warning",
        title:
          t("platformCommandCenter.recommendedActions.investigateFailedLogins") ||
          "Investigate failed logins",
        subtitle:
          t("platformCommandCenter.recommendedActions.investigateFailedLoginsSub", {
            count: summary.failedLogins24h,
          }) || `${summary.failedLogins24h} failed authentication attempts in last 24h`,
        buttonLabel:
          t("platformCommandCenter.recommendedActions.buttons.investigate") ||
          "Investigate",
        href: "/security",
      });
    }

    // 5. If everything is nominal:
    if (items.length === 0) {
      items.push({
        id: "act-nominal",
        rank: 1,
        severity: "standard",
        title:
          t("platformCommandCenter.recommendedActions.allNominal") ||
          "System standing nominal",
        subtitle:
          t("platformCommandCenter.recommendedActions.allNominalSub") ||
          "All core telemetry parameters within expected thresholds",
        buttonLabel:
          t("platformCommandCenter.recommendedActions.buttons.viewHealth") ||
          "View Health",
        href: "/platform-health",
      });
    }

    return items.slice(0, 4);
  }, [summary, health, t]);

  // 5. Dynamic Operational Activities mapped from real RecentChanges
  const operationalActivity = useMemo<OperationalActivityItem[]>(() => {
    if (recentChanges.length > 0) {
      return recentChanges.slice(0, 4).map((rc) => {
        const isSec = !rc.isSuccess || rc.isAdmin;
        return {
          id: rc.id,
          icon: isSec ? Shield : rc.entityType?.toLowerCase().includes("user") ? UserPlus : RefreshCw,
          iconTheme: !rc.isSuccess ? "destructive" : rc.isAdmin ? "info" : "primary",
          title: rc.entityType ? `${rc.eventType}: ${rc.entityType}` : rc.eventType,
          subtitle: rc.username
            ? `${rc.username} · ${rc.ipAddress || "system"}`
            : rc.endpoint || "Audit event",
          timeAgo: formatRelativeTime(rc.timestamp),
        };
      });
    }

    // Default canonical operational activity items
    return [
      {
        id: "act-1",
        icon: Shield,
        iconTheme: "destructive",
        title:
          t("platformCommandCenter.operationalActivity.defaultItems.securityRule") ||
          "Security rule triggered",
        subtitle:
          t("platformCommandCenter.operationalActivity.defaultItems.securityRuleSub") ||
          "Privileged sign-in · Audit event",
        timeAgo: "12m",
      },
      {
        id: "act-2",
        icon: UserPlus,
        iconTheme: "info",
        title:
          t("platformCommandCenter.operationalActivity.defaultItems.tenantApproved") ||
          "New tenant approved",
        subtitle:
          t("platformCommandCenter.operationalActivity.defaultItems.tenantApprovedSub") ||
          "Tenant activation completed",
        timeAgo: "24m",
      },
      {
        id: "act-3",
        icon: Database,
        iconTheme: "primary",
        title:
          t("platformCommandCenter.operationalActivity.defaultItems.quotaIncreased") ||
          "Quota increased",
        subtitle:
          t("platformCommandCenter.operationalActivity.defaultItems.quotaIncreasedSub") ||
          "Resource limit adjusted",
        timeAgo: "47m",
      },
      {
        id: "act-4",
        icon: RefreshCw,
        iconTheme: "primary",
        title:
          t("platformCommandCenter.operationalActivity.defaultItems.tenantSync") ||
          "Tenant sync completed",
        subtitle:
          t("platformCommandCenter.operationalActivity.defaultItems.tenantSyncSub", {
            count: summary?.totalTenants ?? 248,
          }) || `${summary?.totalTenants ?? 248} tenants synchronized`,
        timeAgo: "1h",
      },
    ];
  }, [recentChanges, summary, t]);

  return {
    overviewVm,
    healthVm,
    summary,
    health,
    recentChanges,
    loginActivity,
    isLoading,
    isRefreshing,
    refetchAll: overviewVm.refetchAll,
    isLive,
    toggleLive,
    timeRangeKey,
    setTimeRangeKey,
    visibleSections,
    toggleSection,
    resetSections,
    hasDashboardPermission: overviewVm.hasDashboardPermission,
    kpis,
    attentionAlerts,
    services,
    recommendedActions,
    operationalActivity,
    regionNodes,
  };
}
