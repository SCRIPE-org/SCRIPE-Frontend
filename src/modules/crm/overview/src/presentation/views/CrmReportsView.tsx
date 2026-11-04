"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import {
  BarChart3,
  RefreshCw,
  Download,
  TrendingUp,
  Target,
  Award,
  Activity,
  ShieldCheck,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Phone,
  Users,
  CalendarCheck,
  Coins,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS } from "../../domain/constants/permission-constants";
import { CrmShell } from "../components/CrmShell";
import { CrmSectionHeader } from "../components/CrmSectionHeader";
import { useCrmReportsViewModel } from "../viewmodels/useCrmReportsViewModel";

export function CrmReportsView() {
  const router = useRouter();
  const { language } = useI18n();
  const isRtl = language === "ar";
  const canExport = usePermission(CRM_PERMISSIONS.REPORTS_EXPORT);

  const {
    state,
    selectedCurrency,
    setSelectedCurrency,
    activeCurrencyBreakdown,
    csvExportedNotice,
    refresh,
    exportCsvSummary,
  } = useCrmReportsViewModel();

  const report = state.report;
  const maxStageVal = activeCurrencyBreakdown
    ? Math.max(
        1,
        ...activeCurrencyBreakdown.stages.map((s) => s.totalAmount ?? s.dealCount)
      )
    : 1;

  return (
    <CrmShell activeTab="reports" onTabChange={() => {}}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-reports-view">
        <CrmSectionHeader
          title={
            language === "ar"
              ? "التقارير والتحليلات التجارية الموحدة"
              : "Scoped Commercial Pipeline & Funnel Analytics"
          }
          subtitle={
            language === "ar"
              ? "تحليلات مسار الصفقات المعزولة حسب العملة، قمع تأهيل العملاء المحتملين، ومعدلات الإغلاق"
              : "Multi-currency isolated pipeline velocity, lead qualification funnel, and D4-scoped commercial execution metrics"
          }
          badge={
            report
              ? `${report.currencyBreakdowns.length} ${
                  report.currencyBreakdowns.length === 1 ? "Currency Bucket" : "Currency Buckets"
                }`
              : "Live Analytics"
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {report && report.currencyBreakdowns.length > 0 && (
                <div
                  className="inline-flex items-center rounded-nx-md border border-nx-line bg-nx-raised p-0.5 gap-0.5"
                  data-testid="reports-currency-switcher"
                >
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
                          : "text-nx-ink-2 hover:text-nx-ink"
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
                <span>{language === "ar" ? "تحديث" : "Refresh"}</span>
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
                  <span>{language === "ar" ? "تصدير ملخص CSV" : "Export CSV Summary"}</span>
                </Button>
              )}
            </div>
          }
        />

        {csvExportedNotice && (
          <Alert className="border-success/40 bg-success/10 text-nx-ink" data-testid="csv-export-alert">
            <CheckCircle2 className="size-4 text-success" />
            <AlertTitle className="text-xs font-bold text-success">
              Scoped Commercial Report Prepared ({selectedCurrency})
            </AlertTitle>
            <AlertDescription className="text-xs text-nx-ink-2">
              Multi-currency pipeline snapshot, weighted stage forecast, and lead conversion funnel exported for currency bucket {selectedCurrency}.
            </AlertDescription>
          </Alert>
        )}

        {state.stage === "loading" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-nx-lg" />
              <Skeleton className="h-28 rounded-nx-lg" />
              <Skeleton className="h-28 rounded-nx-lg" />
              <Skeleton className="h-28 rounded-nx-lg" />
            </div>
            <Skeleton className="h-80 rounded-nx-lg" />
          </div>
        )}

        {state.stage === "failed" && (
          <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
            <AlertTitle>Failed to Load Commercial Analytics</AlertTitle>
            <AlertDescription className="mt-2 flex items-center justify-between text-xs">
              <span>{state.error}</span>
              <Button type="button" size="sm" variant="outline" onClick={refresh}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {state.stage === "success" && report && (
          <>
            {/* Top Executive KPI Cards (Currency-Safe) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5"
                data-testid="report-kpi-open-pipeline"
              >
                <div className="flex items-center justify-between text-xs text-nx-ink-3">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Active Pipeline ({activeCurrencyBreakdown?.currencyCode || "SAR"})
                  </span>
                  <TrendingUp className="size-4 text-nx-accent" />
                </div>
                <div className="text-xl font-bold text-nx-ink">
                  {report.isAmountMasked
                    ? "Masked (FLS)"
                    : `${activeCurrencyBreakdown?.currencyCode || "SAR"} ${(
                        activeCurrencyBreakdown?.totalOpenValue ?? 0
                      ).toLocaleString()}`}
                </div>
                <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
                  <span>{activeCurrencyBreakdown?.openDealsCount ?? 0} Open Opportunities</span>
                  <Badge variant="outline" className="text-[10px] border-nx-accent/30 bg-nx-accent-wash text-nx-accent">
                    Weighted: {activeCurrencyBreakdown?.currencyCode || "SAR"}{" "}
                    {(activeCurrencyBreakdown?.totalWeightedForecastValue ?? 0).toLocaleString()}
                  </Badge>
                </div>
              </Card>

              <Card
                className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5"
                data-testid="report-kpi-win-rate"
              >
                <div className="flex items-center justify-between text-xs text-nx-ink-3">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Commercial Win Rate
                  </span>
                  <Award className="size-4 text-success" />
                </div>
                <div className="text-xl font-bold text-nx-ink">
                  {report.winLoss.winRatePercent}%
                </div>
                <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
                  <span>
                    {report.winLoss.wonCount} Won / {report.winLoss.lostCount} Lost
                  </span>
                  <span className="text-nx-ink-3">
                    Avg Cycle: {report.winLoss.avgCycleDays}d
                  </span>
                </div>
              </Card>

              <Card
                className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5"
                data-testid="report-kpi-lead-conversion"
              >
                <div className="flex items-center justify-between text-xs text-nx-ink-3">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Lead Conversion Rate
                  </span>
                  <Target className="size-4 text-info" />
                </div>
                <div className="text-xl font-bold text-nx-ink">
                  {report.leadFunnel.conversionRatePercent}%
                </div>
                <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
                  <span>{report.leadFunnel.totalLeads} Scoped Leads</span>
                  <span className="text-nx-accent font-semibold">
                    {report.leadFunnel.qualificationRatePercent}% Qualified
                  </span>
                </div>
              </Card>

              <Card
                className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-1.5"
                data-testid="report-kpi-activities"
              >
                <div className="flex items-center justify-between text-xs text-nx-ink-3">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Execution & Follow-ups
                  </span>
                  <Activity className="size-4 text-warning" />
                </div>
                <div className="text-xl font-bold text-nx-ink">
                  {report.activities.totalActivitiesCount}
                </div>
                <div className="text-[11px] text-nx-ink-2 flex items-center justify-between">
                  <span>{report.activities.followUpsCreatedCount} Follow-up Tasks</span>
                  <span>{report.activities.communicationsSentCount} Outbound Sent</span>
                </div>
              </Card>
            </div>

            {/* Main Grid: Pipeline by Stage (Left 7 cols) + Lead Funnel & Win/Loss (Right 5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Pipeline by Stage Breakdown (Currency-Isolated) */}
              <Card
                className="lg:col-span-7 rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4"
                data-testid="report-stage-breakdown-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-nx-accent" />
                      <h3 className="text-sm font-bold text-nx-ink">
                        Pipeline Velocity & Weighted Forecast by Stage ({activeCurrencyBreakdown?.currencyCode || "SAR"})
                      </h3>
                    </div>
                    <p className="text-xs text-nx-ink-3 mt-0.5">
                      Strict currency isolation enforced — amounts are never summed across distinct currency codes.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/crm/pipelines")}
                    className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
                  >
                    <span>Workflow Canvas</span>
                    <ArrowUpRight className="size-3" />
                  </Button>
                </div>

                {activeCurrencyBreakdown && (
                  <div className="space-y-3.5">
                    {activeCurrencyBreakdown.stages.map((stage) => {
                      const rawMetric = stage.totalAmount ?? stage.dealCount;
                      const widthPct = Math.max(8, Math.min(100, Math.round((rawMetric / maxStageVal) * 100)));
                      return (
                        <div
                          key={stage.stageKey}
                          data-testid={`report-stage-row-${stage.stageKey}`}
                          className="rounded-nx-md border border-nx-line bg-nx-raised/40 p-3 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center size-5 rounded-full bg-nx-surface border border-nx-line text-[10px] font-bold text-nx-ink">
                                {stage.sortOrder}
                              </span>
                              <span className="text-xs font-bold text-nx-ink">
                                {language === "ar" ? stage.labelAr : stage.labelEn}
                              </span>
                              <Badge variant="outline" className="text-[10px] border-nx-line bg-nx-surface text-nx-ink-2">
                                {stage.probabilityPercent}% Win Prob
                              </Badge>
                              {stage.requiresVerifiedParty && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-warning/40 bg-warning/10 text-warning gap-1"
                                >
                                  <ShieldCheck className="size-2.5" />
                                  <span>PD-1 Party Gate</span>
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-nx-ink-3 font-medium">
                                {stage.dealCount} {stage.dealCount === 1 ? "Deal" : "Deals"}
                              </span>
                              <span className="font-bold text-nx-ink">
                                {report.isAmountMasked
                                  ? "Masked"
                                  : `${activeCurrencyBreakdown.currencyCode} ${(stage.totalAmount ?? 0).toLocaleString()}`}
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-2 rounded-full bg-nx-surface border border-nx-line overflow-hidden">
                            <div
                              className="h-full bg-nx-accent transition-all"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-nx-ink-3">
                            <span>Stage Key: {stage.stageKey}</span>
                            <span>
                              Weighted Forecast:{" "}
                              <strong className="text-nx-accent">
                                {report.isAmountMasked
                                  ? "Masked"
                                  : `${activeCurrencyBreakdown.currencyCode} ${(
                                      stage.weightedForecastAmount ?? 0
                                    ).toLocaleString()}`}
                              </strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Terminal Closed Won / Lost Summary Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-nx-line">
                      <div className="rounded-nx-md border border-success/30 bg-success/10 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-success" />
                          <div>
                            <div className="text-xs font-bold text-nx-ink">Closed Won ({activeCurrencyBreakdown.currencyCode})</div>
                            <div className="text-[11px] text-nx-ink-3">{activeCurrencyBreakdown.wonDealsCount} Deals Won</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-success">
                          {report.isAmountMasked
                            ? "Masked"
                            : `${activeCurrencyBreakdown.currencyCode} ${(
                                activeCurrencyBreakdown.totalWonValue ?? 0
                              ).toLocaleString()}`}
                        </div>
                      </div>

                      <div className="rounded-nx-md border border-destructive/30 bg-destructive/10 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="size-4 text-destructive" />
                          <div>
                            <div className="text-xs font-bold text-nx-ink">Closed Lost ({activeCurrencyBreakdown.currencyCode})</div>
                            <div className="text-[11px] text-nx-ink-3">{activeCurrencyBreakdown.lostDealsCount} Deals Lost</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-destructive">
                          {report.isAmountMasked
                            ? "Masked"
                            : `${activeCurrencyBreakdown.currencyCode} ${(
                                activeCurrencyBreakdown.totalLostValue ?? 0
                              ).toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Right Column: Lead Qualification Funnel + Activity Execution Summary */}
              <div className="lg:col-span-5 space-y-5">
                <Card
                  className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4"
                  data-testid="report-lead-funnel-card"
                >
                  <div className="flex items-center justify-between border-b border-nx-line pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Filter className="size-4 text-info" />
                        <h3 className="text-sm font-bold text-nx-ink">
                          Lead Qualification & Conversion Funnel
                        </h3>
                      </div>
                      <p className="text-xs text-nx-ink-3 mt-0.5">
                        Progression across New → Working → Qualified → Converted
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/crm/leads")}
                      className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
                    >
                      <span>Open Leads</span>
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        label: "1. New Intake Leads",
                        count: report.leadFunnel.newCount,
                        badgeClass: "border-nx-line bg-nx-raised text-nx-ink",
                      },
                      {
                        label: "2. Working / Contacted",
                        count: report.leadFunnel.workingCount,
                        badgeClass: "border-info/30 bg-info/10 text-info",
                      },
                      {
                        label: "3. Qualified Commercial Fit",
                        count: report.leadFunnel.qualifiedCount,
                        badgeClass: "border-nx-accent/30 bg-nx-accent-wash text-nx-accent",
                      },
                      {
                        label: "4. Converted to Deal",
                        count: report.leadFunnel.convertedCount,
                        badgeClass: "border-success/30 bg-success/10 text-success",
                      },
                      {
                        label: "Disqualified / Archived",
                        count: report.leadFunnel.disqualifiedCount,
                        badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
                      },
                    ].map((step) => {
                      const pct =
                        report.leadFunnel.totalLeads > 0
                          ? Math.round((step.count / report.leadFunnel.totalLeads) * 100)
                          : 0;
                      return (
                        <div
                          key={step.label}
                          className="rounded-nx-md border border-nx-line bg-nx-raised/40 px-3 py-2 flex items-center justify-between"
                        >
                          <span className="text-xs font-semibold text-nx-ink">{step.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-nx-ink-3">{pct}%</span>
                            <Badge variant="outline" className={cn("text-xs font-bold", step.badgeClass)}>
                              {step.count}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card
                  className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4"
                  data-testid="report-activity-execution-card"
                >
                  <div className="flex items-center justify-between border-b border-nx-line pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-warning" />
                      <h3 className="text-sm font-bold text-nx-ink">
                        Commercial Touchpoints & Follow-Up Telemetry
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/crm/activities")}
                      className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
                    >
                      <span>Execution Desk</span>
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
                      <div className="flex items-center justify-between text-nx-ink-3">
                        <span>Calls Logged</span>
                        <Phone className="size-3.5 text-info" />
                      </div>
                      <div className="text-lg font-bold text-nx-ink">{report.activities.callsCount}</div>
                    </div>

                    <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
                      <div className="flex items-center justify-between text-nx-ink-3">
                        <span>Meetings Held</span>
                        <Users className="size-3.5 text-nx-accent" />
                      </div>
                      <div className="text-lg font-bold text-nx-ink">{report.activities.meetingsCount}</div>
                    </div>

                    <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
                      <div className="flex items-center justify-between text-nx-ink-3">
                        <span>Communications Sent</span>
                        <Send className="size-3.5 text-success" />
                      </div>
                      <div className="text-lg font-bold text-nx-ink">
                        {report.activities.communicationsSentCount}
                      </div>
                    </div>

                    <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
                      <div className="flex items-center justify-between text-nx-ink-3">
                        <span>Follow-Up Tasks</span>
                        <CalendarCheck className="size-3.5 text-warning" />
                      </div>
                      <div className="text-lg font-bold text-nx-ink">
                        {report.activities.followUpsCreatedCount}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </CrmShell>
  );
}
