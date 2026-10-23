/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tenant Overview Mapper
 * Transforms raw backend telemetry DTOs into TenantOverviewData (< 180 lines).
 */
import type {
  DashboardSummary,
  RecentChange,
} from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { TenantStats } from "@modules/admin/identity/tenants/src/domain/interfaces/ITenantRepository";
import type { Tenant } from "@modules/admin/identity/tenants/src/domain/entities/Tenant";
import type {
  TenantOverviewData,
  TenantActivityItem,
  TenantAlertItem,
  TenantQuotaItem,
  TenantStepItem,
} from "../components/tenant-command-center/tenantTypes";

export interface BuildTenantLiveDataParams {
  summary?: DashboardSummary | null;
  stats?: TenantStats | null;
  details?: Tenant | null;
  recentActivity?: RecentChange[] | null;
  activeTenantName?: string | null;
  t: (key: string, params?: Record<string, any>) => string;
}

export function buildTenantOverviewLiveData({
  summary,
  stats,
  details,
  recentActivity,
  activeTenantName,
  t,
}: BuildTenantLiveDataParams): TenantOverviewData {
  const tenantName = activeTenantName || details?.name || "";
  const location = details?.countryCode || "";
  const planName = stats?.editionName || "";

  const hasAdminCount = summary?.totalAdmins != null || stats?.adminsCount != null;
  const totalAdmins = summary?.totalAdmins ?? stats?.adminsCount ?? 0;
  // Subtenants represent independent child tenant organizations, NOT branches or physical sites.
  // Physical locations (OrganizationCore.Site) are managed at /venue/sites.
  // Authoritative hierarchy: OrganizationCore.Branch -> OrganizationCore.Site -> VenueProfile -> Facility.
  // Site usage is not present in the tenant overview contracts yet. Keep its
  // numeric KPI neutral and render the quota as unavailable instead of
  // presenting a fabricated site count or plan capacity.
  const activeSitesCount = 0;
  const sitesCapacity = 0;
  const sitePercent = 0;

  const completedCount = [true, details != null, hasAdminCount && totalAdmins > 1].filter(
    Boolean
  ).length;
  const readinessPercent = Math.min(100, Math.round((completedCount / 3) * 100));

  const liveActivity: TenantActivityItem[] =
    recentActivity && recentActivity.length > 0
      ? recentActivity.slice(0, 5).map((log) => ({
          id: log.id,
          author: log.username || "Admin",
          avatarText: (log.username || "AD").slice(0, 2).toUpperCase(),
          action: log.entityType ? `${log.eventType}: ${log.entityType}` : log.eventType,
          timeAgo: t("tenantCommandCenter.activity.recent"),
        }))
      : [];

  const alerts: TenantAlertItem[] = [];
  if (summary && summary.failedLogins24h > 0) {
    alerts.push({
      id: "alt-failed-logins",
      title: t("tenantCommandCenter.attention.failedLoginsTitle"),
      description: t("tenantCommandCenter.attention.failedLoginsDesc", {
        count: summary.failedLogins24h,
      }),
      severity: "critical",
      href: "/audit",
    });
  }
  if (hasAdminCount && totalAdmins <= 1) {
    alerts.push({
      id: "alt-invite-team",
      title: t("tenantCommandCenter.attention.inviteTeamTitle"),
      description: t("tenantCommandCenter.attention.inviteTeamDesc"),
      severity: "warning",
      href: "/admins",
    });
  }

  const steps: TenantStepItem[] = [
    {
      id: 1,
      title: t("tenantCommandCenter.getStarted.steps.profile.title"),
      description: t("tenantCommandCenter.getStarted.steps.profile.desc"),
      status: "done",
    },
    {
      id: 2,
      title: t("tenantCommandCenter.getStarted.steps.branches.title"),
      description: t("tenantCommandCenter.getStarted.steps.branches.desc"),
      status: "current",
      actionLabel: t("tenantCommandCenter.getStarted.setUp"),
      href: "/venue/sites",
    },
    {
      id: 3,
      title: t("tenantCommandCenter.getStarted.steps.team.title"),
      description: t("tenantCommandCenter.getStarted.steps.team.desc"),
      status: hasAdminCount && totalAdmins > 1 ? "done" : "current",
      actionLabel: t("tenantCommandCenter.getStarted.start"),
      href: "/admins",
    },
  ];

  const staffPct = 0;
  const quotas: TenantQuotaItem[] = [
    {
      id: "staff",
      label: t("tenantCommandCenter.usage.staff"),
      current: hasAdminCount ? String(totalAdmins) : "—",
      total: "—",
      percent: staffPct,
      subLeft: "—",
      subRight: "—",
      color: "green",
    },
    {
      id: "sites",
      label: t("tenantCommandCenter.usage.sites"),
      current: "—",
      total: "—",
      percent: 0,
      subLeft: "—",
      subRight: "—",
      color: "blue",
    },
    {
      id: "storage",
      label: t("tenantCommandCenter.usage.storage"),
      current: "—",
      total: "—",
      percent: 0,
      subLeft: "—",
      subRight: "—",
      color: "violet",
    },
    {
      id: "api",
      label: t("tenantCommandCenter.usage.api"),
      current: "—",
      total: "—",
      percent: 0,
      subLeft: "—",
      subRight: "—",
      color: "amber",
    },
  ];

  return {
    tenantName,
    location,
    planName,
    readinessPercent,
    setupStepsCompleted: completedCount,
    setupStepsTotal: 3,
    metaPills: [
      ...(hasAdminCount
        ? [
            {
              label: t("tenantCommandCenter.hero.meta.admins", { count: totalAdmins }),
              icon: "admins",
            },
          ]
        : []),
      ...(planName ? [{ label: planName, icon: "plan" }] : []),
      { label: t("tenantCommandCenter.hero.checks.coreHealthy"), icon: "healthy" },
    ],
    readinessChecks: [
      { label: t("tenantCommandCenter.hero.checks.coreHealthy"), status: "success" },
      {
        label:
          hasAdminCount && totalAdmins <= 1
            ? t("tenantCommandCenter.hero.checks.invitationsPending", { count: 1 })
            : t("tenantCommandCenter.hero.checks.coreHealthy"),
        status: hasAdminCount && totalAdmins <= 1 ? "warning" : "success",
      },
    ],
    kpis: {
      setupCompletion: {
        value: readinessPercent,
        sub: t("tenantCommandCenter.kpis.setupRemaining", { count: 3 - completedCount }),
        trend: "—",
      },
      adminsAndUsers: {
        value: totalAdmins,
        sub: t("tenantCommandCenter.kpis.activeAdminsSub", {
          active: summary?.activeAdmins ?? totalAdmins,
          total: totalAdmins,
        }),
        trend: "—",
      },
      branchesAndSites: {
        current: activeSitesCount,
        total: sitesCapacity,
        percent: sitePercent,
        sub: "—",
        trend: "—",
      },
      enabledProducts: {
        active: 0,
        total: 0,
        sub: "—",
        trend: t("tenantCommandCenter.kpis.explore"),
      },
    },
    steps,
    products: [],
    quotas,
    alerts,
    quickActions: [],
    activityFeed: liveActivity,
    systemNotices: [],
  };
}
