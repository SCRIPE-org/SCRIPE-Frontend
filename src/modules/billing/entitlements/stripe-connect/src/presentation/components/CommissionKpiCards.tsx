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
 * Presentation UI component rendering the commission kpi cards.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
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
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: t("entitlements.commissions.totalRefunded"),
      desc: t("entitlements.commissions.totalRefundedDesc"),
      value: fmt(dashboard.totalRefunded),
      icon: TrendingDown,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: t("entitlements.commissions.netCommission"),
      desc: t("entitlements.commissions.netCommissionDesc"),
      value: fmt(dashboard.netCommission),
      icon: TrendingUp,
      iconColor: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: t("entitlements.commissions.totalTransactions"),
      desc: t("entitlements.commissions.totalTransactionsDesc"),
      value: fmtInt(dashboard.totalTransactions),
      icon: Activity,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("entitlements.commissions.activeTenants"),
      desc: t("entitlements.commissions.activeTenantsDesc"),
      value: fmtInt(dashboard.activeTenants),
      icon: Users,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: t("entitlements.commissions.globalRate"),
      desc: t("entitlements.commissions.globalRateDesc"),
      value: `${(dashboard.globalCommissionRate * 100).toFixed(2)}%`,
      icon: Percent,
      iconColor: "text-muted-foreground",
      bgColor: "bg-muted",
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
