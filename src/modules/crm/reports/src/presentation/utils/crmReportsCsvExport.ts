"use client";

import { sanitizeFilename } from "@core/common/sanitize";
import type {
  CrmCurrencyPipelineBreakdown,
  CrmPipelineReport,
} from "../../domain/entities/CrmReportEntity";

/**
 * Neutralizes spreadsheet formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`, `\n`)
 * and applies RFC4180 quoting.
 * @param value - Raw cell value.
 * @returns Escaped RFC4180 CSV cell string.
 */
export function formatSafeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  const needsPrefix = /^[=+\-@\t\r\n]/.test(str) || /^[ \t\r\n]*[=+\-@]/.test(str);
  const safe = needsPrefix ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Builds localized CSV lines for the commercial pipeline report.
 * @param report - Normalized pipeline report entity.
 * @param breakdown - Selected currency breakdown bucket.
 * @param t - i18n translator function.
 * @param language - Active UI language code (`"en"` or `"ar"`).
 * @returns Array of RFC4180 CSV rows.
 */
export function buildCrmReportCsvLines(
  report: CrmPipelineReport,
  breakdown: CrmCurrencyPipelineBreakdown | null,
  t: (key: string) => string,
  language: string
): string[] {
  const pushRow = (cells: unknown[]) => cells.map(formatSafeCsvCell).join(",");
  const lines: string[] = [
    pushRow([
      t("crm.reports.csv.headers.section"),
      t("crm.reports.csv.headers.metric"),
      t("crm.reports.csv.headers.currency"),
      t("crm.reports.csv.headers.count"),
      t("crm.reports.csv.headers.totalValue"),
      t("crm.reports.csv.headers.weightedForecast"),
      t("crm.reports.csv.headers.probabilityPercent"),
    ]),
  ];

  const secPipeline = t("crm.reports.csv.sections.pipelineSummary");
  const secStage = t("crm.reports.csv.sections.stageBreakdown");
  const secFunnel = t("crm.reports.csv.sections.leadFunnel");
  const secVelocity = t("crm.reports.csv.sections.winLossVelocity");
  const secActivities = t("crm.reports.csv.sections.activities");

  if (breakdown) {
    lines.push(
      pushRow([
        secPipeline,
        t("crm.reports.csv.metrics.activeOpenDeals"),
        breakdown.currencyCode,
        breakdown.openDealsCount,
        breakdown.totalOpenValue ?? 0,
        breakdown.totalWeightedForecastValue ?? 0,
        "",
      ])
    );
    lines.push(
      pushRow([
        secPipeline,
        t("crm.reports.csv.metrics.closedWonDeals"),
        breakdown.currencyCode,
        breakdown.wonDealsCount,
        breakdown.totalWonValue ?? 0,
        "",
        100,
      ])
    );
    lines.push(
      pushRow([
        secPipeline,
        t("crm.reports.csv.metrics.closedLostDeals"),
        breakdown.currencyCode,
        breakdown.lostDealsCount,
        breakdown.totalLostValue ?? 0,
        "",
        0,
      ])
    );
    for (const st of breakdown.stages) {
      const stageLabel = language === "ar" ? (st.labelAr || st.labelEn) : st.labelEn;
      lines.push(
        pushRow([
          secStage,
          stageLabel,
          breakdown.currencyCode,
          st.dealCount,
          st.totalAmount ?? 0,
          st.weightedForecastAmount ?? 0,
          st.probabilityPercent,
        ])
      );
    }
  }

  const f = report.leadFunnel;
  lines.push(pushRow([secFunnel, t("crm.reports.csv.metrics.totalLeads"), "", f.totalLeads, "", "", ""]));
  lines.push(pushRow([secFunnel, t("crm.reports.csv.metrics.newIntake"), "", f.newCount, "", "", ""]));
  lines.push(pushRow([secFunnel, t("crm.reports.csv.metrics.working"), "", f.workingCount, "", "", ""]));
  lines.push(pushRow([secFunnel, t("crm.reports.csv.metrics.qualified"), "", f.qualifiedCount, "", "", ""]));
  lines.push(pushRow([secFunnel, t("crm.reports.csv.metrics.converted"), "", f.convertedCount, "", "", f.conversionRatePercent]));
  lines.push(pushRow([secFunnel, t("crm.reports.csv.metrics.disqualified"), "", f.disqualifiedCount, "", "", ""]));

  const w = report.winLoss;
  lines.push(pushRow([secVelocity, t("crm.reports.csv.metrics.totalClosed"), "", w.totalClosedDeals, "", "", w.winRatePercent]));
  lines.push(pushRow([secVelocity, t("crm.reports.csv.metrics.wonCount"), "", w.wonCount, "", "", ""]));
  lines.push(pushRow([secVelocity, t("crm.reports.csv.metrics.lostCount"), "", w.lostCount, "", "", ""]));
  lines.push(pushRow([secVelocity, t("crm.reports.csv.metrics.avgDaysToClose"), "", w.avgCycleDays, "", "", ""]));

  const a = report.activities;
  lines.push(pushRow([secActivities, t("crm.reports.csv.metrics.totalActivities"), "", a.totalActivitiesCount, "", "", ""]));
  lines.push(pushRow([secActivities, t("crm.reports.csv.metrics.callsLogged"), "", a.callsCount, "", "", ""]));
  lines.push(pushRow([secActivities, t("crm.reports.csv.metrics.meetingsLogged"), "", a.meetingsCount, "", "", ""]));
  lines.push(pushRow([secActivities, t("crm.reports.csv.metrics.communicationsSent"), "", a.communicationsSentCount, "", "", ""]));
  lines.push(pushRow([secActivities, t("crm.reports.csv.metrics.followUpsLinked"), "", a.followUpsCreatedCount, "", "", ""]));

  return lines;
}

/**
 * Triggers a browser download of the localized UTF-8 BOM CSV summary.
 */
export function downloadCrmReportCsv(
  report: CrmPipelineReport,
  breakdown: CrmCurrencyPipelineBreakdown | null,
  t: (key: string) => string,
  language: string
): void {
  const lines = buildCrmReportCsvLines(report, breakdown, t, language);
  const fileName = sanitizeFilename(
    `${t("crm.reports.csv.fileNamePrefix")}-${breakdown?.currencyCode || "ALL"}.csv`
  );
  try {
    if (typeof window !== "undefined" && typeof URL?.createObjectURL === "function") {
      const csvContent = `\uFEFF${lines.join("\n")}`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch {
    // Safe fallback in headless/non-DOM environments
  }
}
