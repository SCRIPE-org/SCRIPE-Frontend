"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import {
  RefreshCw,
  Download,
  CheckCircle2,
  Coins,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS } from "../../domain/constants/permission-constants";
import { CrmShell, type CrmTabId } from "../components/CrmShell";
import { CRM_TAB_ROUTES } from "../viewmodels/useCrmShellViewModel";
import { CrmSectionHeader } from "../components/CrmSectionHeader";
import { CrmReportsBreakdownsSection } from "../components/CrmReportsBreakdownsSection";
import { CrmReportsKpiGrid } from "../components/CrmReportsKpiGrid";
import { CrmReportsSkeleton } from "../components/CrmReportsSkeleton";
import { useCrmReportsViewModel } from "../viewmodels/useCrmReportsViewModel";

/**
 * CRM Reports view providing multi-currency analytics, pipeline stage breakdown,
 * win/loss metrics, lead conversion funnel, and CSV exports.
 */
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
                  className="h-8 gap-1.5 text-xs font-bold bg-nx-accent-fill text-nx-on-fill hover:brightness-95"
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
            <CrmReportsKpiGrid
              report={report}
              activeCurrencyBreakdown={activeCurrencyBreakdown}
              baseCurrency={baseCurrency}
              convertAmount={convertAmount}
            />

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
