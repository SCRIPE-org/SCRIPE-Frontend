"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, BarChart2, Download, RefreshCw } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useAcademyServiceLocator } from "@/modules/academy/di";
import { reportsAr, reportsEn } from "@/modules/academy/analytics-reports/locales";
import { AnalyticsKpiCards } from "../components/AnalyticsKpiCards";
import { DeferredMetricsNotice } from "../components/DeferredMetricsNotice";
import { ExportDialog } from "../components/ExportDialog";
import { GroupCapacityTable } from "../components/GroupCapacityTable";
import { ReceivablesSnapshotCard } from "../components/ReceivablesSnapshotCard";
import { TrialFunnelCard } from "../components/TrialFunnelCard";
import { useAcademyReportsViewModel } from "../viewmodels/useAcademyReportsViewModel";

interface AcademyReportsViewProps {
  locale?: string;
}

export function AcademyReportsView({ locale = "en" }: AcademyReportsViewProps) {
  const locator = useAcademyServiceLocator();
  const vm = useAcademyReportsViewModel(locator.analyticsRepository);
  const [currentLocale, setCurrentLocale] = useState(locale);
  const strings = currentLocale === "ar" ? reportsAr : reportsEn;
  const isAr = currentLocale === "ar";

  const t = (key: string, options?: Record<string, string | number>): string => {
    let value: unknown = strings;
    for (const part of key.split(".")) {
      if (!value || typeof value !== "object" || !(part in value)) return key;
      value = (value as Record<string, unknown>)[part];
    }
    if (typeof value !== "string") return key;
    return options
      ? Object.entries(options).reduce(
          (text, [optionKey, optionValue]) =>
            text.replace("{" + optionKey + "}", String(optionValue)),
          value,
        )
      : value;
  };

  const resetFilters = () => {
    vm.setBranchFilter("");
    vm.setProgramFilter("");
    vm.setSeasonFilter("");
    void vm.fetchMetrics({ branchId: "", programId: "", seasonId: "" });
  };

  const asOf = vm.metrics?.metadata.asOfUtc
    ? new Date(vm.metrics.metadata.asOfUtc).toLocaleString(currentLocale)
    : null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 text-nx-ink"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-nx-ink-3 mb-2">
            <Link href="/academy" className="hover:underline text-nx-ink-2">
              {isAr ? "عمليات الأكاديمية" : "Academy Operations"}
            </Link>
            <span>/</span>
            <span>{isAr ? "التقارير والمؤشرات" : "Reports & KPIs"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl border border-nx-accent-fill/40 bg-nx-accent-fill/10 text-nx-accent">
              <BarChart2 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
              <p className="text-xs text-nx-ink-3 mt-0.5">{t("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            onClick={() => vm.setIsExportDialogOpen(true)}
            disabled={!vm.metrics}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            {t("exportData")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentLocale(isAr ? "en" : "ar")}
          >
            {isAr ? "English" : "العربية"}
          </Button>
        </div>
      </header>

      <section className="rounded-xl border border-nx-line bg-nx-surface p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <p className="text-xs text-nx-ink-2 leading-relaxed">{t("sourceNotice")}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void vm.fetchMetrics()}
            disabled={vm.loading}
            className="gap-1.5 shrink-0"
          >
            <RefreshCw className={"h-3.5 w-3.5 " + (vm.loading ? "animate-spin" : "")} />
            {t("refresh")}
          </Button>
        </div>
        {asOf && (
          <p className="text-[11px] text-nx-ink-3 font-mono">
            {t("asOf")}: {asOf}
            {vm.metrics?.metadata.scopedBranchIds.length
              ? " · " + vm.metrics.metadata.scopedBranchIds.length + " scoped branch(es)"
              : ""}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-nx-line bg-nx-surface p-4 space-y-3">
        <h2 className="text-sm font-bold">{isAr ? "نطاق التقرير" : "Report scope"}</h2>
        <p className="text-xs text-nx-ink-3">
          {isAr
            ? "استخدم المعرّفات الدقيقة لتطبيق نطاق الفرع أو البرنامج أو الموسم."
            : "Use exact identifiers to scope the report by branch, program, or season."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={vm.branchFilter}
            onChange={(event) => vm.setBranchFilter(event.target.value)}
            placeholder={t("filters.filterByBranch")}
            aria-label={t("filters.filterByBranch")}
          />
          <Input
            value={vm.programFilter}
            onChange={(event) => vm.setProgramFilter(event.target.value)}
            placeholder={t("filters.filterByProgram")}
            aria-label={t("filters.filterByProgram")}
          />
          <Input
            value={vm.seasonFilter}
            onChange={(event) => vm.setSeasonFilter(event.target.value)}
            placeholder={t("filters.filterBySeason")}
            aria-label={t("filters.filterBySeason")}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => void vm.fetchMetrics()} disabled={vm.loading}>
            {t("filters.apply")}
          </Button>
          <Button type="button" variant="outline" onClick={resetFilters} disabled={vm.loading}>
            {t("filters.reset")}
          </Button>
        </div>
      </section>

      {vm.error && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-bold">{isAr ? "تعذر تحميل مؤشرات الأكاديمية" : "Unable to load academy metrics"}</p>
            <p className="text-xs text-nx-ink-2 mt-1">{vm.error}</p>
          </div>
        </div>
      )}

      {vm.loading && !vm.metrics ? (
        <div className="min-h-48 rounded-xl border border-nx-line bg-nx-surface flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <AnalyticsKpiCards metrics={vm.metrics} t={t} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <TrialFunnelCard funnel={vm.metrics?.trialFunnel} t={t} />
            <ReceivablesSnapshotCard financialReceivables={vm.metrics?.financialReceivables} t={t} />
          </div>

          <section className="rounded-xl border border-nx-line bg-nx-surface p-4">
            <div className="mb-3">
              <h2 className="text-sm font-bold">
                {isAr ? "التسجيلات حسب الرياضة" : "Enrollments by sport"}
              </h2>
              <p className="text-xs text-nx-ink-3">
                {isAr ? "من نطاق التقرير الحالي فقط" : "Current report scope only"}
              </p>
            </div>
            {vm.metrics?.enrollmentsBySport.length ? (
              <div className="divide-y divide-nx-line">
                {vm.metrics.enrollmentsBySport.map((sport) => (
                  <div key={sport.sportId} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold">
                      {isAr && sport.sportNameAr ? sport.sportNameAr : sport.sportNameEn}
                    </span>
                    <span className="font-mono text-nx-ink-2">
                      {sport.enrollmentCount} {isAr ? "تسجيل" : "enrollments"} · {sport.uniqueAthletesCount} {isAr ? "رياضي" : "athletes"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-nx-ink-3">
                {isAr ? "لا توجد بيانات رياضية لهذا النطاق." : "No sport enrollment data for this scope."}
              </p>
            )}
          </section>

          <GroupCapacityTable
            groups={vm.metrics?.groupCapacityUtilization.groups ?? []}
            locale={currentLocale}
            t={t}
          />

          <DeferredMetricsNotice deferred={vm.metrics?.deferredCodexMetrics} t={t} />
        </>
      )}

      <ExportDialog
        isOpen={vm.isExportDialogOpen}
        onClose={() => vm.setIsExportDialogOpen(false)}
        onDownload={vm.handleDownloadExport}
        t={t}
      />
    </div>
  );
}
