/**
 * CommissionDashboardView
 * Platform-wide commission analytics page.
 *
 * Layout:
 *   [Header]
 *   [CommissionKpiCards]    — 6 KPI stat cards
 *   [CommissionChart]       — daily trend line chart
 *   [Top Tenants table]     — highest revenue tenants
 *
 * Architecture compliance:
 * - "use client" — all interaction is client-side
 * - Zero `any` types
 * - Zero hardcoded strings — all via t() locale keys
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useCommissionDashboardViewModel } from "../viewmodels/useCommissionDashboardViewModel";
import { CommissionKpiCards } from "../components/CommissionKpiCards";
import { CommissionChart } from "../components/CommissionChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { BarChart3 } from "lucide-react";

export function CommissionDashboardView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const { t } = useI18n();
  const vm = useCommissionDashboardViewModel();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          {t("entitlements.commissions.title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("entitlements.commissions.description")}
        </p>
      </div>

      {/* KPI Cards */}
      <CommissionKpiCards
        dashboard={vm.dashboard}
        isLoading={vm.isDashboardLoading}
        t={t}
      />

      {/* Trend Chart + Top Tenants — side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart takes 2/3 */}
        <div className="xl:col-span-2">
          <CommissionChart
            trends={vm.trends}
            isLoading={vm.isTrendsLoading}
            trendDays={vm.trendDays}
            onChangePeriod={vm.setTrendDays}
            t={t}
          />
        </div>

        {/* Top Tenants takes 1/3 */}
        <div className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">
                {t("entitlements.commissions.topTenantsTitle")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t("entitlements.commissions.topTenantsDesc")}
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {vm.isTopTenantsLoading ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  {t("common.loading") || "Loading..."}
                </div>
              ) : vm.topTenants.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  {t("entitlements.commissions.noData")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">
                        {t("entitlements.commissions.topTenantId")}
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        {t("entitlements.commissions.topTenantTotal")}
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        {t("entitlements.commissions.topTenantCount")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vm.topTenants.map((tenant, idx) => (
                      <TableRow key={tenant.tenantId}>
                        <TableCell className="text-xs font-mono truncate max-w-[100px]">
                          <span className="text-muted-foreground mr-1.5 tabular-nums">
                            {idx + 1}.
                          </span>
                          {tenant.tenantId}
                        </TableCell>
                        <TableCell className="text-xs text-right tabular-nums font-medium">
                          {fmt(tenant.totalCommission)}
                        </TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                          {new Intl.NumberFormat("en-US").format(tenant.transactionCount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
