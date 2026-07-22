// FILE-EXCEPTION: file length
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
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

/**
 * Presentation UI component rendering the subscriptions kpi grid.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubscriptionsKpiGrid({
  kpis,
  statusFilter,
  setStatusFilter,
  formatDisplay,
  t,
}: SubscriptionsKpiGridProps) {
  return (
    <div className="space-y-6">
      {/* Financial Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* MRR */}
        <Card className="relative overflow-hidden border-success/30 transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-success/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.totalMrr") || "Monthly Recurring Revenue"}
            </CardTitle>
            <DollarSign className="h-4.5 w-4.5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-success">
              {formatDisplay(kpis.totalMrr, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.mrrDesc") || "Active recurring revenue per month"}
            </p>
          </CardContent>
        </Card>

        {/* Gross Revenue */}
        <Card className="relative overflow-hidden border-info/30 transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-info/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.totalRevenue") || "Gross Revenue"}
            </CardTitle>
            <TrendingUp className="h-4.5 w-4.5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-info">
              {formatDisplay(kpis.totalRevenue, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.revenueDesc") || "Active + Trialing + Suspended"}
            </p>
          </CardContent>
        </Card>

        {/* Total Refunded */}
        <Card className="relative overflow-hidden border-destructive/30 transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-destructive/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.totalRefunded") || "Total Refunded"}
            </CardTitle>
            <XCircle className="h-4.5 w-4.5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-destructive">
              {formatDisplay(kpis.totalRefunded, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.refundedDesc") || "Across all subscriptions"}
            </p>
          </CardContent>
        </Card>

        {/* Net Revenue */}
        <Card className="relative overflow-hidden border-primary/30 transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-primary/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.netRevenue") || "Net Revenue"}
            </CardTitle>
            <BarChart3 className="h-4.5 w-4.5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-primary">
              {formatDisplay(kpis.netRevenue, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.netRevenueDesc") || "Revenue minus refunds"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active */}
        <Card
          className={`group cursor-pointer transition-all duration-300 hover:shadow-md ${
            statusFilter === "Active"
              ? "border-success bg-success/10 ring-2 ring-success/20"
              : "hover:border-success/30"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Active" ? "all" : "Active")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("entSubscriptions.activeCount") || "Active"}
            </CardTitle>
            <CreditCard className="h-4.5 w-4.5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
              {kpis.activeCount}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.activeDesc") || "Paying tenants"}
            </p>
          </CardContent>
        </Card>

        {/* Trialing */}
        <Card
          className={`group cursor-pointer transition-all duration-300 hover:shadow-md ${
            statusFilter === "Trialing"
              ? "border-info bg-info/10 ring-2 ring-info/20"
              : "hover:border-info/30"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Trialing" ? "all" : "Trialing")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("entSubscriptions.trialCount") || "Trialing"}
            </CardTitle>
            <Clock className="h-4.5 w-4.5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
              {kpis.trialCount}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.trialDesc") || "In trial period"}
            </p>
          </CardContent>
        </Card>

        {/* Suspended */}
        <Card
          className={`group cursor-pointer transition-all duration-300 hover:shadow-md ${
            statusFilter === "Suspended"
              ? "border-warning bg-warning/10 ring-2 ring-warning/20"
              : "hover:border-warning/30"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Suspended" ? "all" : "Suspended")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.suspendedCount") || "Suspended"}
            </CardTitle>
            <Pause className="h-4.5 w-4.5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
              {kpis.suspendedCount}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.suspendedDesc") || "Temporarily paused"}
            </p>
          </CardContent>
        </Card>

        {/* Canceled */}
        <Card
          className={`group cursor-pointer transition-all duration-300 hover:shadow-md ${
            statusFilter === "Canceled"
              ? "border-destructive bg-destructive/10 ring-2 ring-destructive/20"
              : "hover:border-destructive/30"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Canceled" ? "all" : "Canceled")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.canceledCount") || "Canceled"}
            </CardTitle>
            <XCircle className="h-4.5 w-4.5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
              {kpis.canceledCount}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.canceledDesc") || "Ended subscriptions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Health KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ARPU */}
        <Card className="relative overflow-hidden border-info/30 transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-info/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.arpu") || "ARPU"}
            </CardTitle>
            <UserCheck className="h-4.5 w-4.5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-info">
              {formatDisplay(kpis.arpu, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.arpuDesc") || "Avg revenue per paying user"}
            </p>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${
            kpis.churnRate > 10
              ? "border-destructive/30"
              : kpis.churnRate > 5
                ? "border-warning/30"
                : "border-success/30"
          }`}
        >
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-warning/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.churnRate") || "Churn Rate"}
            </CardTitle>
            <Percent
              className={`h-4.5 w-4.5 ${
                kpis.churnRate > 10
                  ? "text-destructive"
                  : kpis.churnRate > 5
                    ? "text-warning"
                    : "text-success"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-extrabold tabular-nums ${
                kpis.churnRate > 10
                  ? "text-destructive"
                  : kpis.churnRate > 5
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {kpis.churnRate}%
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.churnRateDesc") || "30-day rolling churn"}
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card className="relative overflow-hidden border-info/30 transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-info/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.renewals") || "Upcoming Renewals"}
            </CardTitle>
            <CalendarClock className="h-4.5 w-4.5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
              {kpis.renewalCount}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.renewalsDesc") || "Within 30 days"}
            </p>
          </CardContent>
        </Card>

        {/* Promo Discount */}
        <Card className="relative overflow-hidden border-primary/30 transition-all duration-300 hover:shadow-md">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-primary/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.promoDiscount") || "Active Discounts"}
            </CardTitle>
            <Tag className="h-4.5 w-4.5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-primary">
              {formatDisplay(kpis.totalPromoDiscount, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.promoDiscountDesc") || "Total promotional savings"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
