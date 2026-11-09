"use client";

import React, { useState } from "react";
import { useAcademyServiceLocator } from "../../../di";
import { useAcademyReportsViewModel } from "../viewmodels/useAcademyReportsViewModel";
import { AnalyticsKpiCards } from "../components/AnalyticsKpiCards";
import { GroupCapacityTable } from "../components/GroupCapacityTable";
import { TrialFunnelCard } from "../components/TrialFunnelCard";
import { ReceivablesSnapshotCard } from "../components/ReceivablesSnapshotCard";
import { DeferredMetricsNotice } from "../components/DeferredMetricsNotice";
import { ExportDialog } from "../components/ExportDialog";
import { reportsEn, reportsAr } from "../../../analytics-reports/locales";

interface AcademyReportsViewProps {
  locale?: string;
}

export function AcademyReportsView({ locale = "en" }: AcademyReportsViewProps) {
  const locator = useAcademyServiceLocator();
  const repo = locator.analyticsRepository;
  const vm = useAcademyReportsViewModel(repo);

  const [currentLocale, setCurrentLocale] = useState<string>(locale);
  const strings = currentLocale === "ar" ? reportsAr : reportsEn;

  // Simple key translator
  const t = (key: string, options?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let val: any = strings;
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        return key;
      }
    }
    if (typeof val === "string" && options) {
      return Object.entries(options).reduce(
        (acc, [optKey, optVal]) => acc.replace(`{${optKey}}`, String(optVal)),
        val
      );
    }
    return typeof val === "string" ? val : key;
  };

  const isRtl = currentLocale === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-nx-ground text-nx-ink p-4 sm:p-6 lg:p-8 space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nx-ink">
            {t("title")}
          </h1>
          <p className="mt-1 text-xs text-nx-ink-3">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {vm.metrics?.metadata?.asOfUtc && (
            <div className="text-end text-[11px] text-nx-ink-3">
              <span>{t("asOf")}: </span>
              <span className="font-mono text-nx-ink-2">
                {new Date(vm.metrics.metadata.asOfUtc).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => vm.fetchMetrics()}
            disabled={vm.loading}
            className="rounded border border-nx-line bg-nx-surface px-3 py-1.5 text-xs font-medium text-nx-ink transition-colors hover:bg-nx-raised disabled:opacity-50"
          >
            {vm.loading ? "..." : t("refresh")}
          </button>

          {/* Export Data Button */}
          <button
            type="button"
            onClick={() => vm.setIsExportDialogOpen(true)}
            className="rounded bg-nx-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
          >
            {t("exportData")}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setCurrentLocale(currentLocale === "en" ? "ar" : "en")}
            className="rounded border border-nx-line bg-nx-surface px-2.5 py-1 text-xs font-medium text-nx-ink transition-colors hover:border-nx-line-hi"
          >
            {currentLocale === "en" ? "العربية (AR)" : "English (EN)"}
          </button>
        </div>
      </div>

      {/* Governance & Source Truth Banner */}
      <div className="rounded-md border border-nx-line bg-nx-surface/60 p-3 text-xs text-nx-ink-2">
        <p className="leading-relaxed font-sans">{t("sourceNotice")}</p>
      </div>

      {/* Error state */}
      {vm.error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-500">
          <span>{vm.error}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {vm.loading && !vm.metrics ? (
        <div className="rounded-lg border border-nx-line bg-nx-surface p-12 text-center text-xs text-nx-ink-3">
          {t("loading")}
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <AnalyticsKpiCards metrics={vm.metrics} t={t} />

          {/* Middle Layout: Group Capacity (Left) & Funnel / Receivables (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <GroupCapacityTable
                groups={vm.metrics?.groupCapacityUtilization?.groups || []}
                locale={currentLocale}
                t={t}
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <TrialFunnelCard funnel={vm.metrics?.trialFunnel} t={t} />
              <ReceivablesSnapshotCard
                financialReceivables={vm.metrics?.financialReceivables}
                t={t}
              />
            </div>
          </div>

          {/* Codex S5/S6 Deferred Contract Seam */}
          <DeferredMetricsNotice
            deferred={vm.metrics?.deferredCodexMetrics}
            t={t}
          />
        </>
      )}

      {/* Governed CSV Export Dialog */}
      <ExportDialog
        isOpen={vm.isExportDialogOpen}
        onClose={() => vm.setIsExportDialogOpen(false)}
        onDownload={vm.handleDownloadExport}
        t={t}
      />
    </div>
  );
}
