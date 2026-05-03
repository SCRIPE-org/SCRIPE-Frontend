"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  FileType,
  Loader2,
  AlertTriangle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { toast } from "@core/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import { complianceContainer } from "@modules/compliance/di";
import type { ComplianceReport } from "../../domain/entities/ComplianceReport";

// ── Status meta ────────────────────────────────────────────────────────────────

const STATUS_META = {
  Ready: { label: "Ready", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, cls: "bg-emerald-500" },
  Pending: { label: "Pending", icon: <Clock className="h-4 w-4 text-amber-500" />, cls: "bg-amber-500" },
  Generating: { label: "Generating…", icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />, cls: "bg-blue-500" },
  Failed: { label: "Failed", icon: <AlertTriangle className="h-4 w-4 text-destructive" />, cls: "bg-destructive" },
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  GDPR_Overview: "GDPR Overview Report",
  DSR_Summary: "DSR Activity Summary",
  Consent_Audit: "Consent Audit Report",
  Retention_Analysis: "Retention Analysis Report",
  Data_Inventory: "Data Inventory Export",
};

// ── Format Options ─────────────────────────────────────────────────────────────

type ExportFormat = "csv" | "json" | "xlsx" | "pdf";

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "csv", label: "CSV", icon: <FileText className="h-4 w-4" />, description: "Comma-separated values" },
  { value: "xlsx", label: "Excel (XLSX)", icon: <FileSpreadsheet className="h-4 w-4" />, description: "Microsoft Excel format" },
  { value: "json", label: "JSON", icon: <FileJson className="h-4 w-4" />, description: "Structured JSON data" },
  { value: "pdf", label: "PDF", icon: <FileType className="h-4 w-4" />, description: "Portable Document Format" },
];

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: ".csv",
  json: ".json",
  xlsx: ".xlsx",
  pdf: ".pdf",
};

// ── Report Detail View ─────────────────────────────────────────────────────────

export function ReportDetailView({ id }: { id: string }) {
  useModuleLocales(() => import("../../../locales"), "compliance-reports");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
  const { reportRepository } = complianceContainer;
  const queryClient = useQueryClient();
  const [downloadFormat, setDownloadFormat] = useState<ExportFormat>("csv");

  const query = useQuery({
    queryKey: ["compliance", "report", id],
    queryFn: () => reportRepository.getById(id),
    // Poll every 5s while report is still pending
    refetchInterval: (query) => {
      const r = query.state.data as ComplianceReport | undefined;
      return r?.isPending ? 5_000 : false;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (format: ExportFormat) => reportRepository.download(id, format),
    onSuccess: (blob, format) => {
      const ext = FORMAT_EXTENSIONS[format];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliance-report-${id}${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("common.success") ?? "Download started", variant: "default" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const report = query.data;
  const meta = report ? (STATUS_META[report.status] ?? STATUS_META.Pending) : null;
  const typeLabel = report ? (REPORT_TYPE_LABELS[report.reportType] ?? report.reportType) : "";
  const selectedFormat = FORMAT_OPTIONS.find((f) => f.value === downloadFormat) ?? FORMAT_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/compliance/reports")}>
          <BackIcon className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 p-2.5">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("compliance.reportsTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("compliance.reportDetail") ?? "Report Details"}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      ) : query.isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={() => query.refetch()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      ) : report && meta ? (
        <div className="space-y-4">
          {/* Status card */}
          <Card className={`border transition-all ${report.isReady ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5" : "border-border/50"}`}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${report.isReady ? "border-emerald-500/30 bg-emerald-500/10" : "border-border/50 bg-muted/50"}`}>
                    {report.isPending ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{typeLabel}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {report.regulationCode && (
                        <Badge variant="outline" className="font-mono text-xs">{report.regulationCode}</Badge>
                      )}
                      <Badge variant={report.isReady ? "default" : "secondary"} className="gap-1">
                        {meta.icon}
                        {meta.label}
                      </Badge>
                      {report.isPending && (
                        <span className="text-xs text-muted-foreground">Auto-refreshing…</span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{report.id}</p>
                  </div>
                </div>

                {/* Download Actions — Format Dropdown + Download Button */}
                {report.isReady && (
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Format selector dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          id="report-format-selector"
                          variant="outline"
                          size="sm"
                          className="gap-2 min-w-[140px]"
                        >
                          {selectedFormat.icon}
                          <span>{selectedFormat.label}</span>
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={direction === "rtl" ? "start" : "end"} className="w-[220px]">
                        {FORMAT_OPTIONS.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={() => setDownloadFormat(opt.value)}
                            className="flex items-center gap-3 py-2.5"
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                              downloadFormat === opt.value
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : "border-border/50 bg-muted/30 text-muted-foreground"
                            }`}>
                              {opt.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.description}</span>
                            </div>
                            {downloadFormat === opt.value && (
                              <CheckCircle2 className="ms-auto h-4 w-4 text-indigo-500" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Download button */}
                    <Button
                      id="report-detail-download"
                      onClick={() => downloadMutation.mutate(downloadFormat)}
                      disabled={downloadMutation.isPending}
                    >
                      {downloadMutation.isPending ? (
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="me-2 h-4 w-4" />
                      )}
                      {t("compliance.downloadReport")}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* MVP Info banner */}
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="flex items-start gap-3 p-4">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                  {t("compliance.mvpExportTitle") ?? "MVP Export Notice"}
                </p>
                <p className="mt-0.5 text-xs text-indigo-600/70 dark:text-indigo-400/70">
                  {t("compliance.mvpExportDesc") ?? "Compliance reporting is currently in MVP. Downloads contain metadata summaries. Full rich data with charts and detailed breakdowns are planned for a future release."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: t("compliance.periodStart") ?? "Period Start",
                value: report.periodStart?.toLocaleDateString() ?? "—",
                icon: <Calendar className="h-3.5 w-3.5" />,
              },
              {
                label: t("compliance.periodEnd") ?? "Period End",
                value: report.periodEnd?.toLocaleDateString() ?? "—",
                icon: <Calendar className="h-3.5 w-3.5" />,
              },
              {
                label: t("compliance.period") ?? "Generated At",
                value: report.generatedAt?.toLocaleDateString() ?? "—",
                icon: <CheckCircle2 className="h-3.5 w-3.5" />,
              },
            ].map((item) => (
              <Card key={item.label} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {item.icon}
                    {item.label}
                  </div>
                  <p className="mt-1 font-semibold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending info banner */}
          {report.isPending && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="flex items-start gap-3 p-4">
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    {t("compliance.reportQueuedInfo") ?? "Report generation is in progress…"}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-600/70 dark:text-blue-400/70">
                    {t("compliance.reportQueuedDesc") ?? "This page will refresh automatically. This usually completes within seconds."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
