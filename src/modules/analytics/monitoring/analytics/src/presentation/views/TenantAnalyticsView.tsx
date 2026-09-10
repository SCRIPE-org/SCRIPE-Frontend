"use client";

/**
 * Tenant Analytics View
 *
 * Pure UI composition — tenant KPIs, distribution pie, login comparison chart.
 * Includes export functionality with interval-based date selection.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTenantAnalyticsViewModel } from "../viewmodels/useTenantAnalyticsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { TenantMetricsCards } from "../components/TenantMetricsCards";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { BarChart3, FileDown, Settings2 } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useDashboardTheme, DashboardStudioPanel } from "@modules/monitoring/core";

// Lazy-load chart components (below-the-fold)
const AdminDistributionPie = dynamic(
  () =>
    import("../components/AdminDistributionPie").then((m) => ({ default: m.AdminDistributionPie })),
  { ssr: false }
);
const LoginComparisonChart = dynamic(
  () =>
    import("../components/LoginComparisonChart").then((m) => ({ default: m.LoginComparisonChart })),
  { ssr: false }
);
const ReportExportDialog = dynamic(
  () => import("@core/ui/report-export-dialog").then((m) => ({ default: m.ReportExportDialog })),
  { ssr: false }
);

/**
 * Presentation UI component rendering the tenant analytics view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantAnalyticsView() {
  useModuleLocales(() => import("../../../locales"), "analytics");

  const vm = useTenantAnalyticsViewModel();
  const { t } = useI18n();
  const [exportOpen, setExportOpen] = useState(false);
  const pathname = usePathname();
  const isStandalone = pathname === "/analytics";

  const theme = useDashboardTheme();
  const { cardClasses } = theme;

  return (
    <div className="space-y-6">
      {/* TenantAnalyticsView is embedded as a tab inside DashboardView, which
          already carries its own PageHeader — rendering this one too would
          stack two icon-tile headers on the same screen. Only the standalone
          /analytics route gets the full header. */}
      {isStandalone && (
        <PageHeader
          icon={BarChart3}
          title={t("tenantAnalytics.title")}
          description={t("tenantAnalytics.subtitle")}
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

      {/* KPI Cards */}
      <TenantMetricsCards
        data={vm.metrics.data}
        isLoading={vm.metrics.isLoading}
        error={vm.metrics.error}
        onRetry={() => vm.metrics.refetch()}
        cardClasses={cardClasses}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminDistributionPie
          data={vm.distribution.data ?? []}
          isLoading={vm.distribution.isLoading}
          error={vm.distribution.error}
          onRetry={() => vm.distribution.refetch()}
          cardClasses={cardClasses}
        />
        <LoginComparisonChart
          data={vm.comparison.data ?? []}
          isLoading={vm.comparison.isLoading}
          error={vm.comparison.error}
          onRetry={() => vm.comparison.refetch()}
          cardClasses={cardClasses}
        />
      </div>

      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={vm.exportEndpoint}
        titleKey="export.analytics.title"
        descriptionKey="export.analytics.description"
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
