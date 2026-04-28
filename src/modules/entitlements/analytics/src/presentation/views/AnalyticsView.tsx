"use client";
/**
 * AnalyticsView — Premium Revenue Analytics dashboard with tab navigation.
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
      {/* ── Premium Page Header ── */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-500/[0.03] p-6 shadow-sm">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-blue-500/[0.05] blur-2xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("entitlements.analytics.title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("entitlements.analytics.description")}
              </p>
            </div>
          </div>
          <ExportButton onExport={vm.handleExport} disabled={vm.isExporting} />
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <Tabs
        value={vm.activeTab}
        onValueChange={(v) => vm.handleTabChange(v as AnalyticsTab)}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/40 backdrop-blur-sm p-1.5 rounded-xl border border-border/30 shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 text-xs sm:text-sm whitespace-nowrap rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-border/50 data-[state=active]:text-foreground font-medium"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t(tab.labelKey)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {vm.overviewLoading ? <TabSkeleton /> : vm.overview ? (
            <OverviewTab overview={vm.overview} />
          ) : <EmptyState t={t} />}
        </TabsContent>

        <TabsContent value="revenue" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {vm.mrrLoading ? <TabSkeleton /> : vm.mrrMovement ? (
            <RevenueTab
              mrrData={vm.mrrMovement}
              months={vm.months}
              onMonthsChange={vm.handleMonthsChange}
            />
          ) : <EmptyState t={t} />}
        </TabsContent>

        <TabsContent value="retention" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {vm.cohortLoading ? <TabSkeleton /> : vm.cohort ? (
            <RetentionTab cohortData={vm.cohort} />
          ) : <EmptyState t={t} />}
        </TabsContent>

        <TabsContent value="ltv" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {vm.ltvLoading ? <TabSkeleton /> : vm.ltv ? (
            <LtvTab ltvData={vm.ltv} />
          ) : <EmptyState t={t} />}
        </TabsContent>

        <TabsContent value="forecast" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {vm.forecastLoading ? <TabSkeleton /> : vm.forecast ? (
            <ForecastTab
              forecastData={vm.forecast}
              months={vm.forecastMonths}
              onMonthsChange={vm.handleForecastMonthsChange}
            />
          ) : <EmptyState t={t} />}
        </TabsContent>

        <TabsContent value="health" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {vm.healthLoading ? <TabSkeleton /> : vm.health ? (
            <HealthTab
              healthData={vm.health}
              page={vm.healthPage}
              pageSize={vm.healthPageSize}
              onPageChange={vm.handleHealthPageChange}
            />
          ) : <EmptyState t={t} />}
        </TabsContent>

        <TabsContent value="reports" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
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

/** Premium skeleton loading state */
function TabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse border border-border/20" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted/40 animate-pulse border border-border/20" />
    </div>
  );
}

/** Premium empty state with helpful messaging */
function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-4">
        <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-muted-foreground mb-1">
        {t("entitlements.analytics.empty.title")}
      </h3>
      <p className="text-sm text-muted-foreground/70 max-w-md">
        {t("entitlements.analytics.empty.description")}
      </p>
      <p className="text-xs text-muted-foreground/50 mt-3 bg-muted/30 px-4 py-2 rounded-lg">
        {t("entitlements.analytics.empty.hint")}
      </p>
    </div>
  );
}
