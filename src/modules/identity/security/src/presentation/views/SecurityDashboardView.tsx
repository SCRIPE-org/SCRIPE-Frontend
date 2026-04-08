"use client";

/**
 * Security Dashboard View
 *
 * Pure UI composition — security monitoring with threat cards, heatmap, blocked IPs, timeline.
 * Includes export functionality with interval-based date selection.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { useSecurityDashboardViewModel } from "../viewmodels/useSecurityDashboardViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { ThreatSummaryCards } from "../components/ThreatSummaryCards";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { Button } from "@core/ui/button";
import { Shield, FileDown } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// Lazy-load heavy sections (below-the-fold)
const FailedLoginsHeatmap = dynamic(() => import("../components/FailedLoginsHeatmap").then(m => ({ default: m.FailedLoginsHeatmap })), { ssr: false });
const BlockedIPsTable = dynamic(() => import("../components/BlockedIPsTable").then(m => ({ default: m.BlockedIPsTable })), { ssr: false });
const SecurityTimeline = dynamic(() => import("../components/SecurityTimeline").then(m => ({ default: m.SecurityTimeline })), { ssr: false });
const ReportExportDialog = dynamic(() => import("@core/ui/report-export-dialog").then(m => ({ default: m.ReportExportDialog })), { ssr: false });

export function SecurityDashboardView() {
  useModuleLocales(() => import("../../../locales"), "security");

  const vm = useSecurityDashboardViewModel();
  const { t } = useI18n();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Shield className="h-6 w-6" />
            {t("security.title")}
          </h1>
          <p className="text-muted-foreground">{t("security.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1.5">
          <FileDown className="h-4 w-4" />
          {t("export.button")}
        </Button>
      </div>

      {/* Threat Summary Cards */}
      <ThreatSummaryCards
        data={vm.threats.data}
        isLoading={vm.threats.isLoading}
        error={vm.threats.error}
        onRetry={() => vm.threats.refetch()}
      />

      {/* Charts + Timeline Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FailedLoginsHeatmap
          data={vm.failedLogins.data}
          isLoading={vm.failedLogins.isLoading}
          error={vm.failedLogins.error}
          onRetry={() => vm.failedLogins.refetch()}
        />
        <SecurityTimeline
          data={vm.timeline.data ?? []}
          isLoading={vm.timeline.isLoading}
          error={vm.timeline.error}
          onRetry={() => vm.timeline.refetch()}
        />
      </div>

      {/* Blocked IPs Table */}
      <BlockedIPsTable
        data={vm.blockedIPs.data ?? []}
        isLoading={vm.blockedIPs.isLoading}
        error={vm.blockedIPs.error}
        onRetry={() => vm.blockedIPs.refetch()}
      />

      {/* Export Dialog */}
      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={API_ENDPOINTS.DASHBOARD.EXPORT_SECURITY}
        titleKey="export.security.title"
        descriptionKey="export.security.description"
      />
    </div>
  );
}
