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
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Heart, FileText } from "lucide-react";
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

/**
 * React presentation component representing the analytics view UI element.
 */
export function AnalyticsView() {
  useModuleLocales(() => import("../../../locales"), "analytics");
  const { t } = useI18n();
  const vm = useAnalyticsViewModel();

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-card via-card to-emerald-500/[0.03] p-5 shadow-sm">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-blue-500/[0.05] blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {t("entitlements.analytics.title")}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
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
        <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl border border-border/30 bg-muted/40 p-1.5 shadow-sm backdrop-blur-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 data-[state=active]:border-border/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md"
              >
                <Icon className="h-3.5 w-3.5" />
                {t(tab.labelKey)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {vm.overviewLoading ? (
            <TabSkeleton />
          ) : vm.overview ? (
            <OverviewTab overview={vm.overview} />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          {vm.mrrLoading ? (
            <TabSkeleton />
          ) : vm.mrrMovement ? (
            <RevenueTab
              mrrData={vm.mrrMovement}
              months={vm.months}
              onMonthsChange={vm.handleMonthsChange}
            />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="retention" className="mt-4">
          {vm.cohortLoading ? (
            <TabSkeleton />
          ) : vm.cohort ? (
            <RetentionTab cohortData={vm.cohort} />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="ltv" className="mt-4">
          {vm.ltvLoading ? (
            <TabSkeleton />
          ) : vm.ltv ? (
            <LtvTab ltvData={vm.ltv} />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="forecast" className="mt-4">
          {vm.forecastLoading ? (
            <TabSkeleton />
          ) : vm.forecast ? (
            <ForecastTab
              forecastData={vm.forecast}
              months={vm.forecastMonths}
              onMonthsChange={vm.handleForecastMonthsChange}
            />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          {vm.healthLoading ? (
            <TabSkeleton />
          ) : vm.health ? (
            <HealthTab
              healthData={vm.health}
              page={vm.healthPage}
              pageSize={vm.healthPageSize}
              onPageChange={vm.handleHealthPageChange}
            />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
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

/** Skeleton loading state */
function TabSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border/20 bg-muted/40"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-border/20 bg-muted/40" />
    </div>
  );
}

/** Empty state with helpful messaging */
function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 rounded-full bg-muted/50 p-5">
        <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-muted-foreground">
        {t("entitlements.analytics.empty.title")}
      </h3>
      <p className="max-w-md text-sm text-muted-foreground/70">
        {t("entitlements.analytics.empty.description")}
      </p>
      <p className="mt-2 rounded-lg bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground/50">
        {t("entitlements.analytics.empty.hint")}
      </p>
    </div>
  );
}
