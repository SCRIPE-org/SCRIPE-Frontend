/**
 * CommissionDashboardView
 * Platform-wide commission analytics page.
 *
 * Layout:
 *   [PageHeader]
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
import { PageHeader } from "@core/ui/page-header";
import { SectionState } from "@core/ui/section-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { BarChart3 } from "lucide-react";

/**
 * Presentation UI component rendering the commission dashboard view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
    <div className="p-6">
      <PageHeader
        icon={BarChart3}
        title={t("entitlements.commissions.title")}
        description={t("entitlements.commissions.description")}
      />

      <div className="space-y-6">
        {/* KPI Cards */}
        <CommissionKpiCards dashboard={vm.dashboard} isLoading={vm.isDashboardLoading} t={t} />

        {/* Trend Chart + Top Tenants — side by side on large screens */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
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
                <CardDescription>{t("entitlements.commissions.topTenantsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <SectionState
                  isLoading={vm.isTopTenantsLoading}
                  isEmpty={vm.topTenants.length === 0}
                  emptyMessage={t("entitlements.commissions.noData")}
                  height={200}
                  skeletonType="rows"
                  skeletonRows={5}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("entitlements.commissions.topTenantId")}</TableHead>
                        <TableHead variant="numeric">
                          {t("entitlements.commissions.topTenantTotal")}
                        </TableHead>
                        <TableHead variant="numeric">
                          {t("entitlements.commissions.topTenantCount")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vm.topTenants.map((tenant, idx) => (
                        <TableRow key={tenant.tenantId}>
                          <TableCell className="max-w-[100px] truncate font-mono text-xs">
                            <span className="me-1.5 tabular-nums text-nx-ink-3">{idx + 1}.</span>
                            {tenant.tenantId}
                          </TableCell>
                          <TableCell variant="numeric" className="text-xs font-medium">
                            {fmt(tenant.totalCommission)}
                          </TableCell>
                          <TableCell variant="numeric" className="text-xs text-nx-ink-3">
                            {new Intl.NumberFormat("en-US").format(tenant.transactionCount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </SectionState>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
