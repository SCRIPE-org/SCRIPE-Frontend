"use client";

/**
 * Audit View
 *
 * Professional investigation-oriented platform audit console for SCRIPE Super Admins
 * and tenant compliance officers.
 * Conforms strictly to SCRIPE Monitoring Information Architecture:
 * Monitoring → Audit Log
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuditViewModel } from "../viewmodels/useAuditViewModel";
import { useAuditRealtime } from "../viewmodels/useAuditRealtime";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { AuditHeader } from "../components/AuditHeader";
import { AuditKpiSummary } from "../components/AuditKpiSummary";
import { AuditFilterPanel } from "../components/AuditFilterPanel";
import { AuditLogTable } from "../components/AuditLogTable";
import { AuditDetailDrawer } from "../components/AuditDetailDrawer";

// Lazy-load export dialog
const AuditExportDialog = dynamic(
  () => import("../components/AuditExportDialog").then((m) => ({ default: m.AuditExportDialog })),
  { ssr: false }
);

/**
 * AuditView
 */
export function AuditView() {
  useModuleLocales(() => import("../../../locales"), "audit");

  const vm = useAuditViewModel();
  const realtime = useAuditRealtime();
  const { t } = useI18n();
  const { isPlatform, activeTenantName } = useAdminContext();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Page Header with Breadcrumbs, Context, Real-time Live Badge & Controls */}
      <AuditHeader
        isPlatform={isPlatform}
        activeTenantName={activeTenantName}
        connectionState={realtime.connectionState}
        realtimeEventCount={realtime.realtimeEventCount}
        isRefetching={vm.isRefetching}
        onRefresh={vm.refetchAll}
        onExport={() => setExportOpen(true)}
      />

      {/* 2. KPI Summary Strip (Total Events, Today's Velocity, Failures, Active Services) */}
      <AuditKpiSummary
        kpis={vm.kpis}
        isLoading={vm.logs.isLoading || vm.hubSummary.isLoading}
        hasActiveFilters={vm.hasActiveFilters}
        activeFilterCount={vm.activeFilterCount}
      />

      {/* 3. Enterprise Investigation Filter Toolbar */}
      <Card className="border-border/80 bg-card/90 shadow-2xs">
        <CardContent className="p-4">
          <AuditFilterPanel
            filters={vm.filters}
            updateFilter={vm.updateFilter}
            setDatePreset={vm.setDatePreset}
            resetFilters={vm.resetFilters}
            hasActiveFilters={vm.hasActiveFilters}
            activeFilterCount={vm.activeFilterCount}
          />
        </CardContent>
      </Card>

      {/* 4. Results Audit Trail Table */}
      <Card className="border-border/80 bg-card/90 shadow-2xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                {t("audit.results.title") || "Audit Event Records"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t("audit.results.description") ||
                  "Chronological ledger of security, administrative, and data mutations."}
              </CardDescription>
            </div>
            {vm.logs.data && (
              <span className="text-xs font-semibold tabular-nums text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/60">
                {t("audit.results.totalCount", { count: vm.logs.data.totalCount }) ||
                  `${vm.logs.data.totalCount.toLocaleString()} indexed records`}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <AuditLogTable
            data={vm.logs.data}
            isLoading={vm.logs.isLoading}
            error={vm.logs.error}
            onRetry={() => vm.logs.refetch()}
            onRowClick={vm.openDetail}
            onPageChange={vm.setPage}
            pageSize={vm.filters.pageSize}
            onPageSizeChange={vm.setPageSize}
          />
        </CardContent>
      </Card>

      {/* 5. Deep Investigation Slide-over Drawer */}
      <AuditDetailDrawer
        open={vm.selectedLogId !== null}
        onClose={vm.closeDetail}
        data={vm.detail.data}
        isLoading={vm.detail.isLoading}
        onQuickFilterByUser={vm.quickFilterByUser}
        onQuickFilterByCorrelationId={vm.quickFilterByCorrelationId}
      />

      {/* 6. Export Dialog */}
      <AuditExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        filters={vm.filters}
      />
    </div>
  );
}
