"use client";

/**
 * Tenant Analytics View
 *
 * Professional platform-level analytics and tenant intelligence surface.
 * Conforms strictly to SCRIPE Monitoring Information Architecture:
 * Monitoring → Tenant Analytics
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTenantAnalyticsViewModel } from "../viewmodels/useTenantAnalyticsViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { TenantAnalyticsHeader } from "../components/TenantAnalyticsHeader";
import { TenantAnalyticsKpis } from "../components/TenantAnalyticsKpis";
import { TenantGrowthChart } from "../components/TenantGrowthChart";
import { TenantRegionDistribution } from "../components/TenantRegionDistribution";
import { TenantActivityDistribution } from "../components/TenantActivityDistribution";
import { TenantEditionDistribution } from "../components/TenantEditionDistribution";
import { TenantFeatureAdoption } from "../components/TenantFeatureAdoption";
import { TenantStatusDistribution } from "../components/TenantStatusDistribution";
import { TenantTableSection } from "../components/TenantTableSection";

const ReportExportDialog = dynamic(
  () => import("@core/ui/report-export-dialog").then((m) => ({ default: m.ReportExportDialog })),
  { ssr: false }
);

/**
 * TenantAnalyticsView
 */
export function TenantAnalyticsView() {
  useModuleLocales(() => import("../../../locales"), "analytics");

  const vm = useTenantAnalyticsViewModel();
  const [exportOpen, setExportOpen] = useState(false);

  const timeRangeLabelMap: Record<string, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "12m": "Last 12 months",
  };
  const currentTimeRangeLabel = timeRangeLabelMap[vm.timeRange] ?? "Last 30 days";

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header with Controls */}
      <TenantAnalyticsHeader
        timeRange={vm.timeRange}
        setTimeRange={vm.setTimeRange}
        regionFilter={vm.regionFilter}
        setRegionFilter={vm.setRegionFilter}
        availableRegions={vm.availableRegions}
        statusFilter={vm.statusFilter}
        setStatusFilter={vm.setStatusFilter}
        availableStatuses={vm.availableStatuses}
        editionFilter={vm.editionFilter}
        setEditionFilter={vm.setEditionFilter}
        availableEditions={vm.availableEditions}
        isRefetching={vm.isRefetching}
        onRefresh={vm.refetchAll}
        onExport={() => setExportOpen(true)}
      />

      {/* 2. Top KPI Summary */}
      <TenantAnalyticsKpis
        kpis={vm.kpis}
        isLoading={vm.isLoading}
        timeRangeLabel={currentTimeRangeLabel}
      />

      {/* 3. Middle Section: Growth, Region, Activity */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <TenantGrowthChart
          data={vm.tenantGrowthData}
          isLoading={vm.isLoading}
          timeRangeLabel={currentTimeRangeLabel}
        />
        <TenantRegionDistribution data={vm.regionDistribution} isLoading={vm.isLoading} />
        <TenantActivityDistribution
          data={vm.activityDistribution}
          isLoading={vm.isLoading}
          totalTenants={vm.kpis.totalTenants}
        />
      </div>

      {/* 4. Lower Analytics Row: Editions, Features, Status */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <TenantEditionDistribution data={vm.editionDistribution} isLoading={vm.isLoading} />
        <TenantFeatureAdoption data={vm.featureAdoption} isLoading={vm.isLoading} />
        <TenantStatusDistribution
          data={vm.statusDistribution}
          isLoading={vm.isLoading}
          totalTenants={vm.kpis.totalTenants}
        />
      </div>

      {/* 5. Actionable Tenants Table */}
      <TenantTableSection
        tenants={vm.tenants}
        totalCount={vm.totalTenantsCount}
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        page={vm.page}
        setPage={vm.setPage}
        totalPages={vm.totalPages}
        isLoading={vm.isLoading}
      />

      {/* Export Dialog */}
      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={vm.exportEndpoint}
        titleKey="export.analytics.title"
        descriptionKey="export.analytics.description"
      />
    </div>
  );
}
