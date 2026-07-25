// FILE-EXCEPTION: file length
"use client";

import { cn } from "@core/common/utils";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import {
  DollarSign,
  CreditCard,
  Clock,
  TrendingUp,
  XCircle,
  Pause,
  BarChart3,
  CalendarClock,
  Tag,
  Percent,
  UserCheck,
} from "lucide-react";

interface SubscriptionsKpiGridProps {
  kpis: {
    totalMrr: number;
    totalRevenue: number;
    totalRefunded: number;
    netRevenue: number;
    activeCount: number;
    trialCount: number;
    suspendedCount: number;
    canceledCount: number;
    arpu: number;
    churnRate: number;
    renewalCount: number;
    totalPromoDiscount: number;
  };
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  formatDisplay: (amount: number, currency: string) => string;
  t: (key: string) => string;
}

// The four count tiles double as filter toggles: clicking one narrows the
// table below to that status, clicking the active one clears the filter.
// Selection borrows the tile's own tone rather than a single accent, so the
// highlighted card still reads as "the Active one" / "the Canceled one".
const SELECTED_TONE_CLASS: Record<StatTone, string> = {
  neutral: "border-nx-line-hi bg-nx-raised-2",
  success: "border-success bg-success/10",
  warning: "border-warning bg-warning/10",
  danger: "border-destructive bg-destructive/10",
  info: "border-info bg-info/10",
};

/**
 * Presentation UI component rendering the subscriptions kpi grid.
 * Twelve figures composed from the shared StatCard — financial totals,
 * status counts (the four also double as table filters) and business-health
 * ratios — in the same three-row grouping the dashboard has always used.
 */
export function SubscriptionsKpiGrid({
  kpis,
  statusFilter,
  setStatusFilter,
  formatDisplay,
  t,
}: SubscriptionsKpiGridProps) {
  const churnTone: StatTone =
    kpis.churnRate > 10 ? "danger" : kpis.churnRate > 5 ? "warning" : "success";

  const countTile = (status: string, tone: StatTone) => {
    const isSelected = statusFilter === status;
    return {
      onClick: () => setStatusFilter(isSelected ? "all" : status),
      className: cn(isSelected && SELECTED_TONE_CLASS[tone]),
    };
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.kpi.totalMrr")}
          value={formatDisplay(kpis.totalMrr, "USD")}
          subtitle={t("dashboard.kpi.mrrDesc")}
          icon={DollarSign}
          tone="success"
        />
        <StatCard
          label={t("dashboard.kpi.totalRevenue")}
          value={formatDisplay(kpis.totalRevenue, "USD")}
          subtitle={t("dashboard.kpi.revenueDesc")}
          icon={TrendingUp}
          tone="info"
        />
        <StatCard
          label={t("dashboard.kpi.totalRefunded")}
          value={formatDisplay(kpis.totalRefunded, "USD")}
          subtitle={t("dashboard.kpi.refundedDesc")}
          icon={XCircle}
          tone="danger"
        />
        <StatCard
          label={t("dashboard.kpi.netRevenue")}
          value={formatDisplay(kpis.netRevenue, "USD")}
          subtitle={t("dashboard.kpi.netRevenueDesc")}
          icon={BarChart3}
          tone="success"
        />
      </div>

      {/* Subscription Counts — clickable filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("entSubscriptions.activeCount")}
          value={kpis.activeCount.toLocaleString()}
          subtitle={t("dashboard.kpi.activeDesc")}
          icon={CreditCard}
          tone="success"
          {...countTile("Active", "success")}
        />
        <StatCard
          label={t("entSubscriptions.trialCount")}
          value={kpis.trialCount.toLocaleString()}
          subtitle={t("dashboard.kpi.trialDesc")}
          icon={Clock}
          tone="info"
          {...countTile("Trialing", "info")}
        />
        <StatCard
          label={t("dashboard.kpi.suspendedCount")}
          value={kpis.suspendedCount.toLocaleString()}
          subtitle={t("dashboard.kpi.suspendedDesc")}
          icon={Pause}
          tone="warning"
          {...countTile("Suspended", "warning")}
        />
        <StatCard
          label={t("dashboard.kpi.canceledCount")}
          value={kpis.canceledCount.toLocaleString()}
          subtitle={t("dashboard.kpi.canceledDesc")}
          icon={XCircle}
          tone="danger"
          {...countTile("Canceled", "danger")}
        />
      </div>

      {/* Business Health */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.kpi.arpu")}
          value={formatDisplay(kpis.arpu, "USD")}
          subtitle={t("dashboard.kpi.arpuDesc")}
          icon={UserCheck}
          tone="info"
        />
        <StatCard
          label={t("dashboard.kpi.churnRate")}
          value={kpis.churnRate}
          suffix="%"
          subtitle={t("dashboard.kpi.churnRateDesc")}
          icon={Percent}
          tone={churnTone}
        />
        <StatCard
          label={t("dashboard.kpi.renewals")}
          value={kpis.renewalCount.toLocaleString()}
          subtitle={t("dashboard.kpi.renewalsDesc")}
          icon={CalendarClock}
          tone="info"
        />
        <StatCard
          label={t("dashboard.kpi.promoDiscount")}
          value={formatDisplay(kpis.totalPromoDiscount, "USD")}
          subtitle={t("dashboard.kpi.promoDiscountDesc")}
          icon={Tag}
          tone="info"
        />
      </div>
    </div>
  );
}
