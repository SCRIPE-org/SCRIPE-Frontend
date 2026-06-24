/**
 * CommissionKpiCards
 * Six KPI stat cards for the Commission Dashboard.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Activity, Users, Percent } from "lucide-react";
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
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

function KpiCard({ label, desc, value, icon: Icon, iconColor, bgColor }: KpiItem) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {label}
          <span className={`rounded-md p-1.5 ${bgColor}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function Skeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

const fmtInt = (n: number) => new Intl.NumberFormat("en-US").format(n);

/**
 * React presentation component representing the commission kpi cards UI element.
 */
export function CommissionKpiCards({ dashboard, isLoading, t }: CommissionKpiCardsProps) {
  if (isLoading || !dashboard) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
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
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: t("entitlements.commissions.totalRefunded"),
      desc: t("entitlements.commissions.totalRefundedDesc"),
      value: fmt(dashboard.totalRefunded),
      icon: TrendingDown,
      iconColor: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      label: t("entitlements.commissions.netCommission"),
      desc: t("entitlements.commissions.netCommissionDesc"),
      value: fmt(dashboard.netCommission),
      icon: TrendingUp,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: t("entitlements.commissions.totalTransactions"),
      desc: t("entitlements.commissions.totalTransactionsDesc"),
      value: fmtInt(dashboard.totalTransactions),
      icon: Activity,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: t("entitlements.commissions.activeTenants"),
      desc: t("entitlements.commissions.activeTenantsDesc"),
      value: fmtInt(dashboard.activeTenants),
      icon: Users,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: t("entitlements.commissions.globalRate"),
      desc: t("entitlements.commissions.globalRateDesc"),
      value: `${(dashboard.globalCommissionRate * 100).toFixed(2)}%`,
      icon: Percent,
      iconColor: "text-slate-600",
      bgColor: "bg-slate-100 dark:bg-slate-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
