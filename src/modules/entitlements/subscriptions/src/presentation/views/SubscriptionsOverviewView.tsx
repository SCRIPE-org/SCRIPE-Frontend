/**
 * Subscriptions Overview View — Global Dashboard
 *
 * Comprehensive subscription dashboard with:
 * - 8 KPI cards (financial + counts)
 * - Distribution charts (status, type, revenue by edition)
 * - Upcoming renewals timeline
 * - Filterable data table
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSubscriptionsOverviewViewModel } from "../viewmodels/useSubscriptionsOverviewViewModel";
import { SubscriptionsExportDialog } from "../components/SubscriptionsExportDialog";
import { CurrencyDisplayToggle } from "@core/ui/currency-display-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from "@core/ui/table";
import {
      DollarSign,
      CreditCard,
      Clock,
      Users,
      RefreshCw,
      Search,
      ArrowRight,
      TrendingUp,
      FileDown,
      AlertTriangle,
      XCircle,
      Pause,
      BarChart3,
      CalendarClock,
      Tag,
} from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

const STATUS_COLORS: Record<string, string> = {
      Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
      Trialing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      Suspended: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      Canceled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
      Expired: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400", // FE3
      GracePeriod: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
};

const TYPE_COLORS: Record<string, string> = {
      Monthly: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
      Yearly: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
      Lifetime: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
      Trial: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
};

export function SubscriptionsOverviewView() {
  useModuleLocales(() => import("../../../../locales"), "entitlements-shared");
      const router = useRouter();
      const vm = useSubscriptionsOverviewViewModel();
      const [exportOpen, setExportOpen] = useState(false);

      // ── Loading ──
      if (vm.isLoading) {
            return (
                  <div className="space-y-6">
                        <div className="flex items-center justify-between">
                              <div>
                                    <Skeleton className="h-8 w-64" />
                                    <Skeleton className="h-4 w-96 mt-2" />
                              </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-4">
                              {Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} className="h-24 rounded-xl" />
                              ))}
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                              {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-64 rounded-xl" />
                              ))}
                        </div>
                        <Skeleton className="h-96 rounded-xl" />
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  {/* ── Header ── */}
                  <div className="flex items-start justify-between">
                        <div>
                              <h1 className="text-2xl font-bold tracking-tight">
                                    {vm.t("entitlements.subscriptions.overviewTitle") || "Subscriptions Overview"}
                              </h1>
                              <p className="text-muted-foreground">
                                    {vm.t("entitlements.subscriptions.overviewDesc") || "All active subscriptions across all tenants"}
                              </p>
                        </div>
                        <div className="flex items-center gap-2">
                              <CurrencyDisplayToggle />
                              <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1.5">
                                    <FileDown className="h-3.5 w-3.5" />
                                    {vm.t("entitlements.subscriptions.export.button") || "Export"}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-1.5">
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    {vm.t("common.refresh") || "Refresh"}
                              </Button>
                        </div>
                  </div>

                  {/* ══════════════════════════════════════════════════ */}
                  {/* ROW 1: Financial KPI Cards                        */}
                  {/* ══════════════════════════════════════════════════ */}
                  <div className="grid gap-4 md:grid-cols-4">
                        {/* MRR */}
                        <Card className="relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/30">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("dashboard.kpi.totalMrr") || "Monthly Recurring Revenue"}
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                                          {vm.formatDisplay(vm.kpis.totalMrr, "USD")}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.mrrDesc") || "Active recurring revenue per month"}
                                    </p>
                              </CardContent>
                        </Card>

                        {/* Gross Revenue */}
                        <Card className="relative overflow-hidden border-blue-200/50 dark:border-blue-800/30">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("dashboard.kpi.totalRevenue") || "Gross Revenue"}
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
                                          {vm.formatDisplay(vm.kpis.totalRevenue, "USD")}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.revenueDesc") || "Active + Trialing + Suspended"}
                                    </p>
                              </CardContent>
                        </Card>

                        {/* Total Refunded */}
                        <Card className="relative overflow-hidden border-red-200/50 dark:border-red-800/30">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("dashboard.kpi.totalRefunded") || "Total Refunded"}
                                    </CardTitle>
                                    <XCircle className="h-4 w-4 text-red-500" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                                          {vm.formatDisplay(vm.kpis.totalRefunded, "USD")}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.refundedDesc") || "Across all subscriptions"}
                                    </p>
                              </CardContent>
                        </Card>

                        {/* Net Revenue */}
                        <Card className="relative overflow-hidden border-violet-200/50 dark:border-violet-800/30">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("dashboard.kpi.netRevenue") || "Net Revenue"}
                                    </CardTitle>
                                    <BarChart3 className="h-4 w-4 text-violet-600" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums text-violet-700 dark:text-violet-400">
                                          {vm.formatDisplay(vm.kpis.netRevenue, "USD")}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.netRevenueDesc") || "Revenue minus refunds"}
                                    </p>
                              </CardContent>
                        </Card>
                  </div>

                  {/* ══════════════════════════════════════════════════ */}
                  {/* ROW 2: Count KPI Cards                            */}
                  {/* ══════════════════════════════════════════════════ */}
                  <div className="grid gap-4 md:grid-cols-4">
                        {/* Active */}
                        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
                              onClick={() => vm.setStatusFilter("Active")}>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("entitlements.subscriptions.activeCount") || "Active"}
                                    </CardTitle>
                                    <CreditCard className="h-4 w-4 text-emerald-500" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">{vm.kpis.activeCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.activeDesc") || "Paying tenants"}
                                    </p>
                              </CardContent>
                        </Card>

                        {/* Trialing */}
                        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                              onClick={() => vm.setStatusFilter("Trialing")}>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("entitlements.subscriptions.trialCount") || "Trialing"}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-blue-500" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">{vm.kpis.trialCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.trialDesc") || "In trial period"}
                                    </p>
                              </CardContent>
                        </Card>

                        {/* Suspended */}
                        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700"
                              onClick={() => vm.setStatusFilter("Suspended")}>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("dashboard.kpi.suspendedCount") || "Suspended"}
                                    </CardTitle>
                                    <Pause className="h-4 w-4 text-amber-500" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">{vm.kpis.suspendedCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.suspendedDesc") || "Temporarily paused"}
                                    </p>
                              </CardContent>
                        </Card>

                        {/* Canceled */}
                        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-red-300 dark:hover:border-red-700"
                              onClick={() => vm.setStatusFilter("Canceled")}>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("dashboard.kpi.canceledCount") || "Canceled"}
                                    </CardTitle>
                                    <XCircle className="h-4 w-4 text-red-500" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">{vm.kpis.canceledCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {vm.t("dashboard.kpi.canceledDesc") || "Ended subscriptions"}
                                    </p>
                              </CardContent>
                        </Card>
                  </div>

                  {/* ══════════════════════════════════════════════════ */}
                  {/* ROW 3: Charts                                     */}
                  {/* ══════════════════════════════════════════════════ */}
                  <div className="grid gap-4 md:grid-cols-3">
                        {/* Status Distribution — Doughnut */}
                        <Card>
                              <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <Users className="h-4 w-4 text-muted-foreground" />
                                          {vm.t("dashboard.chart.statusDist") || "Status Distribution"}
                                    </CardTitle>
                              </CardHeader>
                              <CardContent>
                                    <div className="flex items-center gap-6">
                                          {/* Doughnut */}
                                          <div className="relative shrink-0">
                                                <div
                                                      className="w-32 h-32 rounded-full"
                                                      style={{
                                                            background: vm.statusDistribution.length > 0
                                                                  ? `conic-gradient(${vm.statusDistribution
                                                                        .reduce<{ segments: string[]; offset: number }>((acc, item) => {
                                                                              const end = acc.offset + item.percentage;
                                                                              acc.segments.push(`${item.color} ${acc.offset}% ${end}%`);
                                                                              acc.offset = end;
                                                                              return acc;
                                                                        }, { segments: [], offset: 0 })
                                                                        .segments.join(", ")})`
                                                                  : "#e5e7eb",
                                                      }}
                                                >
                                                      <div className="absolute inset-3 bg-card rounded-full flex items-center justify-center">
                                                            <div className="text-center">
                                                                  <div className="text-lg font-bold tabular-nums">{vm.kpis.totalCount}</div>
                                                                  <div className="text-[10px] text-muted-foreground">{vm.t("common.total") || "Total"}</div>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                          {/* Legend */}
                                          <div className="flex-1 space-y-2">
                                                {vm.statusDistribution.map(item => (
                                                      <div key={item.status} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                                  <span className="text-muted-foreground">
                                                                        {vm.t(`tenant.statusLabel.${item.status.toLowerCase()}`) || item.status}
                                                                  </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 tabular-nums">
                                                                  <span className="font-medium">{item.count}</span>
                                                                  <span className="text-[10px] text-muted-foreground w-12 text-right">{item.percentage}%</span>
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Type Distribution — Doughnut */}
                        <Card>
                              <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                                          {vm.t("dashboard.chart.typeDist") || "Type Distribution"}
                                    </CardTitle>
                              </CardHeader>
                              <CardContent>
                                    <div className="flex items-center gap-6">
                                          {/* Doughnut */}
                                          <div className="relative shrink-0">
                                                <div
                                                      className="w-32 h-32 rounded-full"
                                                      style={{
                                                            background: vm.typeDistribution.length > 0
                                                                  ? `conic-gradient(${vm.typeDistribution
                                                                        .reduce<{ segments: string[]; offset: number }>((acc, item) => {
                                                                              const end = acc.offset + item.percentage;
                                                                              acc.segments.push(`${item.color} ${acc.offset}% ${end}%`);
                                                                              acc.offset = end;
                                                                              return acc;
                                                                        }, { segments: [], offset: 0 })
                                                                        .segments.join(", ")})`
                                                                  : "#e5e7eb",
                                                      }}
                                                >
                                                      <div className="absolute inset-3 bg-card rounded-full flex items-center justify-center">
                                                            <div className="text-center">
                                                                  <div className="text-lg font-bold tabular-nums">{vm.kpis.totalCount}</div>
                                                                  <div className="text-[10px] text-muted-foreground">{vm.t("common.total") || "Total"}</div>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                          {/* Legend */}
                                          <div className="flex-1 space-y-2">
                                                {vm.typeDistribution.map(item => (
                                                      <div key={item.type} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                                  <span className="text-muted-foreground">
                                                                        {vm.t(`tenant.typeLabel.${item.type.toLowerCase()}`) || item.type}
                                                                  </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 tabular-nums">
                                                                  <span className="font-medium">{item.count}</span>
                                                                  <span className="text-[10px] text-muted-foreground w-12 text-right">{item.percentage}%</span>
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Revenue by Edition — Horizontal Bar */}
                        <Card>
                              <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                          {vm.t("dashboard.chart.revenueByEdition") || "Revenue by Edition"}
                                    </CardTitle>
                              </CardHeader>
                              <CardContent>
                                    {vm.revenueByEdition.length === 0 ? (
                                          <div className="flex items-center justify-center h-36 text-sm text-muted-foreground">
                                                {vm.t("common.noData") || "No revenue data"}
                                          </div>
                                    ) : (
                                          <div className="space-y-3">
                                                {vm.revenueByEdition.map(item => (
                                                      <div key={item.edition} className="space-y-1.5">
                                                            <div className="flex items-center justify-between text-sm">
                                                                  <span className="font-medium truncate max-w-[140px]">{item.edition}</span>
                                                                  <span className="tabular-nums text-muted-foreground">
                                                                        {vm.formatDisplay(item.revenue, "USD")}
                                                                  </span>
                                                            </div>
                                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                                  <div
                                                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                                                        style={{
                                                                              width: `${item.percentage}%`,
                                                                              backgroundColor: item.color,
                                                                        }}
                                                                  />
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </CardContent>
                        </Card>
                  </div>

                  {/* ══════════════════════════════════════════════════ */}
                  {/* ROW 4: Upcoming Renewals                          */}
                  {/* ══════════════════════════════════════════════════ */}
                  {vm.upcomingRenewals.length > 0 && (
                        <Card className="border-amber-200/50 dark:border-amber-800/30">
                              <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <CalendarClock className="h-4 w-4 text-amber-500" />
                                          {vm.t("entitlements.subscriptions.upcomingRenewals") || "Upcoming Renewals"}
                                          <Badge variant="secondary" className="ml-auto text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                                {vm.upcomingRenewals.length}
                                          </Badge>
                                    </CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                    <div className="divide-y">
                                          {vm.upcomingRenewals.slice(0, 5).map(sub => (
                                                <div
                                                      key={sub.id}
                                                      className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                                      onClick={() => router.push(`/tenants/${sub.tenantId}`)}
                                                >
                                                      <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${sub.daysLeft <= 7 ? "bg-red-500 animate-pulse" : sub.daysLeft <= 14 ? "bg-amber-500" : "bg-emerald-500"}`} />
                                                            <div>
                                                                  <span className="text-sm font-medium">{sub.tenantName}</span>
                                                                  <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-xs text-muted-foreground">{sub.editionName}</span>
                                                                        <Badge variant="secondary" className={`${TYPE_COLORS[sub.type] || ""} text-[9px] h-4`}>
                                                                              {vm.t(`tenant.typeLabel.${sub.type.toLowerCase()}`) || sub.type}
                                                                        </Badge>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                      <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                  <div className="text-sm font-medium tabular-nums">
                                                                        {vm.formatDisplay(sub.totalAmount, sub.currency)}
                                                                  </div>
                                                                  <div className={`text-xs tabular-nums ${sub.daysLeft <= 7 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                                                        {sub.daysLeft === 1
                                                                              ? (vm.t("dashboard.renewal.tomorrow") || "Renews tomorrow")
                                                                              : `${sub.daysLeft} ${vm.t("dashboard.renewal.daysLeft") || "days left"}`
                                                                        }
                                                                  </div>
                                                            </div>
                                                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </CardContent>
                        </Card>
                  )}

                  {/* ══════════════════════════════════════════════════ */}
                  {/* ROW 5: Filters + Table                            */}
                  {/* ══════════════════════════════════════════════════ */}
                  <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder={vm.t("common.search") || "Search by tenant or edition..."}
                                    value={vm.search}
                                    onChange={(e) => vm.setSearch(e.target.value)}
                                    className="pl-9"
                              />
                        </div>
                        <div className="flex items-center gap-2">
                              {["all", "Active", "Trialing", "Suspended", "Canceled"].map((status) => {
                                    const statusLabels: Record<string, string> = {
                                          all: vm.t("common.all") || "All",
                                          Active: vm.t("tenant.statusLabel.active") || "Active",
                                          Trialing: vm.t("tenant.statusLabel.trialing") || "Trialing",
                                          Suspended: vm.t("tenant.statusLabel.suspended") || "Suspended",
                                          Canceled: vm.t("tenant.statusLabel.canceled") || "Canceled",
                                    };
                                    return (
                                          <Button
                                                key={status}
                                                variant={vm.statusFilter === status ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => vm.setStatusFilter(status)}
                                                className="text-xs"
                                          >
                                                {statusLabels[status] || status}
                                          </Button>
                                    );
                              })}
                        </div>
                        <div className="flex items-center gap-2">
                              {["all", "Monthly", "Yearly", "Lifetime", "Trial"].map((type) => {
                                    const typeLabels: Record<string, string> = {
                                          all: vm.t("common.all") || "All",
                                          Monthly: vm.t("tenant.typeLabel.monthly") || "Monthly",
                                          Yearly: vm.t("tenant.typeLabel.yearly") || "Yearly",
                                          Lifetime: vm.t("tenant.typeLabel.lifetime") || "Lifetime",
                                          Trial: vm.t("tenant.typeLabel.trial") || "Trial",
                                    };
                                    return (
                                          <Button
                                                key={type}
                                                variant={vm.typeFilter === type ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => vm.setTypeFilter(type)}
                                                className="text-xs"
                                          >
                                                {typeLabels[type] || type}
                                          </Button>
                                    );
                              })}
                        </div>
                  </div>

                  {/* ── Data Table ── */}
                  <Card>
                        <CardContent className="p-0">
                              <Table>
                                    <TableHeader>
                                          <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[50px]">#</TableHead>
                                                <TableHead>{vm.t("common.tenant") || "Tenant"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.edition") || "Edition"}</TableHead>
                                                <TableHead>{vm.t("common.status") || "Status"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.type") || "Type"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.amount") || "Amount"}</TableHead>
                                                <TableHead>{vm.t("tenant.promoCode") || "Promo"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.mrrContribution") || "MRR (USD)"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.startDate") || "Start Date"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.endDate") || "End Date"}</TableHead>
                                                <TableHead className="w-[60px]"></TableHead>
                                          </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {vm.subscriptions.length === 0 ? (
                                                <TableRow>
                                                      <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                                                            {vm.t("common.noResults") || "No subscriptions found"}
                                                      </TableCell>
                                                </TableRow>
                                          ) : (
                                                vm.subscriptions.map((sub, idx) => {
                                                      const mrr =
                                                            // FE2: only calculate MRR for active subscriptions
                                                            (sub.status === "Canceled" || sub.status === "Expired") ? 0
                                                                  : sub.type === "Lifetime" ? 0
                                                                        : sub.type === "Yearly" ? sub.totalAmountUsd / 12
                                                                              : sub.totalAmountUsd;

                                                      return (
                                                            <TableRow
                                                                  key={sub.id}
                                                                  className="cursor-pointer transition-colors hover:bg-muted/50"
                                                                  onClick={() => router.push(`/tenants/${sub.tenantId}`)}
                                                            >
                                                                  <TableCell className="text-muted-foreground tabular-nums">
                                                                        {idx + 1}
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <span className="font-medium text-sm">{sub.tenantName}</span>
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <div className="flex flex-col">
                                                                              <span className="font-medium">{sub.editionName}</span>
                                                                              {sub.isDowngraded && (
                                                                                    <span className="text-[10px] text-amber-600">{vm.t("tenant.downgrade") || "Downgraded"}</span>
                                                                              )}
                                                                        </div>
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <Badge variant="secondary" className={STATUS_COLORS[sub.status] || ""}>
                                                                              {vm.t(`tenant.statusLabel.${sub.status.toLowerCase()}`) || sub.status}
                                                                        </Badge>
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <Badge variant="secondary" className={TYPE_COLORS[sub.type] || ""}>
                                                                              {vm.t(`tenant.typeLabel.${sub.type.toLowerCase()}`) || sub.type}
                                                                        </Badge>
                                                                  </TableCell>
                                                                  <TableCell className="tabular-nums font-medium">
                                                                        {vm.formatDisplay(sub.totalAmount, sub.currency)}
                                                                  </TableCell>
                                                                  <TableCell className="text-xs">
                                                                        {sub.appliedPromoCode ? (
                                                                              <div className="flex flex-col gap-0.5">
                                                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] w-fit">
                                                                                          🏷️ {sub.appliedPromoCode}
                                                                                    </Badge>
                                                                                    {sub.promotionDiscount != null && sub.promotionDiscount > 0 && (
                                                                                          <span className="text-[10px] text-emerald-600">−{vm.formatDisplay(sub.promotionDiscount, sub.currency)}</span>
                                                                                    )}
                                                                              </div>
                                                                        ) : (
                                                                              <span className="text-muted-foreground">—</span>
                                                                        )}
                                                                  </TableCell>
                                                                  <TableCell className="tabular-nums text-muted-foreground">
                                                                        {vm.formatDisplay(mrr, "USD")}
                                                                        <span className="text-[10px]">/mo</span>
                                                                  </TableCell>
                                                                  <TableCell className="text-xs tabular-nums">
                                                                        {new Date(sub.startDate).toLocaleDateString(undefined, {
                                                                              year: "numeric", month: "short", day: "numeric",
                                                                        })}
                                                                  </TableCell>
                                                                  <TableCell className="text-xs tabular-nums">
                                                                        {sub.endDate
                                                                              ? new Date(sub.endDate).toLocaleDateString(undefined, {
                                                                                    year: "numeric", month: "short", day: "numeric",
                                                                              })
                                                                              : "∞"}
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <Button
                                                                              variant="ghost"
                                                                              size="icon"
                                                                              className="h-7 w-7"
                                                                              onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    router.push(`/tenants/${sub.tenantId}`);
                                                                              }}
                                                                        >
                                                                              <ArrowRight className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                  </TableCell>
                                                            </TableRow>
                                                      );
                                                })
                                          )}
                                    </TableBody>
                              </Table>
                        </CardContent>
                  </Card>

                  {/* ── Footer stats ── */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                              {vm.subscriptions.length} of {vm.kpis.totalCount} {vm.t("common.total") || "total"}
                        </span>
                        <div className="flex items-center gap-4">
                              {vm.kpis.totalPromoDiscount > 0 && (
                                    <span className="flex items-center gap-1">
                                          <Tag className="h-3 w-3" />
                                          {vm.t("dashboard.footer.promoDiscount") || "Promo discounts"}: {vm.formatDisplay(vm.kpis.totalPromoDiscount, "USD")}
                                    </span>
                              )}
                              <span>
                                    {vm.t("entitlements.subscriptions.totalMrr") || "Total MRR"}: {vm.formatDisplay(vm.kpis.totalMrr, "USD")}
                              </span>
                        </div>
                  </div>

                  {/* ── Export Dialog ── */}
                  <SubscriptionsExportDialog
                        open={exportOpen}
                        onClose={() => setExportOpen(false)}
                        statusFilter={vm.statusFilter}
                        typeFilter={vm.typeFilter}
                        totalCount={vm.kpis.totalCount}
                  />
            </div>
      );
}
