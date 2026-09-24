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
import { useAdminContext } from "@core/hooks/useAdminContext";
import { Badge } from "@core/ui/badge";

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
 * Presentation UI component rendering the analytics view.
 * Dynamically adjusts context between Platform Intelligence (cross-tenant)
 * and Workspace Insights (organization-scoped).
 */
export function TenantAnalyticsView() {
  useModuleLocales(() => import("../../../locales"), "analytics");

  const vm = useTenantAnalyticsViewModel();
  const { t } = useI18n();
  const { isPlatform, activeTenantName } = useAdminContext();
  const [exportOpen, setExportOpen] = useState(false);
  const pathname = usePathname();
  const isStandalone = pathname === "/analytics";

  const theme = useDashboardTheme();
  const { cardClasses } = theme;

  const title = isPlatform
    ? "Platform Intelligence"
    : "Workspace Insights & Adoption";

  const subtitle = isPlatform
    ? "Cross-tenant adoption, administrator activity distribution, and platform authentication trends"
    : `Usage analytics, team adoption, and authentication activity for ${activeTenantName || "this organization"}`;

  return (
    <div className="space-y-6">
      {isStandalone && (
        <PageHeader
          icon={BarChart3}
          title={title}
          description={subtitle}
          actions={
            <>
              <Badge variant="outline" className="px-2.5 py-1 text-xs">
                {isPlatform ? "Platform Context" : "Tenant Context"}
              </Badge>
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
