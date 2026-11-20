"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Activity, Award, Target, TrendingUp } from "lucide-react";
import type {
  CrmCurrencyPipelineBreakdown,
  CrmPipelineReport,
} from "../../domain/entities/CrmReportEntity";

/** Props for `CrmReportsKpiGrid`. */
export interface CrmReportsKpiGridProps {
  report: CrmPipelineReport;
  activeCurrencyBreakdown: CrmCurrencyPipelineBreakdown | null;
  baseCurrency: string;
  convertAmount: (amount: number, from: string, to: string) => number;
}

/** Displays top 4 executive commercial KPI summary cards on CRM Reports view. */
export function CrmReportsKpiGrid({
  report,
  activeCurrencyBreakdown,
  baseCurrency,
  convertAmount,
}: CrmReportsKpiGridProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5" data-testid="report-kpi-open-pipeline">
        <div className="flex items-center justify-between text-xs text-nx-ink-3">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            {t("crm.reports.activePipelineLabel")} ({activeCurrencyBreakdown?.currencyCode || "SAR"})
          </span>
          <TrendingUp className="size-4 text-nx-accent" />
        </div>
        <div className="text-xl font-bold text-nx-ink">
          {report.isAmountMasked
            ? t("crm.reports.maskedValue")
            : `${activeCurrencyBreakdown?.currencyCode || "SAR"} ${(activeCurrencyBreakdown?.totalOpenValue ?? 0).toLocaleString()}`}
        </div>
        {!report.isAmountMasked && activeCurrencyBreakdown && activeCurrencyBreakdown.currencyCode !== baseCurrency && (
          <div data-testid="report-kpi-converted-base" className="text-[11px] font-mono text-nx-accent">
            ≈ {baseCurrency}{" "}
            {Math.round(
              convertAmount(activeCurrencyBreakdown.totalOpenValue ?? 0, activeCurrencyBreakdown.currencyCode, baseCurrency)
            ).toLocaleString()}{" "}
            {t("crm.reports.crmBaseSuffix")}
          </div>
        )}
        <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
          <span>{activeCurrencyBreakdown?.openDealsCount ?? 0} {t("crm.reports.openOpportunitiesCount")}</span>
          <Badge variant="outline" className="text-[10px] border-nx-accent/30 bg-nx-accent-wash text-nx-accent">
            {t("crm.reports.weightedPrefix")}: {activeCurrencyBreakdown?.currencyCode || "SAR"}{" "}
            {(activeCurrencyBreakdown?.totalWeightedForecastValue ?? 0).toLocaleString()}
          </Badge>
        </div>
      </Card>

      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5" data-testid="report-kpi-win-rate">
        <div className="flex items-center justify-between text-xs text-nx-ink-3">
          <span className="font-semibold uppercase tracking-wider text-[10px]">{t("crm.reports.winRateLabel")}</span>
          <Award className="size-4 text-success" />
        </div>
        <div className="text-xl font-bold text-nx-ink">{report.winLoss.winRatePercent}%</div>
        <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
          <span>{report.winLoss.wonCount} {t("crm.reports.wonLabel")} / {report.winLoss.lostCount} {t("crm.reports.lostLabel")}</span>
          <span className="text-nx-ink-3">{t("crm.reports.avgCyclePrefix")}: {report.winLoss.avgCycleDays}{t("crm.reports.daysShort")}</span>
        </div>
      </Card>

      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5" data-testid="report-kpi-lead-conversion">
        <div className="flex items-center justify-between text-xs text-nx-ink-3">
          <span className="font-semibold uppercase tracking-wider text-[10px]">{t("crm.reports.leadConversionRateLabel")}</span>
          <Target className="size-4 text-info" />
        </div>
        <div className="text-xl font-bold text-nx-ink">{report.leadFunnel.conversionRatePercent}%</div>
        <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
          <span>{report.leadFunnel.totalLeads} {t("crm.reports.scopedLeadsCount")}</span>
          <span className="text-nx-accent font-semibold">{report.leadFunnel.qualificationRatePercent}% {t("crm.reports.qualifiedSuffix")}</span>
        </div>
      </Card>

      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5" data-testid="report-kpi-activities">
        <div className="flex items-center justify-between text-xs text-nx-ink-3">
          <span className="font-semibold uppercase tracking-wider text-[10px]">{t("crm.reports.executionFollowupsLabel")}</span>
          <Activity className="size-4 text-nx-warning-strong" />
        </div>
        <div className="text-xl font-bold text-nx-ink">{report.activities.totalActivitiesCount}</div>
        <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
          <span>{report.activities.followUpsCreatedCount} {t("crm.reports.followUpTasksCount")}</span>
          <span>{report.activities.communicationsSentCount} {t("crm.reports.outboundSentCount")}</span>
        </div>
      </Card>
    </div>
  );
}
