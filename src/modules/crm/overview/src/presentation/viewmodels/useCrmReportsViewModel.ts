"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type {
  CrmCurrencyPipelineBreakdown,
  CrmPipelineReport,
  CrmStageReportBucket,
} from "../../domain/models/crm-overview.types";
import { useCrmCurrency } from "./useCrmCurrency";

export type { CrmCurrencyPipelineBreakdown, CrmPipelineReport as CrmCommercialReport };

export interface CrmReportsState {
  stage: "idle" | "loading" | "success" | "failed";
  report: CrmPipelineReport | null;
  error: string | null;
}

export function useCrmReportsViewModel() {
  const [state, setState] = useState<CrmReportsState>({
    stage: "loading",
    report: null,
    error: null,
  });
  const [selectedCurrency, setSelectedCurrency] = useState<string>("SAR");
  const [csvExportedNotice, setCsvExportedNotice] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { baseCurrency, convertAmount, getRate } = useCrmCurrency();

  const loadReport = useCallback(async () => {
    setState((prev) => ({ ...prev, stage: "loading", error: null }));
    try {
      const container = getCrmContainer();
      const report = await container.overviewRepository.getPipelineReport();
      startTransition(() => {
        setState({
          stage: "success",
          report,
          error: null,
        });
        if (report.currencyBreakdowns?.length > 0) {
          setSelectedCurrency((curr) =>
            curr === "CONVERTED" ||
            report.currencyBreakdowns.some((b) => b.currencyCode === curr)
              ? curr
              : report.currencyBreakdowns[0].currencyCode
          );
        }
      });
    } catch (err) {
      setState({
        stage: "failed",
        report: null,
        error: err instanceof Error ? err.message : "Failed to load CRM Pipeline & Funnel Report",
      });
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Unified multi-currency breakdown converting all deals across currencies into CRM baseCurrency
  const convertedBaseBreakdown: CrmCurrencyPipelineBreakdown | null = (() => {
    if (!state.report || state.report.currencyBreakdowns.length === 0) return null;
    const stageMap = new Map<string, CrmStageReportBucket>();
    let openDealsCount = 0;
    let wonDealsCount = 0;
    let lostDealsCount = 0;
    let totalOpenValue = 0;
    let totalWeightedForecastValue = 0;
    let totalWonValue = 0;
    let totalLostValue = 0;

    for (const b of state.report.currencyBreakdowns) {
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
    selectedCurrency === "CONVERTED"
      ? convertedBaseBreakdown
      : state.report?.currencyBreakdowns.find((b) => b.currencyCode === selectedCurrency) ??
        state.report?.currencyBreakdowns[0] ??
        null;

  const exportCsvSummary = useCallback(() => {
    if (!state.report) return;
    const report = state.report;
    const breakdown = activeCurrencyBreakdown;
    const lines: string[] = [
      "Section,Metric,Currency,Count,TotalValue,WeightedForecast,ProbabilityPercent",
    ];

    if (breakdown) {
      lines.push(
        `Pipeline Summary,Active Open Deals,${breakdown.currencyCode},${breakdown.openDealsCount},${breakdown.totalOpenValue ?? 0},${breakdown.totalWeightedForecastValue ?? 0},`
      );
      lines.push(
        `Pipeline Summary,Closed Won Deals,${breakdown.currencyCode},${breakdown.wonDealsCount},${breakdown.totalWonValue ?? 0},,100`
      );
      lines.push(
        `Pipeline Summary,Closed Lost Deals,${breakdown.currencyCode},${breakdown.lostDealsCount},${breakdown.totalLostValue ?? 0},,0`
      );
      for (const st of breakdown.stages) {
        lines.push(
          `Stage Breakdown,"${st.labelEn}",${breakdown.currencyCode},${st.dealCount},${st.totalAmount ?? 0},${st.weightedForecastAmount ?? 0},${st.probabilityPercent}`
        );
      }
    }

    const f = report.leadFunnel;
    lines.push(`Lead Funnel,Total Leads,,${f.totalLeads},,,`);
    lines.push(`Lead Funnel,New Intake,,${f.newCount},,,`);
    lines.push(`Lead Funnel,Working,,${f.workingCount},,,`);
    lines.push(`Lead Funnel,Qualified,,${f.qualifiedCount},,,`);
    lines.push(`Lead Funnel,Converted,,${f.convertedCount},,,${f.conversionRatePercent}`);
    lines.push(`Lead Funnel,Disqualified,,${f.disqualifiedCount},,,`);

    const w = report.winLoss;
    lines.push(`Win/Loss Velocity,Total Closed,,${w.totalClosedDeals},,,${w.winRatePercent}`);
    lines.push(`Win/Loss Velocity,Won Count,,${w.wonCount},,,`);
    lines.push(`Win/Loss Velocity,Lost Count,,${w.lostCount},,,`);
    lines.push(`Win/Loss Velocity,Avg Days to Close,,${w.avgCycleDays},,,`);

    const a = report.activities;
    lines.push(`Activities,Total Activities,,${a.totalActivitiesCount},,,`);
    lines.push(`Activities,Calls Logged,,${a.callsCount},,,`);
    lines.push(`Activities,Meetings Logged,,${a.meetingsCount},,,`);
    lines.push(`Activities,Communications Sent,,${a.communicationsSentCount},,,`);
    lines.push(`Activities,Follow-Ups Linked,,${a.followUpsCreatedCount},,,`);

    try {
      if (typeof window !== "undefined" && typeof URL?.createObjectURL === "function") {
        const csvContent = lines.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `scripe-crm-pipeline-report-${breakdown?.currencyCode || "ALL"}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch {
      // Safe fallback in headless/non-DOM environments
    }

    setCsvExportedNotice(true);
    setTimeout(() => setCsvExportedNotice(false), 3500);
  }, [state.report, activeCurrencyBreakdown]);

  return {
    state,
    selectedCurrency,
    setSelectedCurrency,
    activeCurrencyBreakdown,
    convertedBaseBreakdown,
    baseCurrency,
    convertAmount,
    getRate,
    isPending,
    csvExportedNotice,
    refresh: loadReport,
    exportCsvSummary,
  };
}
