"use client";

/**
 * Tenant Metrics Cards
 *
 * KPI cards for total tenants, active tenants, users, avg users/tenant.
 * Each figure renders through the shared StatCard so the analytics KPIs share
 * one anatomy with the rest of the product; the error branch rides the shared
 * ErrorMessage the same way SectionState does.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import { ErrorMessage } from "@core/ui/error-message";
import { Building2, Activity, Users, BarChart3 } from "lucide-react";

interface MetricsData {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  avgUsersPerTenant: number;
}

interface Props {
  data: MetricsData | null;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

const METRIC_CONFIG: {
  key: keyof MetricsData;
  icon: typeof Building2;
  tone: StatTone;
  labelKey: string;
}[] = [
  {
    key: "totalTenants",
    icon: Building2,
    tone: "info",
    labelKey: "tenantAnalytics.metrics.totalTenants",
  },
  {
    key: "activeTenants",
    icon: Activity,
    tone: "success",
    labelKey: "tenantAnalytics.metrics.activeTenants",
  },
  {
    key: "totalUsers",
    icon: Users,
    tone: "info",
    labelKey: "tenantAnalytics.metrics.totalUsers",
  },
  {
    key: "avgUsersPerTenant",
    icon: BarChart3,
    tone: "warning",
    labelKey: "tenantAnalytics.metrics.avgUsersPerTenant",
  },
];

/**
 * Exported constant defining parameters and fields for tenant metrics cards configurations.
 */
export const TenantMetricsCards = memo(function TenantMetricsCards({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        role="status"
        aria-label={t("common.loading")}
      >
        {METRIC_CONFIG.map((metric) => (
          <StatCard key={metric.key} isLoading label="" value="" className={cardClasses} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage size="sm" message={t("common.error")} onRetry={onRetry} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-live="polite">
      {METRIC_CONFIG.map((metric) => (
        <StatCard
          key={metric.key}
          label={t(metric.labelKey)}
          value={(data?.[metric.key] ?? 0).toLocaleString()}
          icon={metric.icon}
          tone={metric.tone}
          className={cardClasses}
        />
      ))}
    </div>
  );
});
