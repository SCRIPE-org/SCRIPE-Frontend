/**
 * Subscriptions Overview View — Global
 *
 * Displays all active subscriptions across all tenants
 * with KPI cards, filters, and a data table.
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
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
      Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
      Trialing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      Suspended: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      Canceled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
      GracePeriod: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
};

const TYPE_COLORS: Record<string, string> = {
      Monthly: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
      Yearly: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
      Lifetime: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
      Trial: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
};

export function SubscriptionsOverviewView() {
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
                              {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-24 rounded-xl" />
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

                  {/* ── KPI Cards ── */}
                  <div className="grid gap-4 md:grid-cols-4">
                        <Card className="border-emerald-200/50 dark:border-emerald-800/30">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("dashboard.kpi.totalMrr") || "Monthly Recurring Revenue"}
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">
                                          {vm.formatDisplay(vm.kpis.totalMrr, "USD")}
                                    </div>
                              </CardContent>
                        </Card>

                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("entitlements.subscriptions.activeCount") || "Active Subscriptions"}
                                    </CardTitle>
                                    <CreditCard className="h-4 w-4 text-primary" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">{vm.kpis.activeCount}</div>
                              </CardContent>
                        </Card>

                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("entitlements.subscriptions.trialCount") || "Trial Subscriptions"}
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-blue-500" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">{vm.kpis.trialCount}</div>
                              </CardContent>
                        </Card>

                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          {vm.t("entitlements.subscriptions.renewalCount") || "Upcoming Renewals"}
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-amber-500" />
                              </CardHeader>
                              <CardContent>
                                    <div className="text-2xl font-bold tabular-nums">{vm.kpis.renewalCount}</div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                          {vm.t("entitlements.subscriptions.next30Days") || "Next 30 days"}
                                    </p>
                              </CardContent>
                        </Card>
                  </div>

                  {/* ── Filters ── */}
                  <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder={vm.t("common.search") || "Search by edition..."}
                                    value={vm.search}
                                    onChange={(e) => vm.setSearch(e.target.value)}
                                    className="pl-9"
                              />
                        </div>
                        <div className="flex items-center gap-2">
                              {["all", "Active", "Trialing", "Suspended", "Canceled"].map((status) => (
                                    <Button
                                          key={status}
                                          variant={vm.statusFilter === status ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => vm.setStatusFilter(status)}
                                          className="text-xs"
                                    >
                                          {status === "all" ? (vm.t("common.all") || "All") : status}
                                    </Button>
                              ))}
                        </div>
                        <div className="flex items-center gap-2">
                              {["all", "Monthly", "Yearly", "Lifetime", "Trial"].map((type) => (
                                    <Button
                                          key={type}
                                          variant={vm.typeFilter === type ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => vm.setTypeFilter(type)}
                                          className="text-xs"
                                    >
                                          {type === "all" ? (vm.t("common.all") || "All") : type}
                                    </Button>
                              ))}
                        </div>
                  </div>

                  {/* ── Table ── */}
                  <Card>
                        <CardContent className="p-0">
                              <Table>
                                    <TableHeader>
                                          <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[50px]">#</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.edition") || "Edition"}</TableHead>
                                                <TableHead>{vm.t("common.status") || "Status"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.type") || "Type"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.amount") || "Amount"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.mrrContribution") || "MRR (USD)"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.startDate") || "Start Date"}</TableHead>
                                                <TableHead>{vm.t("entitlements.subscriptions.endDate") || "End Date"}</TableHead>
                                                <TableHead className="w-[60px]"></TableHead>
                                          </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {vm.subscriptions.length === 0 ? (
                                                <TableRow>
                                                      <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                                            {vm.t("common.noResults") || "No subscriptions found"}
                                                      </TableCell>
                                                </TableRow>
                                          ) : (
                                                vm.subscriptions.map((sub, idx) => {
                                                      const mrr =
                                                            sub.type === "Lifetime" ? 0
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
                                                                        <div className="flex flex-col">
                                                                              <span className="font-medium">{sub.editionName}</span>
                                                                              {sub.isDowngraded && (
                                                                                    <span className="text-[10px] text-amber-600">Downgraded</span>
                                                                              )}
                                                                        </div>
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <Badge variant="secondary" className={STATUS_COLORS[sub.status] || ""}>
                                                                              {sub.status}
                                                                        </Badge>
                                                                  </TableCell>
                                                                  <TableCell>
                                                                        <Badge variant="secondary" className={TYPE_COLORS[sub.type] || ""}>
                                                                              {sub.type}
                                                                        </Badge>
                                                                  </TableCell>
                                                                  <TableCell className="tabular-nums font-medium">
                                                                        {vm.formatDisplay(sub.totalAmount, sub.currency)}
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
                        <span>
                              {vm.t("entitlements.subscriptions.totalMrr") || "Total MRR"}: {vm.formatDisplay(vm.kpis.totalMrr, "USD")}
                        </span>
                  </div>

                  {/* ── Export Dialog ── */}
                  <SubscriptionsExportDialog
                        open={exportOpen}
                        onClose={() => setExportOpen(false)}
                        subscriptions={vm.subscriptions}
                        statusFilter={vm.statusFilter}
                        typeFilter={vm.typeFilter}
                        totalCount={vm.kpis.totalCount}
                  />
            </div>
      );
}
