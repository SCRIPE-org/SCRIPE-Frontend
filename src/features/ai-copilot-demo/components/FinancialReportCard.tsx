"use client";

import React from "react";
import {
  BarChart3,
  Database,
  FileSpreadsheet,
  FileText,
  Lock,
  Paperclip,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { chartColor } from "@core/ui/chart";
import { Separator } from "@core/ui/separator";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import {
  EXECUTIVE_INSIGHTS,
  FINANCIAL_KPIS,
  MONTHLY_FINANCIAL_SERIES,
  SUPPORTING_DOCUMENTS,
} from "../mock-data/financial-scenario.data";
import type { FinancialWorkspaceTab } from "../hooks/useAiCopilotDemo";

interface FinancialReportCardProps {
  isWorkspaceExpanded: boolean;
  onOpenWorkspace: (tab: FinancialWorkspaceTab) => void;
  onOpenExecutivePreview: () => void;
}

export function FinancialReportCard({
  isWorkspaceExpanded,
  onOpenWorkspace,
  onOpenExecutivePreview,
}: FinancialReportCardProps) {
  const { tc, language, direction } = useCopilotI18n();
  const isAr = language === "ar";

  return (
    <Card
      dir={direction}
      data-testid="financial-summary-card"
      className="border-nx-line bg-nx-surface"
    >
      <CardHeader className="border-b border-nx-line px-3.5 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-nx-sm bg-nx-accent-wash text-nx-accent">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xs font-semibold text-nx-ink">
                {tc("financial.inlineCardTitle")}
              </CardTitle>
              <p className="text-[11px] text-nx-ink-3">{tc("financial.inlineCardSubtitle")}</p>
            </div>
          </div>
          <Badge variant="info" className="text-[10px]">
            {tc("header.previewBadge")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3.5">
        {/* 2x2 Compact Reconciled KPI Strip */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
            <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiRevenue")}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-nx-ink">
              {isAr ? FINANCIAL_KPIS.revenueFormattedAr : FINANCIAL_KPIS.revenueFormattedEn}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-success">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              <span>{tc("financial.inlineQuarterDelta")}</span>
            </p>
          </div>

          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
            <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiExpenses")}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-nx-ink">
              {isAr ? FINANCIAL_KPIS.expensesFormattedAr : FINANCIAL_KPIS.expensesFormattedEn}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-3">49.7% {tc("financial.expPayroll")}</p>
          </div>

          <div className="rounded-nx-md border border-success/30 bg-success/5 p-2.5">
            <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiSurplus")}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-success">
              {isAr ? FINANCIAL_KPIS.surplusFormattedAr : FINANCIAL_KPIS.surplusFormattedEn}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-2">
              {tc("financial.inlineMarginLabel")}
            </p>
          </div>

          <div className="rounded-nx-md border border-warning-strong/30 bg-warning/10 p-2.5">
            <p className="text-[11px] text-nx-ink-3">{tc("financial.kpiReceivables")}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-nx-warning-strong">
              {isAr ? FINANCIAL_KPIS.receivablesFormattedAr : FINANCIAL_KPIS.receivablesFormattedEn}
            </p>
            <p className="mt-0.5 text-[10px] text-nx-ink-2">
              {tc("financial.inlineAccountsLabel")}
            </p>
          </div>
        </div>

        {/* Mini Monthly Progression Bars */}
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-2.5">
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-medium text-nx-ink">{tc("financial.chartMonthlyTitle")}</span>
            <span className="tabular-nums text-nx-ink-3">{tc("financial.inlinePeriodShort")}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTHLY_FINANCIAL_SERIES.map((m) => (
              <div key={m.id} className="space-y-1">
                <div className="flex h-11 items-end gap-1 rounded-nx-sm bg-nx-surface/60 px-1.5 pt-1">
                  <div
                    className="w-1/2 rounded-t-sm"
                    style={{
                      height: `${Math.round((m.revenueM / 1.8) * 100)}%`,
                      backgroundColor: chartColor(1),
                    }}
                    title={`${tc("financial.seriesRevenue")}: ${m.revenueM}`}
                  />
                  <div
                    className="w-1/2 rounded-t-sm"
                    style={{
                      height: `${Math.round((m.expensesM / 1.8) * 100)}%`,
                      backgroundColor: chartColor(3),
                    }}
                    title={`${tc("financial.seriesExpenses")}: ${m.expensesM}`}
                  />
                </div>
                <p className="text-center text-[10px] font-medium text-nx-ink-2">
                  {isAr ? m.monthAr : m.monthEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Insight + Payroll Privacy Notice */}
        <div className="space-y-1.5 rounded-nx-md border border-nx-line bg-nx-raised/70 p-2.5 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-nx-ink">
              {tc(EXECUTIVE_INSIGHTS[3].titleKey)}
            </span>
            <Badge variant="warning" className="text-[10px]">
              {EXECUTIVE_INSIGHTS[3].metricBadge}
            </Badge>
          </div>
          <p className="leading-relaxed text-nx-ink-2">{tc(EXECUTIVE_INSIGHTS[3].summaryKey)}</p>
          <Separator className="my-1.5 bg-nx-line" />
          <p className="flex items-center gap-1.5 text-[10px] text-nx-ink-3">
            <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{tc("financial.privacyTitle")}</span>
          </p>
        </div>

        {/* Report Actions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenWorkspace("overview")}
            data-testid="financial-view-full-report-btn"
            className="h-8 cursor-pointer gap-1.5 text-xs font-semibold"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {isWorkspaceExpanded
                ? tc("financial.viewFullReport")
                : tc("financial.viewFullReport")}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenWorkspace("sources")}
            data-testid="financial-inspect-sources-btn"
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tc("financial.inspectSources")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenWorkspace("attachments")}
            data-testid="financial-view-attachments-btn"
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {tc("financial.viewAttachments")} ({SUPPORTING_DOCUMENTS.length})
            </span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenExecutivePreview}
            data-testid="financial-preview-exec-btn"
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tc("financial.previewExecutiveReport")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
