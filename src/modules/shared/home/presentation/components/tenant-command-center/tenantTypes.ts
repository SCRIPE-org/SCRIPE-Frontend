/**
 * Tenant Command Center Domain Types
 *
 * Strongly-typed contracts for the Tenant Overview Dashboard.
 * Decoupled from mock data structures to adhere to Clean Architecture.
 */

export interface TenantMetaPill {
  label: string;
  icon: string;
}

export interface TenantReadinessCheck {
  label: string;
  status: "success" | "warning" | "error";
}

export interface TenantKpiCardMetric {
  value: number;
  sub: string;
  trend: string;
}

export interface TenantKpiBranchesMetric {
  current: number;
  total: number;
  percent: number;
  sub: string;
  trend: string;
}

export interface TenantKpiProductsMetric {
  active: number;
  total: number;
  sub: string;
  trend: string;
}

export interface TenantKpisData {
  setupCompletion: TenantKpiCardMetric;
  adminsAndUsers: TenantKpiCardMetric;
  branchesAndSites: TenantKpiBranchesMetric;
  enabledProducts: TenantKpiProductsMetric;
}

export interface TenantStepItem {
  id: number;
  title: string;
  description: string;
  status: "done" | "current" | "upcoming";
  actionLabel?: string;
  href?: string;
}

export interface TenantProductStat {
  label: string;
  value: string;
}

export interface TenantProductItem {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  stats: TenantProductStat[];
  buttonLabel: string;
  href: string;
}

export interface TenantQuotaItem {
  id: string;
  label: string;
  current: string;
  total: string;
  percent: number;
  subLeft: string;
  subRight: string;
  color: "green" | "blue" | "violet" | "amber";
}

export interface TenantAlertItem {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "critical" | "info";
  href: string;
}

export interface TenantQuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}

export interface TenantActivityItem {
  id: string;
  author: string;
  avatarText: string;
  avatarColor?: string;
  action: string;
  timeAgo: string;
}

export interface TenantSystemNoticeItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  isSuccess?: boolean;
}

export interface TenantOverviewData {
  tenantName: string;
  location: string;
  planName: string;
  readinessPercent: number;
  setupStepsCompleted: number;
  setupStepsTotal: number;
  metaPills: TenantMetaPill[];
  readinessChecks: TenantReadinessCheck[];
  kpis: TenantKpisData;
  steps: TenantStepItem[];
  products: TenantProductItem[];
  quotas: TenantQuotaItem[];
  alerts: TenantAlertItem[];
  quickActions: TenantQuickActionItem[];
  activityFeed: TenantActivityItem[];
  systemNotices: TenantSystemNoticeItem[];
}
