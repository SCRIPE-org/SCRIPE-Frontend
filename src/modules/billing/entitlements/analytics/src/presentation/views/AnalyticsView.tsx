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
import { EmptyState as CoreEmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
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
 * Presentation UI component rendering the analytics view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function AnalyticsView() {
  useModuleLocales(() => import("../../../locales"), "analytics");
  const { t } = useI18n();
  const vm = useAnalyticsViewModel();

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-nx-lg border border-[color:color-mix(in_srgb,var(--nx-line)_40%,transparent)] bg-gradient-to-br from-nx-surface via-nx-surface to-success/[0.03] p-5">
        <div className="relative flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-gradient-to-br from-success to-success/70 text-success-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {t("entitlements.analytics.title")}
              </h1>
              <p className="mt-0.5 text-xs text-nx-ink-3">
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
        <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-line)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-raised)_40%,transparent)] p-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-1.5 whitespace-nowrap rounded-nx-md px-3 py-2 text-xs font-medium transition-[color,background-color,border-color,box-shadow] duration-nx-standard ease-nx-enter data-[state=active]:border-[color:color-mix(in_srgb,var(--nx-line)_50%,transparent)] data-[state=active]:bg-nx-ground data-[state=active]:text-nx-ink motion-reduce:transition-none"
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
          ) : vm.overviewError ? (
            <ErrorMessage message={t("common.error")} onRetry={() => vm.overviewRefetch()} />
          ) : vm.overview ? (
            <OverviewTab overview={vm.overview} />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          {vm.mrrLoading ? (
            <TabSkeleton />
          ) : vm.mrrError ? (
            <ErrorMessage message={t("common.error")} onRetry={() => vm.mrrRefetch()} />
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
          ) : vm.cohortError ? (
            <ErrorMessage message={t("common.error")} onRetry={() => vm.cohortRefetch()} />
          ) : vm.cohort ? (
            <RetentionTab cohortData={vm.cohort} />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="ltv" className="mt-4">
          {vm.ltvLoading ? (
            <TabSkeleton />
          ) : vm.ltvError ? (
            <ErrorMessage message={t("common.error")} onRetry={() => vm.ltvRefetch()} />
          ) : vm.ltv ? (
            <LtvTab ltvData={vm.ltv} />
          ) : (
            <EmptyState t={t} />
          )}
        </TabsContent>

        <TabsContent value="forecast" className="mt-4">
          {vm.forecastLoading ? (
            <TabSkeleton />
          ) : vm.forecastError ? (
            <ErrorMessage message={t("common.error")} onRetry={() => vm.forecastRefetch()} />
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
          ) : vm.healthError ? (
            <ErrorMessage message={t("common.error")} onRetry={() => vm.healthRefetch()} />
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
            error={vm.reportPreferencesError}
            onRetry={() => vm.reportPreferencesRefetch()}
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
          <Skeleton key={i} className="h-24 rounded-nx-md border border-nx-line" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-nx-md border border-nx-line" />
    </div>
  );
}

/** Empty state with helpful messaging — thin adopter over the core EmptyState;
 *  the analytics "hint" chip rides the action slot. */
function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <CoreEmptyState
      icon={BarChart3}
      title={t("entitlements.analytics.empty.title")}
      description={t("entitlements.analytics.empty.description")}
      action={
        <span className="rounded-nx-md bg-nx-hover px-3 py-1.5 text-xs text-nx-ink-3">
          {t("entitlements.analytics.empty.hint")}
        </span>
      }
    />
  );
}
