"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  RefreshCw,
  Download,
  TrendingUp,
  Target,
  Award,
  Activity,
  CheckCircle2,
  Coins,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS } from "../../domain/constants/permission-constants";
import { CrmShell, type CrmTabId } from "../components/CrmShell";
import { CRM_TAB_ROUTES } from "../viewmodels/useCrmShellViewModel";
import { CrmSectionHeader } from "../components/CrmSectionHeader";
import { CrmReportsBreakdownsSection } from "../components/CrmReportsBreakdownsSection";
import { CrmReportsSkeleton } from "../components/CrmReportsSkeleton";
import { useCrmReportsViewModel } from "../viewmodels/useCrmReportsViewModel";

export function CrmReportsView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canExport = usePermission(CRM_PERMISSIONS.REPORTS_EXPORT);

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  const {
    state,
    selectedCurrency,
    setSelectedCurrency,
    activeCurrencyBreakdown,
    convertedBaseBreakdown,
    baseCurrency,
    convertAmount,
    csvExportedNotice,
    refresh,
    exportCsvSummary,
  } = useCrmReportsViewModel();

  const report = state.report;
  const maxStageVal = activeCurrencyBreakdown
    ? Math.max(1, ...activeCurrencyBreakdown.stages.map((s) => s.totalAmount ?? s.dealCount))
    : 1;

  return (
    <CrmShell activeTab="reports" onTabChange={handleTabChange}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-reports-view">
        <CrmSectionHeader
          title={t("crm.reports.title")}
          subtitle={t("crm.reports.subtitle")}
          badge={
            report
              ? `${report.currencyBreakdowns.length} ${
                  report.currencyBreakdowns.length === 1
                    ? t("crm.reports.currencyBucketSingular")
                    : t("crm.reports.currencyBucketPlural")
                } | ${t("crm.reports.basePrefix")}: ${baseCurrency}`
              : t("crm.reports.liveAnalytics")
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {report && report.currencyBreakdowns.length > 0 && (
                <div
                  className="inline-flex flex-wrap items-center rounded-nx-md border border-nx-line bg-nx-raised p-0.5 gap-0.5"
                  data-testid="reports-currency-switcher"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="currency-bucket-btn-CONVERTED"
                    onClick={() => setSelectedCurrency("CONVERTED")}
                    className={cn(
                      "h-7 px-2.5 text-xs font-bold gap-1 rounded-nx-sm",
                      selectedCurrency === "CONVERTED"
                        ? "bg-nx-surface text-nx-accent border border-nx-line"
                        : "text-nx-ink-2 hover:text-nx-ink",
                    )}
                  >
                    <Coins className="size-3" />
                    <span>{t("crm.reports.allConverted")} ({baseCurrency})</span>
                    {convertedBaseBreakdown && (
                      <span className="text-[10px] text-nx-ink-3 font-normal">
                        ({convertedBaseBreakdown.openDealsCount + convertedBaseBreakdown.wonDealsCount + convertedBaseBreakdown.lostDealsCount})
                      </span>
                    )}
                  </Button>
                  {report.currencyBreakdowns.map((b) => (
                    <Button
                      key={b.currencyCode}
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-testid={`currency-bucket-btn-${b.currencyCode}`}
                      onClick={() => setSelectedCurrency(b.currencyCode)}
                      className={cn(
                        "h-7 px-2.5 text-xs font-bold gap-1 rounded-nx-sm",
                        selectedCurrency === b.currencyCode
                          ? "bg-nx-surface text-nx-accent border border-nx-line"
                          : "text-nx-ink-2 hover:text-nx-ink",
                      )}
                    >
                      <Coins className="size-3" />
                      <span>{b.currencyCode}</span>
                      <span className="text-[10px] text-nx-ink-3 font-normal">
                        ({b.openDealsCount + b.wonDealsCount + b.lostDealsCount})
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="refresh-reports-btn"
                onClick={refresh}
                className="h-8 gap-1.5 border-nx-line bg-nx-surface text-xs text-nx-ink hover:bg-nx-raised"
              >
                <RefreshCw className="size-3.5 text-nx-ink-2" />
                <span>{t("crm.reports.refresh")}</span>
              </Button>

              {canExport && (
                <Button
                  type="button"
                  size="sm"
                  data-testid="export-reports-csv-btn"
                  onClick={exportCsvSummary}
                  className="h-8 gap-1.5 text-xs font-bold bg-nx-accent text-nx-on-fill hover:bg-nx-accent-ink"
                >
                  <Download className="size-3.5" />
                  <span>{t("crm.reports.exportCsvBtn")}</span>
                </Button>
              )}
            </div>
          }
        />

        {csvExportedNotice && (
          <Alert className="border-success/40 bg-success/10 text-nx-ink" data-testid="csv-export-alert">
            <CheckCircle2 className="size-4 text-success" />
            <AlertTitle className="text-xs font-bold text-success">
              {t("crm.reports.csvAlertTitle")} ({activeCurrencyBreakdown?.currencyCode || selectedCurrency})
            </AlertTitle>
            <AlertDescription className="text-xs text-nx-ink-2">
              {t("crm.reports.csvAlertDesc")}{" "}
              {activeCurrencyBreakdown?.currencyCode || selectedCurrency}.
            </AlertDescription>
          </Alert>
        )}

        {state.stage === "loading" && (
          <CrmReportsSkeleton />
        )}

        {state.stage === "failed" && (
          <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
            <AlertTitle>{t("crm.reports.loadFailedTitle")}</AlertTitle>
            <AlertDescription className="mt-2 flex items-center justify-between text-xs">
              <span>{state.error}</span>
              <Button type="button" size="sm" variant="outline" onClick={refresh}>
                {t("crm.reports.retryBtn")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state.stage === "success" && report && (
          <>
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
                      convertAmount(activeCurrencyBreakdown.totalOpenValue ?? 0, activeCurrencyBreakdown.currencyCode, baseCurrency),
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
                  <Activity className="size-4 text-warning" />
                </div>
                <div className="text-xl font-bold text-nx-ink">{report.activities.totalActivitiesCount}</div>
                <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
                  <span>{report.activities.followUpsCreatedCount} {t("crm.reports.followUpTasksCount")}</span>
                  <span>{report.activities.communicationsSentCount} {t("crm.reports.outboundSentCount")}</span>
                </div>
              </Card>
            </div>

            <CrmReportsBreakdownsSection
              report={report}
              activeCurrencyBreakdown={activeCurrencyBreakdown}
              maxStageVal={maxStageVal}
              language={language}
            />
          </>
        )}
      </div>
    </CrmShell>
  );
}
