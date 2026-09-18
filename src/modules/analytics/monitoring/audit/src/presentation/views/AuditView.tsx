"use client";

/**
 * Audit View
 *
 * Pure UI composition — audit log listing with filters, table, detail dialog,
 * real-time SignalR connection status, and professional export dialog.
 * SOLID: ~80 lines, zero logic — all delegated to ViewModels.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useAuditViewModel } from "../viewmodels/useAuditViewModel";
import { useAuditRealtime } from "../viewmodels/useAuditRealtime";
import { useI18n } from "@core/providers/i18n-provider";
import { AuditFilterPanel } from "../components/AuditFilterPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { FileText, Radio, Download, Settings2 } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useDashboardTheme, DashboardStudioPanel } from "@modules/monitoring/core";
import { useAdminContext } from "@core/hooks/useAdminContext";

// Lazy-load table and dialog components
const AuditLogTable = dynamic(
  () => import("../components/AuditLogTable").then((m) => ({ default: m.AuditLogTable })),
  { ssr: false }
);
const AuditDetailDialog = dynamic(
  () => import("../components/AuditDetailDialog").then((m) => ({ default: m.AuditDetailDialog })),
  { ssr: false }
);
const AuditExportDialog = dynamic(
  () => import("../components/AuditExportDialog").then((m) => ({ default: m.AuditExportDialog })),
  { ssr: false }
);

// A live-status dot reads its state through colour alone — it does not pulse
// forever, which would turn "connecting" into permanent decoration instead of
// a transient state.
const connectionColors = {
  connected: "bg-success",
  connecting: "bg-warning",
  reconnecting: "bg-warning",
  disconnected: "bg-destructive",
} as const;

/**
 * Presentation UI component rendering the audit view.
 * Dynamically adjusts context between Platform Audit Explorer
 * and Tenant Audit & Governance Log.
 */
export function AuditView() {
  useModuleLocales(() => import("../../../locales"), "audit");

  const vm = useAuditViewModel();
  const realtime = useAuditRealtime();
  const { t } = useI18n();
  const { isPlatform, activeTenantName } = useAdminContext();
  const [exportOpen, setExportOpen] = useState(false);
  const pathname = usePathname();
  const isStandalone = pathname === "/audit";

  const theme = useDashboardTheme();
  const { cardClasses } = theme;

  const title = isPlatform
    ? "Platform Audit Explorer"
    : "Organization Audit & Governance Log";

  const subtitle = isPlatform
    ? "Comprehensive platform event stream, access verification, and cross-tenant compliance records"
    : `Recorded administrative events, role assignments, and governance history for ${activeTenantName || "this organization"}`;

  return (
    <div className="space-y-6">
      {isStandalone && (
        <PageHeader
          icon={FileText}
          title={title}
          description={subtitle}
          actions={
            <>
              <Badge variant="outline" className="px-2.5 py-1 text-xs">
                {isPlatform ? "Platform Audit" : "Tenant Audit"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportOpen(true)}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t("audit.export.button")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => theme.setIsStudioOpen(true)}
                className="gap-1.5"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                {t("dashboard.studio.openButton")}
              </Button>

              {/* Real-time connection status */}
              <Badge variant="outline" className="flex items-center gap-1.5 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${connectionColors[realtime.connectionState]}`}
                  aria-hidden="true"
                />
                <Radio className="h-3 w-3" aria-hidden="true" />
                {t(`audit.realtime.${realtime.connectionState}`)}
                {realtime.realtimeEventCount > 0 && (
                  <span className="ms-1 tabular-nums text-nx-ink-3">
                    ({realtime.realtimeEventCount})
                  </span>
                )}
              </Badge>
            </>
          }
        />
      )}

      {/* Filters */}
      <Card className={cardClasses}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("audit.filters.title")}</CardTitle>
          <CardDescription>{t("audit.filters.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditFilterPanel
            filters={vm.filters}
            updateFilter={vm.updateFilter}
            resetFilters={vm.resetFilters}
            hasActiveFilters={vm.hasActiveFilters}
          />
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className={cardClasses}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("audit.results.title")}</CardTitle>
            {vm.logs.data && (
              <span className="text-sm tabular-nums text-nx-ink-2">
                {t("audit.results.totalCount", { count: vm.logs.data.totalCount })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <AuditLogTable
            data={vm.logs.data}
            isLoading={vm.logs.isLoading}
            error={vm.logs.error}
            onRetry={() => vm.logs.refetch()}
            onRowClick={vm.openDetail}
            onPageChange={vm.setPage}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <AuditDetailDialog
        open={vm.selectedLogId !== null}
        onClose={vm.closeDetail}
        data={vm.detail.data}
        isLoading={vm.detail.isLoading}
      />

      {/* Export Dialog */}
      <AuditExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        filters={vm.filters}
      />

      {/* Dashboard Studio Panel (Standalone only) */}
      {isStandalone && (
        <DashboardStudioPanel
          open={theme.isStudioOpen}
          onClose={() => theme.setIsStudioOpen(false)}
          draft={theme.draft}
          onUpdateNested={theme.updateNested}
          onSave={theme.saveDraft}
          onDiscard={theme.discardDraft}
          onReset={theme.resetToDefault}
          isSaving={theme.isSaving}
          onBuilderCanvasChange={(canvas) => theme.updateDraft("builderCanvas", canvas)}
        />
      )}
    </div>
  );
}
