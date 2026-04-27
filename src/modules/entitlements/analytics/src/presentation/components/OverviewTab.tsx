"use client";
/**
 * OverviewTab — KPI cards with key revenue metrics.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, RefreshCw, Percent } from "lucide-react";
import type { AnalyticsOverview } from "../../domain/entities/AnalyticsEntities";

interface OverviewTabProps {
  overview: AnalyticsOverview;
}

function formatCurrency(value: number, currency = "USD"): string {
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
  color: string;
  subtitle?: string;
}

function KpiCard({ title, value, change, icon: Icon, color, subtitle }: KpiCardProps) {
  const TrendIcon = change !== undefined
    ? change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus
    : null;
  const trendColor = change !== undefined
    ? change > 0 ? "text-emerald-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
    : "";

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-card to-card/80">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change !== undefined && TrendIcon && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="h-3 w-3" />
                {formatPercent(change)}
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
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
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: t("entitlements.analytics.kpi.arr"),
      value: formatCurrency(overview.totalArr, overview.currency),
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: t("entitlements.analytics.kpi.activeSubscriptions"),
      value: overview.activeSubscriptions.toLocaleString(),
      subtitle: t("entitlements.analytics.kpi.newCount", { count: overview.newSubscriptions }),
      icon: Users,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: t("entitlements.analytics.kpi.arpu"),
      value: formatCurrency(overview.arpu, overview.currency),
      icon: DollarSign,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: t("entitlements.analytics.kpi.nrr"),
      value: `${overview.netRevenueRetention.toFixed(1)}%`,
      icon: RefreshCw,
      color: overview.netRevenueRetention >= 100 ? "from-emerald-500 to-green-600" : "from-red-500 to-rose-600",
    },
    {
      title: t("entitlements.analytics.kpi.trialConversion"),
      value: `${overview.trialConversionRate.toFixed(1)}%`,
      icon: Percent,
      color: "from-cyan-500 to-sky-600",
    },
    {
      title: t("entitlements.analytics.kpi.churn"),
      value: overview.churnedSubscriptions.toLocaleString(),
      icon: TrendingDown,
      color: "from-red-500 to-rose-600",
    },
    {
      title: t("entitlements.analytics.kpi.revenue"),
      value: formatCurrency(overview.totalRevenue, overview.currency),
      icon: DollarSign,
      color: "from-fuchsia-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
