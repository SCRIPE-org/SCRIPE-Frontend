"use client";

/**
 * Tenant Analytics View
 *
 * Pure UI composition — tenant KPIs, distribution pie, login comparison chart.
 * Includes export functionality with interval-based date selection.
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTenantAnalyticsViewModel } from "../viewmodels/useTenantAnalyticsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { TenantMetricsCards } from "../components/TenantMetricsCards";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { Button } from "@core/ui/button";
import { BarChart3, FileDown } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// Lazy-load chart components (below-the-fold)
const AdminDistributionPie = dynamic(() => import("../components/AdminDistributionPie").then(m => ({ default: m.AdminDistributionPie })), { ssr: false });
const LoginComparisonChart = dynamic(() => import("../components/LoginComparisonChart").then(m => ({ default: m.LoginComparisonChart })), { ssr: false });
const ReportExportDialog = dynamic(() => import("@core/ui/report-export-dialog").then(m => ({ default: m.ReportExportDialog })), { ssr: false });

export function TenantAnalyticsView() {
  useModuleLocales(() => import("../../../locales"), "analytics");

  const vm = useTenantAnalyticsViewModel();
  const { t } = useI18n();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BarChart3 className="h-6 w-6" />
            {t("tenantAnalytics.title")}
          </h1>
          <p className="text-muted-foreground">{t("tenantAnalytics.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1.5">
          <FileDown className="h-4 w-4" />
          {t("export.button")}
        </Button>
      </div>

      {/* KPI Cards */}
      <TenantMetricsCards
        data={vm.metrics.data}
        isLoading={vm.metrics.isLoading}
        error={vm.metrics.error}
        onRetry={() => vm.metrics.refetch()}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminDistributionPie
          data={vm.distribution.data ?? []}
          isLoading={vm.distribution.isLoading}
          error={vm.distribution.error}
          onRetry={() => vm.distribution.refetch()}
        />
        <LoginComparisonChart
          data={vm.comparison.data ?? []}
          isLoading={vm.comparison.isLoading}
          error={vm.comparison.error}
          onRetry={() => vm.comparison.refetch()}
        />
      </div>

      {/* Export Dialog */}
      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={API_ENDPOINTS.DASHBOARD.EXPORT_ANALYTICS}
        titleKey="export.analytics.title"
        descriptionKey="export.analytics.description"
      />
    </div>
  );
}
