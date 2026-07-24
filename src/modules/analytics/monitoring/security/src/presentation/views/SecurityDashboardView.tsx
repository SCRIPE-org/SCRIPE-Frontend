"use client";

/**
 * Security Dashboard View
 *
 * Pure UI composition — security monitoring with threat cards, heatmap, blocked IPs, timeline.
 * Includes export functionality with interval-based date selection.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useSecurityDashboardViewModel } from "../viewmodels/useSecurityDashboardViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { ThreatSummaryCards } from "../components/ThreatSummaryCards";
import { SECURITY_ENDPOINTS } from "../../data/services/security.endpoints";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { Shield, FileDown, Settings2 } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useDashboardTheme, DashboardStudioPanel } from "@modules/monitoring/core";

// Lazy-load heavy sections (below-the-fold)
const FailedLoginsHeatmap = dynamic(
  () =>
    import("../components/FailedLoginsHeatmap").then((m) => ({ default: m.FailedLoginsHeatmap })),
  { ssr: false }
);
const BlockedIPsTable = dynamic(
  () => import("../components/BlockedIPsTable").then((m) => ({ default: m.BlockedIPsTable })),
  { ssr: false }
);
const SecurityTimeline = dynamic(
  () => import("../components/SecurityTimeline").then((m) => ({ default: m.SecurityTimeline })),
  { ssr: false }
);
const ReportExportDialog = dynamic(
  () => import("@core/ui/report-export-dialog").then((m) => ({ default: m.ReportExportDialog })),
  { ssr: false }
);

/**
 * Presentation UI component rendering the security dashboard view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SecurityDashboardView() {
  useModuleLocales(() => import("../../../locales"), "security");

  const vm = useSecurityDashboardViewModel();
  const { t } = useI18n();
  const [exportOpen, setExportOpen] = useState(false);
  const pathname = usePathname();
  const isStandalone = pathname === "/security";

  const theme = useDashboardTheme();
  const { cardClasses } = theme;

  return (
    <div className="space-y-6">
      {/* SecurityDashboardView is embedded as a tab inside DashboardView, which
          already carries its own PageHeader — rendering this one too would
          stack two icon-tile headers on the same screen. Only the standalone
          /security route gets the full header. */}
      {isStandalone && (
        <PageHeader
          icon={Shield}
          title={t("security.title")}
          description={t("security.subtitle")}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportOpen(true)}
                className="gap-1.5"
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                {t("export.button")}
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
            </>
          }
        />
      )}

      {/* Threat Summary Cards */}
      <ThreatSummaryCards
        data={vm.threats.data}
        isLoading={vm.threats.isLoading}
        error={vm.threats.error}
        onRetry={() => vm.threats.refetch()}
        cardClasses={cardClasses}
      />

      {/* Charts + Timeline Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FailedLoginsHeatmap
          data={vm.failedLogins.data}
          isLoading={vm.failedLogins.isLoading}
          error={vm.failedLogins.error}
          onRetry={() => vm.failedLogins.refetch()}
          cardClasses={cardClasses}
        />
        <SecurityTimeline
          data={vm.timeline.data ?? []}
          isLoading={vm.timeline.isLoading}
          error={vm.timeline.error}
          onRetry={() => vm.timeline.refetch()}
          cardClasses={cardClasses}
        />
      </div>

      {/* Blocked IPs Table */}
      <BlockedIPsTable
        data={vm.blockedIPs.data ?? []}
        isLoading={vm.blockedIPs.isLoading}
        error={vm.blockedIPs.error}
        onRetry={() => vm.blockedIPs.refetch()}
        cardClasses={cardClasses}
      />

      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={SECURITY_ENDPOINTS.EXPORT_SECURITY}
        titleKey="export.security.title"
        descriptionKey="export.security.description"
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
