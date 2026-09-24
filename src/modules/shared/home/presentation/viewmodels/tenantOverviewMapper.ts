/**
 * Tenant Overview Mapper
 * Transforms raw backend telemetry DTOs into TenantOverviewData (< 180 lines).
 */
import type { DashboardSummary, RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { TenantStats } from "@modules/admin/identity/tenants/src/domain/interfaces/ITenantRepository";
import type { Tenant } from "@modules/admin/identity/tenants/src/domain/entities/Tenant";
import { TENANT_MOCK_DATA } from "../components/tenant-command-center/tenantMockData";
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
  const tenantName = activeTenantName || details?.name || TENANT_MOCK_DATA.tenantName;
  const location = details?.countryCode || TENANT_MOCK_DATA.location;
  const planName = stats?.editionName || TENANT_MOCK_DATA.planName;

  const totalAdmins = summary?.totalAdmins ?? stats?.adminsCount ?? 1;
  const subTenants = stats?.subTenantsCount ?? 0;
  const branchesTotal = 5;
  const branchPercent = Math.min(100, Math.round((subTenants / branchesTotal) * 100));

  const completedCount = [true, subTenants > 0, totalAdmins > 1].filter(Boolean).length;
  const readinessPercent = Math.min(100, Math.round((completedCount / 3) * 100));

  const liveActivity: TenantActivityItem[] = recentActivity && recentActivity.length > 0
    ? recentActivity.slice(0, 5).map((log) => ({
        id: log.id,
        author: log.username || "Admin",
        avatarText: (log.username || "AD").slice(0, 2).toUpperCase(),
        action: log.entityType ? `${log.eventType}: ${log.entityType}` : log.eventType,
        timeAgo: t("tenantCommandCenter.activity.recent"),
      }))
    : TENANT_MOCK_DATA.activityFeed;

  const alerts: TenantAlertItem[] = [];
  if (summary && summary.failedLogins24h > 0) {
    alerts.push({
      id: "alt-failed-logins",
      title: t("tenantCommandCenter.attention.failedLoginsTitle"),
      description: t("tenantCommandCenter.attention.failedLoginsDesc", { count: summary.failedLogins24h }),
      severity: "critical",
      href: "/audit",
    });
  }
  if (subTenants === 0) {
    alerts.push({
      id: "alt-add-branch",
      title: t("tenantCommandCenter.attention.addBranchTitle"),
      description: t("tenantCommandCenter.attention.addBranchDesc"),
      severity: "warning",
      href: "/branches",
    });
  }
  if (totalAdmins <= 1) {
    alerts.push({
      id: "alt-invite-team",
      title: t("tenantCommandCenter.attention.inviteTeamTitle"),
      description: t("tenantCommandCenter.attention.inviteTeamDesc"),
      severity: "warning",
      href: "/admins",
    });
  }

  const steps: TenantStepItem[] = [
    { id: 1, title: t("tenantCommandCenter.getStarted.steps.profile.title"), description: t("tenantCommandCenter.getStarted.steps.profile.desc"), status: "done" },
    { id: 2, title: t("tenantCommandCenter.getStarted.steps.branches.title"), description: t("tenantCommandCenter.getStarted.steps.branches.desc"), status: subTenants > 0 ? "done" : "current", actionLabel: t("tenantCommandCenter.getStarted.setUp"), href: "/branches" },
    { id: 3, title: t("tenantCommandCenter.getStarted.steps.team.title"), description: t("tenantCommandCenter.getStarted.steps.team.desc"), status: totalAdmins > 1 ? "done" : subTenants > 0 ? "current" : "upcoming", actionLabel: t("tenantCommandCenter.getStarted.start"), href: "/admins" },
  ];

  const staffPct = Math.min(100, Math.round((totalAdmins / 50) * 100));
  const quotas: TenantQuotaItem[] = [
    { id: "staff", label: t("tenantCommandCenter.usage.staff"), current: String(totalAdmins), total: "50", percent: staffPct, subLeft: t("tenantCommandCenter.usage.used", { percent: staffPct }), subRight: t("tenantCommandCenter.usage.left", { count: Math.max(0, 50 - totalAdmins) }), color: "green" },
    { id: "sites", label: t("tenantCommandCenter.usage.sites"), current: String(subTenants), total: String(branchesTotal), percent: branchPercent, subLeft: t("tenantCommandCenter.usage.used", { percent: branchPercent }), subRight: t("tenantCommandCenter.usage.left", { count: Math.max(0, branchesTotal - subTenants) }), color: "blue" },
    { id: "storage", label: t("tenantCommandCenter.usage.storage"), current: "12 GB", total: "100 GB", percent: 12, subLeft: t("tenantCommandCenter.usage.used", { percent: 12 }), subRight: t("tenantCommandCenter.usage.left", { count: 88 }), color: "violet" },
    { id: "api", label: t("tenantCommandCenter.usage.api"), current: "2.4K", total: "50K", percent: 5, subLeft: t("tenantCommandCenter.usage.used", { percent: 5 }), subRight: t("tenantCommandCenter.usage.thisMonth"), color: "amber" },
  ];

  return {
    tenantName,
    location,
    planName,
    readinessPercent,
    setupStepsCompleted: completedCount,
    setupStepsTotal: 3,
    metaPills: [
      { label: t("tenantCommandCenter.hero.meta.branches", { count: subTenants }), icon: "🏢" },
      { label: t("tenantCommandCenter.hero.meta.admins", { count: totalAdmins }), icon: "👥" },
      { label: planName, icon: "⭐" },
      { label: t("tenantCommandCenter.hero.checks.coreHealthy"), icon: "✓" },
    ],
    readinessChecks: [
      { label: t("tenantCommandCenter.hero.checks.coreHealthy"), status: "success" },
      { label: t("tenantCommandCenter.hero.checks.productsActive", { count: 2 }), status: "success" },
      {
        label: totalAdmins <= 1
          ? t("tenantCommandCenter.hero.checks.invitationsPending", { count: 1 })
          : t("tenantCommandCenter.hero.checks.coreHealthy"),
        status: totalAdmins <= 1 ? "warning" : "success",
      },
    ],
    kpis: {
      setupCompletion: {
        value: readinessPercent,
        sub: t("tenantCommandCenter.kpis.setupRemaining", { count: 3 - completedCount }),
        trend: "↑ 12%",
      },
      adminsAndUsers: {
        value: totalAdmins,
        sub: t("tenantCommandCenter.kpis.activeAdminsSub", {
          active: summary?.activeAdmins ?? totalAdmins,
          total: totalAdmins,
        }),
        trend: summary?.activeUsers ? `+${summary.activeUsers}` : "Live",
      },
      branchesAndSites: {
        current: subTenants,
        total: branchesTotal,
        percent: branchPercent,
        sub: t("tenantCommandCenter.kpis.planCapacity", { percent: branchPercent }),
        trend: subTenants > 0 ? `+${subTenants}` : "0",
      },
      enabledProducts: {
        active: 2,
        total: 3,
        sub: "Venue & Academy",
        trend: t("tenantCommandCenter.kpis.explore"),
      },
    },
    steps,
    products: TENANT_MOCK_DATA.products,
    quotas,
    alerts: alerts.length > 0 ? alerts : TENANT_MOCK_DATA.alerts.slice(0, 2),
    quickActions: TENANT_MOCK_DATA.quickActions,
    activityFeed: liveActivity,
    systemNotices: TENANT_MOCK_DATA.systemNotices,
  };
}
