"use client";
/**
 * useAnalyticsViewModel — Main viewmodel hook for the Revenue Analytics dashboard.
 *
 * Provides TanStack Query-based data fetching for all analytics tabs:
 * Overview, MRR Movement, Cohort, LTV, Forecast, and Health Scores.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { UpdateReportPreferenceRequest } from "../../domain/entities/AnalyticsEntities";

const QUERY_KEYS = {
  overview: (months: number) => ["analytics", "overview", months],
  mrrMovement: (months: number) => ["analytics", "mrr-movement", months],
  cohort: (months: number) => ["analytics", "cohort", months],
  ltv: () => ["analytics", "ltv"],
  forecast: (months: number) => ["analytics", "forecast", months],
  healthScores: (page: number, pageSize: number) => ["analytics", "health-scores", page, pageSize],
  reportPreferences: () => ["analytics", "report-preferences"],
};

/**
 * Exported type defining parameters and fields for analytics tab configurations.
 */
export type AnalyticsTab =
  | "overview"
  | "revenue"
  | "retention"
  | "ltv"
  | "forecast"
  | "health"
  | "reports";

/**
 * React hook/ViewModel orchestrating state and data flows for analytics view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useAnalyticsViewModel() {
  const { analyticsRepository } = entitlementsContainer;
  const queryClient = useQueryClient();

  // ── Tab & filter state ──
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [months, setMonths] = useState(12);
  const [forecastMonths, setForecastMonths] = useState(6);
  const [healthPage, setHealthPage] = useState(1);
  const [healthPageSize, setHealthPageSize] = useState(20);

  // ── Overview ──
  const overviewQuery = useQuery({
    queryKey: QUERY_KEYS.overview(months),
    queryFn: () => analyticsRepository.getOverview(months),
    enabled: activeTab === "overview",
    staleTime: 5 * 60 * 1000, // 5 min
  });

  // ── MRR Movement ──
  const mrrQuery = useQuery({
    queryKey: QUERY_KEYS.mrrMovement(months),
    queryFn: () => analyticsRepository.getMrrMovement(months),
    enabled: activeTab === "revenue",
    staleTime: 5 * 60 * 1000,
  });

  // ── Cohort Analysis ──
  const cohortQuery = useQuery({
    queryKey: QUERY_KEYS.cohort(months),
    queryFn: () => analyticsRepository.getCohortAnalysis(months),
    enabled: activeTab === "retention",
    staleTime: 10 * 60 * 1000, // 10 min — heavy computation
  });

  // ── LTV by Edition ──
  const ltvQuery = useQuery({
    queryKey: QUERY_KEYS.ltv(),
    queryFn: () => analyticsRepository.getLtvByEdition(),
    enabled: activeTab === "ltv",
    staleTime: 10 * 60 * 1000,
  });

  // ── Revenue Forecast ──
  const forecastQuery = useQuery({
    queryKey: QUERY_KEYS.forecast(forecastMonths),
    queryFn: () => analyticsRepository.getForecast(forecastMonths),
    enabled: activeTab === "forecast",
    staleTime: 15 * 60 * 1000, // 15 min — expensive
  });

  // ── Health Scores ──
  const healthQuery = useQuery({
    queryKey: QUERY_KEYS.healthScores(healthPage, healthPageSize),
    queryFn: () => analyticsRepository.getHealthScores(healthPage, healthPageSize),
    enabled: activeTab === "health",
    staleTime: 5 * 60 * 1000,
  });

  // ── Report Preferences ──
  const preferencesQuery = useQuery({
    queryKey: QUERY_KEYS.reportPreferences(),
    queryFn: () => analyticsRepository.getReportPreferences(),
    staleTime: 30 * 60 * 1000, // 30 min — rarely changes
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: UpdateReportPreferenceRequest) =>
      analyticsRepository.updateReportPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "report-preferences"] });
    },
  });

  // ── Export ──
  const exportMutation = useMutation({
    mutationFn: (format: string) =>
      analyticsRepository.exportAnalytics({
        format,
        includeMrrMovement: true,
        includeCohort: true,
        includeHealth: true,
        includeForecast: true,
      }),
    onSuccess: (blob, format) => {
      downloadBlob(
        blob,
        `analytics-export.${format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv"}`
      );
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: () => analyticsRepository.generateReport({ currency: "USD" }),
    onSuccess: (blob) => {
      downloadBlob(blob, `analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
  });

  // ── Handlers ──
  const handleTabChange = useCallback((tab: AnalyticsTab) => {
    setActiveTab(tab);
  }, []);

  const handleMonthsChange = useCallback((m: number) => {
    setMonths(m);
  }, []);

  const handleForecastMonthsChange = useCallback((m: number) => {
    setForecastMonths(m);
  }, []);

  const handleHealthPageChange = useCallback((page: number) => {
    setHealthPage(page);
  }, []);

  const handleExport = useCallback(
    async (format: string) => {
      await exportMutation.mutateAsync(format);
    },
    [exportMutation]
  );

  const handleGenerateReport = useCallback(async () => {
    await generateReportMutation.mutateAsync();
  }, [generateReportMutation]);

  return {
    // State
    activeTab,
    months,
    forecastMonths,
    healthPage,
    healthPageSize,

    // Queries
    overview: overviewQuery.data,
    overviewLoading: overviewQuery.isLoading,
    overviewError: overviewQuery.error,
    overviewRefetch: overviewQuery.refetch,
    mrrMovement: mrrQuery.data,
    mrrLoading: mrrQuery.isLoading,
    mrrError: mrrQuery.error,
    mrrRefetch: mrrQuery.refetch,
    cohort: cohortQuery.data,
    cohortLoading: cohortQuery.isLoading,
    cohortError: cohortQuery.error,
    cohortRefetch: cohortQuery.refetch,
    ltv: ltvQuery.data,
    ltvLoading: ltvQuery.isLoading,
    ltvError: ltvQuery.error,
    ltvRefetch: ltvQuery.refetch,
    forecast: forecastQuery.data,
    forecastLoading: forecastQuery.isLoading,
    forecastError: forecastQuery.error,
    forecastRefetch: forecastQuery.refetch,
    health: healthQuery.data,
    healthLoading: healthQuery.isLoading,
    healthError: healthQuery.error,
    healthRefetch: healthQuery.refetch,
    reportPreferences: preferencesQuery.data,
    reportPreferencesLoading: preferencesQuery.isLoading,
    reportPreferencesError: preferencesQuery.error,
    reportPreferencesRefetch: preferencesQuery.refetch,

    // Mutations
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    handleExport,
    isExporting: exportMutation.isPending,
    handleGenerateReport,
    isGeneratingReport: generateReportMutation.isPending,

    // Handlers
    handleTabChange,
    handleMonthsChange,
    handleForecastMonthsChange,
    handleHealthPageChange,
  };
}

/** Trigger a browser file download from a Blob. */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
