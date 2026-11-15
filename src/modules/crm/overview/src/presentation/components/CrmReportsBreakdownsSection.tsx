"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  BarChart3,
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
} from "lucide-react";
import { cn } from "@core/common/utils";
import { STAGE_COLOR_PALETTE, resolveDefaultStageColor } from "../../domain/constants/crmWorkflowDefaults";
import type { CrmCommercialReport, CrmCurrencyPipelineBreakdown } from "../viewmodels/useCrmReportsViewModel";

interface CrmReportsBreakdownsSectionProps {
  report: CrmCommercialReport;
  activeCurrencyBreakdown: CrmCurrencyPipelineBreakdown | null;
  maxStageVal: number;
  language: string;
}

export function CrmReportsBreakdownsSection({
  report,
  activeCurrencyBreakdown,
  maxStageVal,
  language,
}: CrmReportsBreakdownsSectionProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <Card
        className="lg:col-span-7 rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4"
        data-testid="report-stage-breakdown-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-nx-accent" />
              <h3 className="text-sm font-bold text-nx-ink">
                {t("crm.reports.velocityTitle")} ({activeCurrencyBreakdown?.currencyCode || "SAR"})
              </h3>
            </div>
            <p className="text-xs text-nx-ink-3 mt-0.5">
              {t("crm.reports.velocitySubtitle")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/crm/pipelines")}
            className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
          >
            <span>{t("crm.reports.workflowCanvasBtn")}</span>
            <ArrowUpRight className="size-3" />
          </Button>
        </div>

        {activeCurrencyBreakdown && (
          <div className="space-y-3.5">
            {activeCurrencyBreakdown.stages.map((stage) => {
              const rawMetric = stage.totalAmount ?? stage.dealCount;
              const widthPct = Math.max(8, Math.min(100, Math.round((rawMetric / maxStageVal) * 100)));
              const stageColor = resolveDefaultStageColor(stage.stageKey, undefined, stage.sortOrder);
              const colorMeta = STAGE_COLOR_PALETTE[stageColor] ?? STAGE_COLOR_PALETTE.blue;
              return (
                <div
                  key={stage.stageKey}
                  data-testid={`report-stage-row-${stage.stageKey}`}
                  data-stage-color={stageColor}
                  className={cn(
                    "rounded-nx-md border p-3 space-y-2",
                    colorMeta.headerBorderClass,
                    colorMeta.borderClass
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex items-center justify-center size-5 rounded-full border text-[10px] font-bold", colorMeta.badgeClass)}>
                        {stage.sortOrder}
                      </span>
                      <span className="text-xs font-bold text-nx-ink">
                        {language === "ar" ? stage.labelAr : stage.labelEn}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px] border", colorMeta.badgeClass)}>
                        {stage.probabilityPercent}% {t("crm.reports.winProbSuffix")}
                      </Badge>
                      {stage.requiresVerifiedParty && (
                        <Badge variant="outline" className="text-[10px] border-warning-strong/40 bg-warning/10 text-nx-warning-strong gap-1">
                          <ShieldCheck className="size-2.5" />
                          <span>{t("crm.reports.customerVerificationGateBadge")}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-nx-ink-3 font-medium">
                        {stage.dealCount} {stage.dealCount === 1 ? t("crm.reports.dealSingular") : t("crm.reports.dealPlural")}
                      </span>
                      <span className="font-bold text-nx-ink">
                        {report.isAmountMasked
                          ? t("crm.reports.maskedValue")
                          : `${activeCurrencyBreakdown.currencyCode} ${(stage.totalAmount ?? 0).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-nx-surface border border-nx-line overflow-hidden">
                    <div className={cn("h-full transition-all", colorMeta.dotClass)} style={{ width: `${widthPct}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-nx-ink-3">
                    <span>{t("crm.reports.stageKeyPrefix")}: {stage.stageKey}</span>
                    <span>
                      {t("crm.reports.weightedForecastLabel")}:{" "}
                      <strong className="text-nx-accent">
                        {report.isAmountMasked
                          ? t("crm.reports.maskedValue")
                          : `${activeCurrencyBreakdown.currencyCode} ${(stage.weightedForecastAmount ?? 0).toLocaleString()}`}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-nx-line">
              <div className="rounded-nx-md border border-success/30 bg-success/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" />
                  <div>
                    <div className="text-xs font-bold text-nx-ink">{t("crm.reports.closedWonTitle")} ({activeCurrencyBreakdown.currencyCode})</div>
                    <div className="text-[11px] text-nx-ink-3">{activeCurrencyBreakdown.wonDealsCount} {t("crm.reports.dealsWonSuffix")}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-success">
                  {report.isAmountMasked
                    ? t("crm.reports.maskedValue")
                    : `${activeCurrencyBreakdown.currencyCode} ${(activeCurrencyBreakdown.totalWonValue ?? 0).toLocaleString()}`}
                </div>
              </div>

              <div className="rounded-nx-md border border-destructive/30 bg-destructive/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-destructive" />
                  <div>
                    <div className="text-xs font-bold text-nx-ink">{t("crm.reports.closedLostTitle")} ({activeCurrencyBreakdown.currencyCode})</div>
                    <div className="text-[11px] text-nx-ink-3">{activeCurrencyBreakdown.lostDealsCount} {t("crm.reports.dealsLostSuffix")}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-destructive">
                  {report.isAmountMasked
                    ? t("crm.reports.maskedValue")
                    : `${activeCurrencyBreakdown.currencyCode} ${(activeCurrencyBreakdown.totalLostValue ?? 0).toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="lg:col-span-5 space-y-5">
        <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4" data-testid="report-lead-funnel-card">
          <div className="flex items-center justify-between border-b border-nx-line pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-info" />
                <h3 className="text-sm font-bold text-nx-ink">{t("crm.reports.leadFunnelTitle")}</h3>
              </div>
              <p className="text-xs text-nx-ink-3 mt-0.5">{t("crm.reports.leadFunnelSubtitle")}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/crm/leads")}
              className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
            >
              <span>{t("crm.reports.openLeadsBtn")}</span>
              <ArrowUpRight className="size-3" />
            </Button>
          </div>

          <div className="space-y-2.5">
            {[
              { label: t("crm.reports.funnelStep1"), count: report.leadFunnel.newCount, badgeClass: "border-nx-line bg-nx-raised text-nx-ink" },
              { label: t("crm.reports.funnelStep2"), count: report.leadFunnel.workingCount, badgeClass: "border-info/30 bg-info/10 text-info" },
              { label: t("crm.reports.funnelStep3"), count: report.leadFunnel.qualifiedCount, badgeClass: "border-nx-accent/30 bg-nx-accent-wash text-nx-accent" },
              { label: t("crm.reports.funnelStep4"), count: report.leadFunnel.convertedCount, badgeClass: "border-success/30 bg-success/10 text-success" },
              { label: t("crm.reports.funnelStepDisqualified"), count: report.leadFunnel.disqualifiedCount, badgeClass: "border-destructive/30 bg-destructive/10 text-destructive" },
            ].map((step) => {
              const pct = report.leadFunnel.totalLeads > 0 ? Math.round((step.count / report.leadFunnel.totalLeads) * 100) : 0;
              return (
                <div key={step.label} className="rounded-nx-md border border-nx-line bg-nx-raised/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-nx-ink">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-nx-ink-3">{pct}%</span>
                    <Badge variant="outline" className={cn("text-xs font-bold", step.badgeClass)}>{step.count}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4" data-testid="report-activity-execution-card">
          <div className="flex items-center justify-between border-b border-nx-line pb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-nx-warning-strong" />
              <h3 className="text-sm font-bold text-nx-ink">{t("crm.reports.touchpointsTitle")}</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/crm/activities")}
              className="h-7 text-xs border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink gap-1"
            >
              <span>{t("crm.reports.executionDeskBtn")}</span>
              <ArrowUpRight className="size-3" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
              <div className="flex items-center justify-between text-nx-ink-3">
                <span>{t("crm.reports.callsLoggedLabel")}</span>
                <Phone className="size-3.5 text-info" />
              </div>
              <div className="text-lg font-bold text-nx-ink">{report.activities.callsCount}</div>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
              <div className="flex items-center justify-between text-nx-ink-3">
                <span>{t("crm.reports.meetingsHeldLabel")}</span>
                <Users className="size-3.5 text-nx-accent" />
              </div>
              <div className="text-lg font-bold text-nx-ink">{report.activities.meetingsCount}</div>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
              <div className="flex items-center justify-between text-nx-ink-3">
                <span>{t("crm.reports.communicationsSentLabel")}</span>
                <Send className="size-3.5 text-success" />
              </div>
              <div className="text-lg font-bold text-nx-ink">{report.activities.communicationsSentCount}</div>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1">
              <div className="flex items-center justify-between text-nx-ink-3">
                <span>{t("crm.reports.followUpTasksLabel")}</span>
                <CalendarCheck className="size-3.5 text-nx-warning-strong" />
              </div>
              <div className="text-lg font-bold text-nx-ink">{report.activities.followUpsCreatedCount}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
