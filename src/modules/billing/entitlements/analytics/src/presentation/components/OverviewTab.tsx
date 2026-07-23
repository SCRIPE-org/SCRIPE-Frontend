"use client";
/**
 * OverviewTab — Premium KPI cards with key revenue metrics and visual indicators.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  RefreshCw,
  Percent,
  Activity,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

interface KpiItem {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  tone: StatTone;
  subtitle?: string;
  large?: boolean;
}

/**
 * Presentation UI component rendering the overview tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function OverviewTab({ overview }: OverviewTabProps) {
  const { t } = useI18n();

  const kpis: KpiItem[] = [
    {
      title: t("entitlements.analytics.kpi.mrr"),
      value: formatCurrency(overview.totalMrr, overview.currency),
      change: overview.mrrChangePercent,
      icon: DollarSign,
      tone: "success",
      large: true,
    },
    {
      title: t("entitlements.analytics.kpi.arr"),
      value: formatCurrency(overview.totalArr, overview.currency),
      icon: TrendingUp,
      tone: "info",
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
      tone: "neutral",
    },
    {
      title: t("entitlements.analytics.kpi.arpu"),
      value: formatCurrency(overview.arpu, overview.currency),
      icon: BarChart3,
      tone: "warning",
    },
    {
      title: t("entitlements.analytics.kpi.nrr"),
      value: `${overview.netRevenueRetention.toFixed(1)}%`,
      icon: RefreshCw,
      tone: overview.netRevenueRetention >= 100 ? "success" : "danger",
    },
    {
      title: t("entitlements.analytics.kpi.trialConversion"),
      value: `${overview.trialConversionRate.toFixed(1)}%`,
      icon: Percent,
      tone: "info",
    },
    {
      title: t("entitlements.analytics.kpi.churn"),
      value: overview.churnedSubscriptions.toLocaleString(),
      icon: TrendingDown,
      tone: "danger",
    },
    {
      title: t("entitlements.analytics.kpi.revenue"),
      value: formatCurrency(overview.totalRevenue, overview.currency),
      icon: Activity,
      tone: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.title}
          label={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          tone={kpi.tone}
          subtitle={kpi.subtitle}
          trend={kpi.change !== undefined ? { value: kpi.change } : undefined}
          className={kpi.large ? "sm:col-span-2" : undefined}
        />
      ))}
    </div>
  );
}
