"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "../../../../di";
import {
  useCrmCurrency,
  useCrmTenantScope,
  useSafeQueryClient,
} from "@modules/crm/shared";
import type {
  CrmCurrencyPipelineBreakdown,
  CrmPipelineReport,
  CrmStageReportBucket,
} from "../../domain/entities/CrmReportEntity";
import {
  downloadCrmReportCsv,
  formatSafeCsvCell,
} from "../utils/crmReportsCsvExport";

/** Re-exported CSV formula-injection sanitizer helper for report exports. */
export { formatSafeCsvCell };
/** Re-exported pipeline report types for CRM commercial reporting views. */
export type {
  CrmCurrencyPipelineBreakdown,
  CrmPipelineReport as CrmCommercialReport,
};

/** ViewModel state shape for CRM Commercial Reports. */
export interface CrmReportsState {
  stage: "idle" | "loading" | "success" | "failed";
  report: CrmPipelineReport | null;
  error: string | null;
}

/**
 * ViewModel hook for CRM Reports powered by TanStack Query v5, currency-isolated buckets,
 * live FX conversion, and localized RFC4180 CSV export.
 * @returns Report state, currency bucket controls, conversion utilities, and CSV export handler.
 */
export function useCrmReportsViewModel() {
  const { t, language } = useI18n();
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const { baseCurrency, convertAmount, getRate } = useCrmCurrency();

  const [selectedCurrency, setSelectedCurrency] = useState<string>("SAR");
  const [csvExportedNotice, setCsvExportedNotice] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const reportQuery = useQuery(
    {
      queryKey: qk.crm.reports(tenantId),
      queryFn: () => getCrmContainer().reportsRepository.getPipelineReport(),
    },
    safeQueryClient
  );

  const report = reportQuery.data ?? null;
  const stage: CrmReportsState["stage"] = reportQuery.isLoading
    ? "loading"
    : reportQuery.isError
      ? "failed"
      : report
        ? "success"
        : "idle";
  const errorMsg = reportQuery.error instanceof Error
    ? reportQuery.error.message
    : reportQuery.isError
      ? t("crm.reports.loadFailedTitle")
      : null;

  const state: CrmReportsState = {
    stage,
    report,
    error: errorMsg,
  };

  const effectiveSelectedCurrency =
    selectedCurrency === "CONVERTED" ||
    report?.currencyBreakdowns.some((b) => b.currencyCode === selectedCurrency)
      ? selectedCurrency
      : report?.currencyBreakdowns[0]?.currencyCode ?? selectedCurrency;

  // Unified multi-currency breakdown converting all deals across currencies into CRM baseCurrency.
  const convertedBaseBreakdown: CrmCurrencyPipelineBreakdown | null = (() => {
    if (!report || report.currencyBreakdowns.length === 0) return null;
    const stageMap = new Map<string, CrmStageReportBucket>();
    let openDealsCount = 0;
    let wonDealsCount = 0;
    let lostDealsCount = 0;
    let totalOpenValue = 0;
    let totalWeightedForecastValue = 0;
    let totalWonValue = 0;
    let totalLostValue = 0;

    for (const b of report.currencyBreakdowns) {
      openDealsCount += b.openDealsCount;
      wonDealsCount += b.wonDealsCount;
      lostDealsCount += b.lostDealsCount;
      totalOpenValue += Math.round(convertAmount(b.totalOpenValue ?? 0, b.currencyCode, baseCurrency));
      totalWeightedForecastValue += Math.round(
        convertAmount(b.totalWeightedForecastValue ?? 0, b.currencyCode, baseCurrency)
      );
      totalWonValue += Math.round(convertAmount(b.totalWonValue ?? 0, b.currencyCode, baseCurrency));
      totalLostValue += Math.round(convertAmount(b.totalLostValue ?? 0, b.currencyCode, baseCurrency));

      for (const st of b.stages) {
        const convTotal = Math.round(convertAmount(st.totalAmount ?? 0, b.currencyCode, baseCurrency));
        const convWeighted = Math.round(
          convertAmount(st.weightedForecastAmount ?? 0, b.currencyCode, baseCurrency)
        );
        const existing = stageMap.get(st.stageKey);
        if (existing) {
          stageMap.set(st.stageKey, {
            ...existing,
            dealCount: existing.dealCount + st.dealCount,
            totalAmount: (existing.totalAmount ?? 0) + convTotal,
            weightedForecastAmount: (existing.weightedForecastAmount ?? 0) + convWeighted,
          });
        } else {
          stageMap.set(st.stageKey, {
            ...st,
            totalAmount: convTotal,
            weightedForecastAmount: convWeighted,
          });
        }
      }
    }

    return {
      currencyCode: baseCurrency,
      openDealsCount,
      wonDealsCount,
      lostDealsCount,
      totalOpenValue,
      totalWeightedForecastValue,
      totalWonValue,
      totalLostValue,
      stages: Array.from(stageMap.values()).sort((a, b) => a.sortOrder - b.sortOrder),
    };
  })();

  const activeCurrencyBreakdown =
    effectiveSelectedCurrency === "CONVERTED"
      ? convertedBaseBreakdown
      : report?.currencyBreakdowns.find((b) => b.currencyCode === effectiveSelectedCurrency) ??
        report?.currencyBreakdowns[0] ??
        null;

  const maxStageVal = activeCurrencyBreakdown
    ? Math.max(1, ...activeCurrencyBreakdown.stages.map((s) => s.totalAmount ?? s.dealCount))
    : 1;

  const refresh = useCallback(async () => {
    await reportQuery.refetch();
  }, [reportQuery]);

  const exportCsvSummary = useCallback(() => {
    if (!report) return;
    downloadCrmReportCsv(report, activeCurrencyBreakdown, t, language);
    setCsvExportedNotice(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCsvExportedNotice(false), 3500);
  }, [report, activeCurrencyBreakdown, t, language]);

  return {
    state,
    selectedCurrency: effectiveSelectedCurrency,
    setSelectedCurrency,
    activeCurrencyBreakdown,
    convertedBaseBreakdown,
    maxStageVal,
    baseCurrency,
    convertAmount,
    getRate,
    isPending: reportQuery.isFetching,
    csvExportedNotice,
    refresh,
    exportCsvSummary,
  };
}
