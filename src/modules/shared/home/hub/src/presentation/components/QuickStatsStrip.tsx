"use client";

/**
 * Quick Stats Strip
 *
 * Compact row of 4 KPI cards showing key system numbers.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import { Users, Building2, Shield, LogIn } from "lucide-react";
interface DashboardSummary {
  totalAdmins: number;
  activeUsers: number;
  activeTenants: number;
  loginsToday: number;
}

interface Props {
  data?: DashboardSummary;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

interface StatCardData {
  label: string;
  value: number;
  icon: typeof Users;
  color: string;
  bgColor: string;
}

/**
 * Exported constant defining parameters and fields for quick stats strip configurations.
 */
export const QuickStatsStrip = memo(function QuickStatsStrip({
  data,
  isLoading,
  error,
  onRetry,
}: Props) {
  const { t } = useI18n();

  const stats: StatCardData[] = [
    {
      label: t("overview.stats.totalAdmins"),
      value: data?.totalAdmins ?? 0,
      icon: Shield,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: t("overview.stats.activeUsers"),
      value: data?.activeUsers ?? 0,
      icon: Users,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: t("overview.stats.activeTenants"),
      value: data?.activeTenants ?? 0,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("overview.stats.loginsToday"),
      value: data?.loginsToday ?? 0,
      icon: LogIn,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <SectionState
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      skeletonType="cards"
      height={100}
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="relative overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-xl p-2.5 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums">{stat.value.toLocaleString()}</p>
                  <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SectionState>
  );
});
