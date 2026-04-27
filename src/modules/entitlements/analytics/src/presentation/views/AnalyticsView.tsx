"use client";
/**
 * AnalyticsView — Main Revenue Analytics dashboard with tab navigation.
 *
 * Data flow: View → useAnalyticsViewModel → Repository → Service → API
 *
 * Tabs: Overview | Revenue | Retention | LTV | Forecast | Health | Reports
 */
import { useAnalyticsViewModel, type AnalyticsTab } from "../viewmodels/useAnalyticsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import {
  BarChart3, TrendingUp, Users, DollarSign, Activity, Heart, FileText,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { OverviewTab } from "../components/OverviewTab";
import { RevenueTab } from "../components/RevenueTab";
import { RetentionTab } from "../components/RetentionTab";
import { LtvTab } from "../components/LtvTab";
import { ForecastTab } from "../components/ForecastTab";
import { HealthTab } from "../components/HealthTab";
import { ReportsTab } from "../components/ReportsTab";
import { ExportButton } from "../components/ExportButton";

const TABS: { id: AnalyticsTab; icon: React.ElementType; labelKey: string }[] = [
  { id: "overview", icon: BarChart3, labelKey: "entitlements.analytics.tabs.overview" },
  { id: "revenue", icon: DollarSign, labelKey: "entitlements.analytics.tabs.revenue" },
  { id: "retention", icon: Users, labelKey: "entitlements.analytics.tabs.retention" },
  { id: "ltv", icon: TrendingUp, labelKey: "entitlements.analytics.tabs.ltv" },
  { id: "forecast", icon: Activity, labelKey: "entitlements.analytics.tabs.forecast" },
  { id: "health", icon: Heart, labelKey: "entitlements.analytics.tabs.health" },
  { id: "reports", icon: FileText, labelKey: "entitlements.analytics.tabs.reports" },
];

export function AnalyticsView() {
  useModuleLocales(() => import("../../../locales"), "analytics");
  const { t } = useI18n();
  const vm = useAnalyticsViewModel();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-500" />
            {t("entitlements.analytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("entitlements.analytics.description")}
          </p>
        </div>
        <ExportButton onExport={vm.handleExport} disabled={vm.isExporting} />
      </div>

      {/* Tab Navigation */}
      <Tabs
        value={vm.activeTab}
        onValueChange={(v) => vm.handleTabChange(v as AnalyticsTab)}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1 rounded-lg">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t(tab.labelKey)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {vm.overviewLoading ? <TabSkeleton /> : vm.overview && (
            <OverviewTab overview={vm.overview} />
          )}
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          {vm.mrrLoading ? <TabSkeleton /> : vm.mrrMovement && (
            <RevenueTab
              mrrData={vm.mrrMovement}
              months={vm.months}
              onMonthsChange={vm.handleMonthsChange}
            />
          )}
        </TabsContent>

        <TabsContent value="retention" className="mt-6">
          {vm.cohortLoading ? <TabSkeleton /> : vm.cohort && (
            <RetentionTab cohortData={vm.cohort} />
          )}
        </TabsContent>

        <TabsContent value="ltv" className="mt-6">
          {vm.ltvLoading ? <TabSkeleton /> : vm.ltv && (
            <LtvTab ltvData={vm.ltv} />
          )}
        </TabsContent>

        <TabsContent value="forecast" className="mt-6">
          {vm.forecastLoading ? <TabSkeleton /> : vm.forecast && (
            <ForecastTab
              forecastData={vm.forecast}
              months={vm.forecastMonths}
              onMonthsChange={vm.handleForecastMonthsChange}
            />
          )}
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          {vm.healthLoading ? <TabSkeleton /> : vm.health && (
            <HealthTab
              healthData={vm.health}
              page={vm.healthPage}
              pageSize={vm.healthPageSize}
              onPageChange={vm.handleHealthPageChange}
            />
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsTab
            preference={vm.reportPreferences ?? null}
            onSave={vm.updatePreferences}
            onGenerateReport={vm.handleGenerateReport}
            isLoading={vm.reportPreferencesLoading}
            isSaving={vm.isUpdatingPreferences}
            isGenerating={vm.isGeneratingReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Skeleton loading state for tab content */
function TabSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );
}
