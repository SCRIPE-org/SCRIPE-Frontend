"use client";

/**
 * KPI Cards Section
 *
 * Displays key performance indicators in a responsive card grid.
 * Wrapped in React.memo since props change infrequently.
 */
import { memo } from "react";
import type { DashboardSummary } from "../../domain/entities/DashboardEntities";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Users, ShieldCheck, Building2, KeyRound, LogIn, ShieldAlert } from "lucide-react";

interface Props {
  data?: DashboardSummary;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

interface KpiItem {
  key: keyof DashboardSummary;
  icon: typeof ShieldCheck;
  color: string;
  bgColor: string;
  labelKey: string;
  secondaryKey?: keyof DashboardSummary;
  secondaryLabel?: string;
}

const kpiConfig: KpiItem[] = [
  {
    key: "totalAdmins",
    icon: ShieldCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    labelKey: "dashboard.kpi.totalAdmins",
    secondaryKey: "activeAdmins",
    secondaryLabel: "dashboard.kpi.active",
  },
  {
    key: "totalUsers",
    icon: Users,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    labelKey: "dashboard.kpi.totalUsers",
    secondaryKey: "activeUsers",
    secondaryLabel: "dashboard.kpi.active",
  },
  {
    key: "totalTenants",
    icon: Building2,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    labelKey: "dashboard.kpi.totalTenants",
  },
  {
    key: "totalRoles",
    icon: KeyRound,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    labelKey: "dashboard.kpi.totalRoles",
  },
  {
    key: "loginsToday",
    icon: LogIn,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    labelKey: "dashboard.kpi.loginsToday",
  },
  {
    key: "failedLogins24h",
    icon: ShieldAlert,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    labelKey: "dashboard.kpi.failedLogins",
  },
];

export const KPICardsSection = memo(function KPICardsSection({
  data,
  isLoading,
  error,
  onRetry,
}: Props) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
        role="status"
        aria-label={t("common.loading")}
      >
        {kpiConfig.map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-12" />
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
          <button onClick={onRetry} className="text-sm text-primary hover:underline">
            {t("common.retry")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6" aria-live="polite">
      {kpiConfig.map((kpi) => {
        const Icon = kpi.icon;
        const value = data?.[kpi.key] ?? 0;
        const secondary = kpi.secondaryKey ? data?.[kpi.secondaryKey] : undefined;

        return (
          <Card
            key={kpi.key}
            className="group relative overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(kpi.labelKey)}
              </CardTitle>
              <div
                className={`rounded-lg p-2 ${kpi.bgColor} transition-transform group-hover:scale-110`}
              >
                <Icon className={`h-4 w-4 ${kpi.color}`} aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</div>
              {secondary !== undefined && kpi.secondaryLabel && (
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                  {secondary} {t(kpi.secondaryLabel)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
