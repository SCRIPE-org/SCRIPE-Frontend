"use client";

/**
 * Tenant Metrics Cards
 *
 * KPI cards for total tenants, active tenants, users, avg users/tenant.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Button } from "@core/ui/button";
import { Building2, Activity, Users, BarChart3 } from "lucide-react";
import { cn } from "@core/common/utils";

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

const METRIC_CONFIG = [
  {
    key: "totalTenants" as const,
    icon: Building2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    labelKey: "tenantAnalytics.metrics.totalTenants",
  },
  {
    key: "activeTenants" as const,
    icon: Activity,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    labelKey: "tenantAnalytics.metrics.activeTenants",
  },
  {
    key: "totalUsers" as const,
    icon: Users,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    labelKey: "tenantAnalytics.metrics.totalUsers",
  },
  {
    key: "avgUsersPerTenant" as const,
    icon: BarChart3,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
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
        {METRIC_CONFIG.map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-muted-foreground">
        <p className="text-sm">{t("common.error")}</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-live="polite">
      {METRIC_CONFIG.map((metric) => {
        const Icon = metric.icon;
        const value = data?.[metric.key] ?? 0;

        return (
          <Card
            key={metric.key}
            className={cn("group transition-shadow hover:shadow-md", cardClasses)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(metric.labelKey)}
              </CardTitle>
              <div
                className={`rounded-lg p-2 ${metric.bgColor} transition-transform group-hover:scale-110`}
              >
                <Icon className={`h-4 w-4 ${metric.color}`} aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
