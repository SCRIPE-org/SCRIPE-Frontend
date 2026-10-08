/**
 * MockStatsGrid Component
 *
 * Renders the responsive KPI summary cards for the customizer studio dashboard preview.
 * Displays metric values, category icons, and month-over-month trend indicators.
 */
"use client";

import { Users, DollarSign, Activity, Eye, TrendingUp } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

/**
 * Properties for the MockStatsGrid component.
 */
export interface MockStatsGridProps {
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * Renders the top KPI cards within the mock dashboard preview.
 */
export function MockStatsGrid({ className }: MockStatsGridProps) {
  const { t } = useI18n();

  const stats = [
    {
      icon: Users,
      label: t("studio.dashboardPreview.stats.totalUsers"),
      value: "2,847",
      change: "+12.5%",
      positive: true,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      icon: DollarSign,
      label: t("studio.dashboardPreview.stats.revenue"),
      value: "$48.2K",
      change: "+8.1%",
      positive: true,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: Activity,
      label: t("studio.dashboardPreview.stats.activeNow"),
      value: "342",
      change: "-2.4%",
      positive: false,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      icon: Eye,
      label: t("studio.dashboardPreview.stats.pageViews"),
      value: "12.4K",
      change: "+23.7%",
      positive: true,
      color: "text-nx-accent",
      bg: "bg-nx-accent-wash",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="rounded-nx-md border border-nx-line bg-nx-surface p-4 shadow-nx-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-nx-ink-3">{stat.label}</span>
              <div className={cn("rounded-nx-md p-2", stat.bg)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </div>
            <div className="text-2xl font-bold text-nx-ink">{stat.value}</div>
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                stat.positive ? "text-success" : "text-destructive"
              )}
            >
              <TrendingUp className={cn("h-3 w-3", !stat.positive && "rotate-180")} />
              <span>
                {stat.change} {t("studio.dashboardPreview.fromLastMonth")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
