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
import { PageHeader } from "@core/ui/page-header";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { FileDown, RefreshCw, Receipt } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

import { SubscriptionsKpiGrid } from "../components/SubscriptionsKpiGrid";
import { SubscriptionsDistributionCharts } from "../components/SubscriptionsDistributionCharts";
import { UpcomingRenewalsTimeline } from "../components/UpcomingRenewalsTimeline";
import { SubscriptionsDataTable } from "../components/SubscriptionsDataTable";

/**
 * Presentation UI component rendering the subscriptions overview view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubscriptionsOverviewView() {
  useModuleLocales(() => import("../../../../core/locales"), "entitlements-shared");
  const vm = useSubscriptionsOverviewViewModel();
  const [exportOpen, setExportOpen] = useState(false);

  if (vm.isLoading) {
    return <LoadingSkeleton />;
  }

  // A failed fetch must not render the same empty state as "you have zero
  // subscriptions" — the two mean very different things to an admin. Gated on
  // the unfiltered list so a stale/cached page (or a search that legitimately
  // matches nothing) never gets replaced by the error takeover.
  if (vm.error && vm.allSubscriptions.length === 0) {
    return <ErrorMessage message={vm.t("common.error")} onRetry={vm.refetch} fullHeight />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Receipt}
        title={vm.t("entSubscriptions.overviewTitle")}
        description={vm.t("entSubscriptions.overviewDesc")}
        actions={
          <>
            <CurrencyDisplayToggle />
            <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1.5">
              <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
              {vm.t("entSubscriptions.export.button")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              {vm.t("common.refresh")}
            </Button>
          </>
        }
      />

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
          <Skeleton shape="title" className="h-8 w-64" />
          <Skeleton shape="text" className="mt-2 w-96" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-nx-lg" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-nx-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-nx-lg" />
    </div>
  );
}
