/**
 * Subscriptions Overview View — Global Dashboard
 *
 * Comprehensive subscription dashboard with:
 * - 12 KPI cards (financial + counts + business health)
 * - Distribution charts (status, type, revenue by edition)
 * - Upcoming renewals timeline
 * - Filterable data table
 */
"use client";

import { useState } from "react";
import { useSubscriptionsOverviewViewModel } from "../viewmodels/useSubscriptionsOverviewViewModel";
import { SubscriptionsExportDialog } from "../components/SubscriptionsExportDialog";
import { CurrencyDisplayToggle } from "@core/ui/currency-display-toggle";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { FileDown, RefreshCw } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

import { SubscriptionsKpiGrid } from "../components/SubscriptionsKpiGrid";
import { SubscriptionsDistributionCharts } from "../components/SubscriptionsDistributionCharts";
import { UpcomingRenewalsTimeline } from "../components/UpcomingRenewalsTimeline";
import { SubscriptionsDataTable } from "../components/SubscriptionsDataTable";

export function SubscriptionsOverviewView() {
  useModuleLocales(() => import("../../../../core/locales"), "entitlements-shared");
  const vm = useSubscriptionsOverviewViewModel();
  const [exportOpen, setExportOpen] = useState(false);

  if (vm.isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {vm.t("entSubscriptions.overviewTitle") || "Subscriptions Overview"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {vm.t("entSubscriptions.overviewDesc") || "All active subscriptions across all tenants"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyDisplayToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
            className="gap-1.5 transition-all"
          >
            <FileDown className="h-3.5 w-3.5" />
            {vm.t("entSubscriptions.export.button") || "Export"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.refetch()}
            className="gap-1.5 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {vm.t("common.refresh") || "Refresh"}
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <SubscriptionsKpiGrid
        kpis={vm.kpis}
        statusFilter={vm.statusFilter}
        setStatusFilter={vm.setStatusFilter}
        formatDisplay={vm.formatDisplay}
        t={vm.t}
      />

      {/* Recharts Distribution Charts */}
      <SubscriptionsDistributionCharts
        statusDistribution={vm.statusDistribution}
        typeDistribution={vm.typeDistribution}
        revenueByEdition={vm.revenueByEdition}
        totalCount={vm.kpis.totalCount}
        formatDisplay={vm.formatDisplay}
        t={vm.t}
      />

      {/* Upcoming Renewals Timeline */}
      <UpcomingRenewalsTimeline
        renewals={vm.upcomingRenewals}
        formatDisplay={vm.formatDisplay}
        t={vm.t}
      />

      {/* Filterable Subscriptions Data Table */}
      <SubscriptionsDataTable
        subscriptions={vm.subscriptions}
        search={vm.search}
        setSearch={vm.setSearch}
        statusFilter={vm.statusFilter}
        setStatusFilter={vm.setStatusFilter}
        typeFilter={vm.typeFilter}
        setTypeFilter={vm.setTypeFilter}
        totalCount={vm.kpis.totalCount}
        totalPromoDiscount={vm.kpis.totalPromoDiscount}
        totalMrr={vm.kpis.totalMrr}
        formatDisplay={vm.formatDisplay}
        t={vm.t}
      />

      {/* Export Dialog */}
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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
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
