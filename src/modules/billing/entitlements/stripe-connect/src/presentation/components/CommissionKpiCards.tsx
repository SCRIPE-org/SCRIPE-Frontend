/**
 * CommissionKpiCards
 * Six KPI stat cards for the Commission Dashboard.
 */
"use client";

import { StatCard, type StatTone } from "@core/ui/stat-card";
import { DollarSign, TrendingDown, TrendingUp, Activity, Users, Percent } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CommissionDashboard } from "../../domain/entities/ConnectAccount";

interface CommissionKpiCardsProps {
  dashboard: CommissionDashboard | null;
  isLoading: boolean;
  t: (key: string) => string;
}

interface KpiItem {
  label: string;
  desc: string;
  value: string;
  icon: LucideIcon;
  tone: StatTone;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

const fmtInt = (n: number) => new Intl.NumberFormat("en-US").format(n);

/**
 * Presentation UI component rendering the commission kpi cards.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CommissionKpiCards({ dashboard, isLoading, t }: CommissionKpiCardsProps) {
  if (isLoading || !dashboard) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCard key={i} isLoading label="" value="" />
        ))}
      </div>
    );
  }

  const kpis: KpiItem[] = [
    {
      label: t("entitlements.commissions.totalCommission"),
      desc: t("entitlements.commissions.totalCommissionDesc"),
      value: fmt(dashboard.totalCommission),
      icon: DollarSign,
      tone: "success",
    },
    {
      label: t("entitlements.commissions.totalRefunded"),
      desc: t("entitlements.commissions.totalRefundedDesc"),
      value: fmt(dashboard.totalRefunded),
      icon: TrendingDown,
      tone: "danger",
    },
    {
      label: t("entitlements.commissions.netCommission"),
      desc: t("entitlements.commissions.netCommissionDesc"),
      value: fmt(dashboard.netCommission),
      icon: TrendingUp,
      tone: "info",
    },
    {
      label: t("entitlements.commissions.totalTransactions"),
      desc: t("entitlements.commissions.totalTransactionsDesc"),
      value: fmtInt(dashboard.totalTransactions),
      icon: Activity,
      tone: "neutral",
    },
    {
      label: t("entitlements.commissions.activeTenants"),
      desc: t("entitlements.commissions.activeTenantsDesc"),
      value: fmtInt(dashboard.activeTenants),
      icon: Users,
      tone: "warning",
    },
    {
      label: t("entitlements.commissions.globalRate"),
      desc: t("entitlements.commissions.globalRateDesc"),
      value: `${(dashboard.globalCommissionRate * 100).toFixed(2)}%`,
      icon: Percent,
      tone: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          subtitle={kpi.desc}
          icon={kpi.icon}
          tone={kpi.tone}
        />
      ))}
    </div>
  );
}
