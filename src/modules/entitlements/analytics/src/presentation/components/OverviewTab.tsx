"use client";
/**
 * OverviewTab — Premium KPI cards with key revenue metrics and visual indicators.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  RefreshCw,
  Percent,
  Activity,
  BarChart3,
} from "lucide-react";
import type { AnalyticsOverview } from "../../domain/entities/AnalyticsEntities";

interface OverviewTabProps {
  overview: AnalyticsOverview;
}

function formatCurrency(value: number, currency = "USD"): string {
  if (Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  subtitle?: string;
  large?: boolean;
}

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  iconBg,
  subtitle,
  large,
}: KpiCardProps) {
  const TrendIcon =
    change !== undefined ? (change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus) : null;
  const trendColor =
    change !== undefined
      ? change > 0
        ? "text-emerald-500"
        : change < 0
          ? "text-red-500"
          : "text-muted-foreground"
      : "";

  return (
    <Card
      className={`group relative overflow-hidden border border-border/30 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${large ? "sm:col-span-2" : ""}`}
    >
      {/* Gradient accent top border */}
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`} />
      {/* Hover glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]`}
      />
      <CardContent className={`relative ${large ? "p-6" : "p-5"}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className={`${large ? "text-3xl" : "text-2xl"} font-bold tracking-tight`}>{value}</p>
            <div className="flex items-center gap-2">
              {change !== undefined && TrendIcon && (
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    change > 0
                      ? "bg-emerald-500/10 text-emerald-600"
                      : change < 0
                        ? "bg-red-500/10 text-red-600"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <TrendIcon className="h-3 w-3" />
                  {formatPercent(change)}
                </div>
              )}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg} shrink-0 text-white shadow-lg`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewTab({ overview }: OverviewTabProps) {
  const { t } = useI18n();

  const kpis: KpiCardProps[] = [
    {
      title: t("entitlements.analytics.kpi.mrr"),
      value: formatCurrency(overview.totalMrr, overview.currency),
      change: overview.mrrChangePercent,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "from-emerald-500 to-teal-600",
      large: true,
    },
    {
      title: t("entitlements.analytics.kpi.arr"),
      value: formatCurrency(overview.totalArr, overview.currency),
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "from-blue-500 to-indigo-600",
      large: true,
    },
    {
      title: t("entitlements.analytics.kpi.activeSubscriptions"),
      value: overview.activeSubscriptions.toLocaleString(),
      subtitle:
        overview.newSubscriptions > 0
          ? t("entitlements.analytics.kpi.newCount", { count: String(overview.newSubscriptions) })
          : undefined,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "from-violet-500 to-purple-600",
    },
    {
      title: t("entitlements.analytics.kpi.arpu"),
      value: formatCurrency(overview.arpu, overview.currency),
      icon: BarChart3,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "from-amber-500 to-orange-600",
    },
    {
      title: t("entitlements.analytics.kpi.nrr"),
      value: `${overview.netRevenueRetention.toFixed(1)}%`,
      icon: RefreshCw,
      gradient:
        overview.netRevenueRetention >= 100
          ? "from-emerald-500 to-green-600"
          : "from-red-500 to-rose-600",
      iconBg:
        overview.netRevenueRetention >= 100
          ? "from-emerald-500 to-green-600"
          : "from-red-500 to-rose-600",
    },
    {
      title: t("entitlements.analytics.kpi.trialConversion"),
      value: `${overview.trialConversionRate.toFixed(1)}%`,
      icon: Percent,
      gradient: "from-cyan-500 to-sky-600",
      iconBg: "from-cyan-500 to-sky-600",
    },
    {
      title: t("entitlements.analytics.kpi.churn"),
      value: overview.churnedSubscriptions.toLocaleString(),
      icon: TrendingDown,
      gradient: "from-red-500 to-rose-600",
      iconBg: "from-red-500 to-rose-600",
    },
    {
      title: t("entitlements.analytics.kpi.revenue"),
      value: formatCurrency(overview.totalRevenue, overview.currency),
      icon: Activity,
      gradient: "from-fuchsia-500 to-pink-600",
      iconBg: "from-fuchsia-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
