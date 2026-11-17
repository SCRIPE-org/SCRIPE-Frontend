"use client";

import React from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CircleDollarSign,
  Database,
  Eye,
  FileText,
  Info,
  Lock,
  Paperclip,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  chartColor,
  type ChartConfig,
} from "@core/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { StatCard } from "@core/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import {
  DATA_SOURCES_SCOPE,
  EXECUTIVE_INSIGHTS,
  EXPENSE_BREAKDOWN,
  FINANCIAL_KPIS,
  MONTHLY_FINANCIAL_SERIES,
  REVENUE_BY_UNIT,
  SUPPORTING_DOCUMENTS,
} from "../mock-data/financial-scenario.data";
import type { FinancialWorkspaceTab } from "../hooks/useAiCopilotDemo";

interface FinancialIntelligenceWorkspaceProps {
  activeTab: FinancialWorkspaceTab;
  onTabChange: (tab: FinancialWorkspaceTab) => void;
  selectedDocumentId: string | null;
  onSelectDocument: (id: string | null) => void;
  onOpenExecutivePreview: () => void;
}

export function FinancialIntelligenceWorkspace({
  activeTab,
  onTabChange,
  selectedDocumentId,
  onSelectDocument,
  onOpenExecutivePreview,
}: FinancialIntelligenceWorkspaceProps) {
  const { tc, language, direction } = useCopilotI18n();
  const isAr = language === "ar";

  const selectedDocument =
    SUPPORTING_DOCUMENTS.find((d) => d.id === selectedDocumentId) ?? null;

  const monthlyChartData = MONTHLY_FINANCIAL_SERIES.map((item) => ({
    month: isAr ? item.monthAr : item.monthEn,
    revenue: item.revenueM,
    expenses: item.expensesM,
  }));

  const monthlyChartConfig: ChartConfig = {
    revenue: {
      label: tc("financial.seriesRevenue"),
      color: chartColor(1),
    },
    expenses: {
      label: tc("financial.seriesExpenses"),
      color: chartColor(3),
    },
  };

  return (
    <div
      dir={direction}
      data-testid="financial-intelligence-workspace"
      className="flex h-full min-h-0 flex-col bg-nx-ground"
    >
      {/* Workspace Sub-Header */}
      <div className="shrink-0 border-b border-nx-line bg-nx-surface px-5 py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-nx-ink">
                {tc("financial.workspaceTitle")}
              </h3>
              <Badge variant="info" className="gap-1 text-[10px]">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                <span>{tc("header.previewBadge")}</span>
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-nx-ink-3">{tc("financial.workspaceSubtitle")}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenExecutivePreview}
            data-testid="workspace-preview-exec-btn"
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tc("financial.previewExecutiveReport")}</span>
          </Button>
        </div>

        {/* Workspace Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => onTabChange(val as FinancialWorkspaceTab)}
          className="mt-3"
        >
          <TabsList variant="underline" className="w-full justify-start gap-2 overflow-x-auto">
            <TabsTrigger value="overview" className="cursor-pointer gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{tc("financial.tabOverview")}</span>
            </TabsTrigger>
            <TabsTrigger value="sources" className="cursor-pointer gap-1.5 text-xs">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{tc("financial.tabSources")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              data-testid="financial-tab-attachments"
              className="cursor-pointer gap-1.5 text-xs"
            >
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {tc("financial.tabAttachments")} ({SUPPORTING_DOCUMENTS.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable Report Content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* 1. 4 Reconciled KPI StatCards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={tc("financial.kpiRevenue")}
                value={<span className="text-2xl">{isAr ? "4.85 مليون" : "4.85M"}</span>}
                suffix={isAr ? "ج.م" : "EGP"}
                subtitle={tc("financial.kpiRevenueSub")}
                icon={CircleDollarSign}
                tone="info"
                trend={{ value: FINANCIAL_KPIS.revenueGrowthPct }}
              />
              <StatCard
                label={tc("financial.kpiExpenses")}
                value={<span className="text-2xl">{isAr ? "3.72 مليون" : "3.72M"}</span>}
                suffix={isAr ? "ج.م" : "EGP"}
                subtitle={tc("financial.kpiExpensesSub")}
                icon={TrendingDown}
                tone="neutral"
                trend={{ value: FINANCIAL_KPIS.expenseGrowthPct }}
                invertTrend
              />
              <StatCard
                label={tc("financial.kpiSurplus")}
                value={<span className="text-2xl">{isAr ? "1.13 مليون" : "1.13M"}</span>}
                suffix={isAr ? "ج.م" : "EGP"}
                subtitle={tc("financial.kpiSurplusSub")}
                icon={TrendingUp}
                tone="success"
                trend={{ value: FINANCIAL_KPIS.operatingMarginPct }}
              />
              <StatCard
                label={tc("financial.kpiReceivables")}
                value={<span className="text-2xl">{isAr ? "740 ألف" : "740K"}</span>}
                suffix={isAr ? "ج.م" : "EGP"}
                subtitle={tc("financial.kpiReceivablesSub")}
                icon={Wallet}
                tone="warning"
                tooltip={tc("financial.receivablesNote")}
              />
            </div>

            {/* Accounting Basis Clarification */}
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs text-nx-ink-2">
                {tc("financial.receivablesNote")}
              </AlertDescription>
            </Alert>

            {/* 2. Monthly Chart + Business Unit / Expense Breakdown */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Monthly Revenue vs Expenses BarChart */}
              <Card className="border-nx-line bg-nx-surface lg:col-span-12">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-nx-ink">
                    {tc("financial.chartMonthlyTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs text-nx-ink-3">
                    {tc("financial.chartMonthlyDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ChartContainer config={monthlyChartConfig} className="h-[220px] w-full">
                    <BarChart data={monthlyChartData} barGap={8}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={46}
                        tickFormatter={(v) => `${v}M`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="revenue"
                        fill="var(--color-revenue)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={42}
                      />
                      <Bar
                        dataKey="expenses"
                        fill="var(--color-expenses)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={42}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue by Business Unit */}
              <Card className="border-nx-line bg-nx-surface lg:col-span-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-nx-ink">
                    {tc("financial.chartUnitsTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs text-nx-ink-3">
                    {tc("financial.chartUnitsDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {REVENUE_BY_UNIT.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-medium text-nx-ink">{tc(item.labelKey)}</span>
                        <span className="shrink-0 tabular-nums text-nx-ink-2">
                          {isAr ? item.formattedAmountAr : item.formattedAmountEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-nx-raised">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.sharePercent}%`,
                              backgroundColor: chartColor(item.chartSlot),
                            }}
                          />
                        </div>
                        <span className="w-10 text-end text-[11px] tabular-nums text-nx-ink-3">
                          {item.sharePercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card className="border-nx-line bg-nx-surface lg:col-span-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-nx-ink">
                    {tc("financial.chartExpensesTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs text-nx-ink-3">
                    {tc("financial.chartExpensesDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {EXPENSE_BREAKDOWN.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-medium text-nx-ink">{tc(item.labelKey)}</span>
                        <span className="shrink-0 tabular-nums text-nx-ink-2">
                          {isAr ? item.formattedAmountAr : item.formattedAmountEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-nx-raised">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.sharePercent}%`,
                              backgroundColor: chartColor(item.chartSlot),
                            }}
                          />
                        </div>
                        <span className="w-10 text-end text-[11px] tabular-nums text-nx-ink-3">
                          {item.sharePercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 3. AI Executive Insights */}
            <Card className="border-nx-line bg-nx-surface">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-3">
                <CardTitle className="text-sm font-semibold text-nx-ink">
                  {tc("financial.insightsTitle")}
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {tc("financial.insightsBadge")}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2">
                {EXECUTIVE_INSIGHTS.map((insight) => {
                  const badgeVariant =
                    insight.tone === "success"
                      ? "success"
                      : insight.tone === "warning"
                        ? "warning"
                        : "info";

                  return (
                    <div
                      key={insight.id}
                      className="rounded-nx-md border border-nx-line bg-nx-raised p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-nx-ink">{tc(insight.titleKey)}</p>
                        <Badge variant={badgeVariant} className="shrink-0 text-[10px]">
                          {insight.metricBadge}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-nx-ink-2">
                        {tc(insight.summaryKey)}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 4. Aggregate Payroll Privacy Guard */}
            <Alert variant="default" className="border-nx-line-hi bg-nx-surface">
              <Lock className="h-4 w-4 text-nx-accent" />
              <AlertTitle className="text-xs font-semibold text-nx-ink">
                {tc("financial.privacyTitle")}
              </AlertTitle>
              <AlertDescription className="mt-1 text-xs leading-relaxed text-nx-ink-2">
                {tc("financial.privacyBody")}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {activeTab === "sources" && (
          <Card className="border-nx-line bg-nx-surface">
            <CardHeader className="border-b border-nx-line">
              <CardTitle className="text-sm font-semibold text-nx-ink">
                {tc("financial.sourcesTitle")}
              </CardTitle>
              <CardDescription className="text-xs text-nx-ink-3">
                {tc("financial.sourcesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-nx-line bg-nx-raised hover:bg-nx-raised">
                    <TableHead className="text-xs font-semibold text-nx-ink-3">
                      {tc("financial.sourceColModule")}
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-nx-ink-3">
                      {tc("financial.sourceColEntities")}
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-nx-ink-3">
                      {tc("financial.sourceColRecords")}
                    </TableHead>
                    <TableHead className="text-end text-xs font-semibold text-nx-ink-3">
                      {tc("financial.sourceColContribution")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DATA_SOURCES_SCOPE.map((src) => (
                    <TableRow key={src.id} className="border-b border-nx-line text-xs">
                      <TableCell className="font-semibold text-nx-ink">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                          <span>{tc(src.nameKey)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-nx-ink-2">{tc(src.branchesKey)}</TableCell>
                      <TableCell className="tabular-nums text-nx-ink-2">
                        {tc(src.volumeKey)}
                      </TableCell>
                      <TableCell className="text-end font-semibold tabular-nums text-nx-ink">
                        {isAr ? src.contributionAr : src.contributionEn}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-4">
            <Card className="border-nx-line bg-nx-surface">
              <CardHeader className="border-b border-nx-line">
                <CardTitle className="text-sm font-semibold text-nx-ink">
                  {tc("financial.attachmentsTitle")}
                </CardTitle>
                <CardDescription className="text-xs text-nx-ink-3">
                  {tc("financial.attachmentsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-nx-line p-0">
                {SUPPORTING_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 p-4 transition-colors duration-nx-micro hover:bg-nx-hover sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {tc(doc.categoryKey)}
                        </Badge>
                        <span className="font-mono text-[11px] text-nx-ink-3">{doc.code}</span>
                        <Badge
                          variant={doc.status === "verified" ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {doc.status === "verified"
                            ? tc("financial.docStatusVerified")
                            : tc("financial.docStatusReview")}
                        </Badge>
                        {doc.privacyMasked && (
                          <Badge variant="outline" className="gap-1 text-[10px] text-nx-ink-2">
                            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                            <span>RBAC</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-nx-ink">{tc(doc.titleKey)}</p>
                      <p className="text-[11px] text-nx-ink-3">
                        {doc.dateRange} • {doc.recordCount} •{" "}
                        {isAr ? doc.amountSummaryAr : doc.amountSummaryEn}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectDocument(doc.id)}
                      data-testid={`doc-preview-btn-${doc.id}`}
                      className="h-8 shrink-0 cursor-pointer gap-1.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{tc("financial.docPreviewBtn")}</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Simulated Supporting Document Preview Dialog */}
      <Dialog
        open={Boolean(selectedDocument)}
        onOpenChange={(open) => {
          if (!open) onSelectDocument(null);
        }}
      >
        <DialogContent
          className="max-w-lg border-nx-line bg-nx-surface text-nx-ink"
          data-testid="supporting-doc-dialog"
        >
          {selectedDocument && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {tc(selectedDocument.categoryKey)}
                  </Badge>
                  <Badge
                    variant={selectedDocument.status === "verified" ? "success" : "warning"}
                    className="text-[10px]"
                  >
                    {selectedDocument.status === "verified"
                      ? tc("financial.docStatusVerified")
                      : tc("financial.docStatusReview")}
                  </Badge>
                </div>
                <DialogTitle className="mt-1 text-base font-semibold">
                  {tc(selectedDocument.titleKey)}
                </DialogTitle>
                <DialogDescription className="text-xs text-nx-ink-3">
                  {tc("financial.docModalSubtitle")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1">
                <div className="grid grid-cols-2 gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3 text-xs">
                  <div>
                    <p className="text-[11px] text-nx-ink-3">{tc("financial.docModalFieldCode")}</p>
                    <p className="font-mono font-semibold text-nx-ink">{selectedDocument.code}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tc("financial.docModalFieldPeriod")}
                    </p>
                    <p className="font-medium text-nx-ink">{selectedDocument.dateRange}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tc("financial.docModalFieldRecords")}
                    </p>
                    <p className="font-medium tabular-nums text-nx-ink">
                      {selectedDocument.recordCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-nx-ink-3">
                      {tc("financial.docModalFieldAmount")}
                    </p>
                    <p className="font-semibold tabular-nums text-nx-ink">
                      {isAr ? selectedDocument.amountSummaryAr : selectedDocument.amountSummaryEn}
                    </p>
                  </div>
                </div>

                {selectedDocument.privacyMasked && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs text-nx-ink-2">
                      {tc("financial.docPrivacyNotice")}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="rounded-nx-md border border-nx-line bg-nx-ground">
                  <Table>
                    <TableBody>
                      {selectedDocument.previewLines.map((line, idx) => (
                        <TableRow key={idx} className="border-b border-nx-line text-xs">
                          <TableCell className="py-2 text-nx-ink-2">
                            {tc(line.labelKey)}
                          </TableCell>
                          <TableCell className="py-2 text-end font-semibold tabular-nums text-nx-ink">
                            {isAr ? line.valueAr : line.valueEn}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-[11px] leading-relaxed text-nx-ink-3">
                  {tc(selectedDocument.previewSummaryKey)}
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectDocument(null)}
                  className="cursor-pointer"
                >
                  {tc("academy.closeLabel")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
