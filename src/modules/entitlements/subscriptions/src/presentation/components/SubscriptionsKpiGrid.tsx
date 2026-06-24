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
 * React presentation component representing the subscriptions kpi grid UI element.
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
        <Card className="relative overflow-hidden border-emerald-200/50 transition-all duration-300 hover:shadow-md dark:border-emerald-800/30">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-emerald-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.totalMrr") || "Monthly Recurring Revenue"}
            </CardTitle>
            <DollarSign className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatDisplay(kpis.totalMrr, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.mrrDesc") || "Active recurring revenue per month"}
            </p>
          </CardContent>
        </Card>

        {/* Gross Revenue */}
        <Card className="relative overflow-hidden border-blue-200/50 transition-all duration-300 hover:shadow-md dark:border-blue-800/30">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-blue-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.totalRevenue") || "Gross Revenue"}
            </CardTitle>
            <TrendingUp className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-blue-700 dark:text-blue-400">
              {formatDisplay(kpis.totalRevenue, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.revenueDesc") || "Active + Trialing + Suspended"}
            </p>
          </CardContent>
        </Card>

        {/* Total Refunded */}
        <Card className="relative overflow-hidden border-red-200/50 transition-all duration-300 hover:shadow-md dark:border-red-800/30">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.totalRefunded") || "Total Refunded"}
            </CardTitle>
            <XCircle className="h-4.5 w-4.5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-red-600 dark:text-red-400">
              {formatDisplay(kpis.totalRefunded, "USD")}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("dashboard.kpi.refundedDesc") || "Across all subscriptions"}
            </p>
          </CardContent>
        </Card>

        {/* Net Revenue */}
        <Card className="relative overflow-hidden border-violet-200/50 transition-all duration-300 hover:shadow-md dark:border-violet-800/30">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-violet-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.netRevenue") || "Net Revenue"}
            </CardTitle>
            <BarChart3 className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-violet-700 dark:text-violet-400">
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
              ? "border-emerald-500 bg-emerald-50/10 ring-2 ring-emerald-500/20"
              : "hover:border-emerald-300 dark:hover:border-emerald-700"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Active" ? "all" : "Active")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("entSubscriptions.activeCount") || "Active"}
            </CardTitle>
            <CreditCard className="h-4.5 w-4.5 text-emerald-500" />
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
              ? "border-blue-500 bg-blue-50/10 ring-2 ring-blue-500/20"
              : "hover:border-blue-300 dark:hover:border-blue-700"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Trialing" ? "all" : "Trialing")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("entSubscriptions.trialCount") || "Trialing"}
            </CardTitle>
            <Clock className="h-4.5 w-4.5 text-blue-500" />
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
              ? "border-amber-500 bg-amber-50/10 ring-2 ring-amber-500/20"
              : "hover:border-amber-300 dark:hover:border-amber-700"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Suspended" ? "all" : "Suspended")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.suspendedCount") || "Suspended"}
            </CardTitle>
            <Pause className="h-4.5 w-4.5 text-amber-500" />
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
              ? "border-red-500 bg-red-50/10 ring-2 ring-red-500/20"
              : "hover:border-red-300 dark:hover:border-red-700"
          }`}
          onClick={() => setStatusFilter(statusFilter === "Canceled" ? "all" : "Canceled")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.canceledCount") || "Canceled"}
            </CardTitle>
            <XCircle className="h-4.5 w-4.5 text-red-500" />
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
        <Card className="relative overflow-hidden border-cyan-200/50 transition-all duration-300 hover:shadow-md dark:border-cyan-800/30">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-cyan-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.arpu") || "ARPU"}
            </CardTitle>
            <UserCheck className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-cyan-700 dark:text-cyan-400">
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
              ? "border-red-300/70 dark:border-red-700/50"
              : kpis.churnRate > 5
                ? "border-amber-200/50 dark:border-amber-800/30"
                : "border-teal-200/50 dark:border-teal-800/30"
          }`}
        >
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-amber-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.churnRate") || "Churn Rate"}
            </CardTitle>
            <Percent
              className={`h-4.5 w-4.5 ${
                kpis.churnRate > 10
                  ? "text-red-500"
                  : kpis.churnRate > 5
                    ? "text-amber-500"
                    : "text-teal-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-extrabold tabular-nums ${
                kpis.churnRate > 10
                  ? "text-red-600 dark:text-red-400"
                  : kpis.churnRate > 5
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-teal-700 dark:text-teal-400"
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
        <Card className="relative overflow-hidden border-indigo-200/50 transition-all duration-300 hover:shadow-md dark:border-indigo-800/30">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-indigo-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.renewals") || "Upcoming Renewals"}
            </CardTitle>
            <CalendarClock className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
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
        <Card className="relative overflow-hidden border-pink-200/50 transition-all duration-300 hover:shadow-md dark:border-pink-800/30">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-pink-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpi.promoDiscount") || "Active Discounts"}
            </CardTitle>
            <Tag className="h-4.5 w-4.5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tabular-nums text-pink-700 dark:text-pink-400">
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
