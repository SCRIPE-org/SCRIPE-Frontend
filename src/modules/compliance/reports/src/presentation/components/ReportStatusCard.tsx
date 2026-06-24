"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  FileText,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileJson,
  FileType,
} from "lucide-react";
import { ComplianceReport } from "../../domain/entities/ComplianceReport";
import type { ExportFormat } from "../viewmodels/useReportDetailViewModel";

/**
 * Metadata map linking each report status to its appropriate icon, label key,
 * and badge style class name.
 */
const STATUS_META: Record<string, { labelKey: string; icon: React.ReactNode; cls: string }> = {
  Ready: {
    labelKey: "compliance.status.ready",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    cls: "bg-emerald-500",
  },
  Pending: {
    labelKey: "compliance.status.pending",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    cls: "bg-amber-500",
  },
  Generating: {
    labelKey: "compliance.status.generating",
    icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
    cls: "bg-blue-500",
  },
  Failed: {
    labelKey: "compliance.status.failed",
    icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
    cls: "bg-destructive",
  },
};

/**
 * List of export formats with associated labels, icons, and localized descriptions.
 */
const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  descKey: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "csv",
    label: "CSV",
    descKey: "compliance.format.csvDesc",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    value: "xlsx",
    label: "Excel (XLSX)",
    descKey: "compliance.format.xlsxDesc",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  {
    value: "json",
    label: "JSON",
    descKey: "compliance.format.jsonDesc",
    icon: <FileJson className="h-4 w-4" />,
  },
  {
    value: "pdf",
    label: "PDF",
    descKey: "compliance.format.pdfDesc",
    icon: <FileType className="h-4 w-4" />,
  },
];

interface ReportStatusCardProps {
  report: ComplianceReport;
  typeLabel: string;
  downloadFormat: ExportFormat;
  setDownloadFormat: (format: ExportFormat) => void;
  isDownloadingPending: boolean;
  downloadExport: (format: ExportFormat) => void;
}

/**
 * ReportStatusCard Component
 *
 * Renders the primary card displaying report status, regulation details,
 * format selection dropdown, and the report download button.
 */
export function ReportStatusCard({
  report,
  typeLabel,
  downloadFormat,
  setDownloadFormat,
  isDownloadingPending,
  downloadExport,
}: ReportStatusCardProps) {
  const { t, direction } = useI18n();

  const meta = STATUS_META[report.status] ?? STATUS_META.Pending;
  const selectedFormat =
    FORMAT_OPTIONS.find((f) => f.value === downloadFormat) ?? FORMAT_OPTIONS[0];

  const cardBorderClass = report.isReady
    ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5"
    : "border-border/50";

  const iconWrapperClass = report.isReady
    ? "border-emerald-500/30 bg-emerald-500/10"
    : "border-border/50 bg-muted/50";

  return (
    <Card className={`border transition-all ${cardBorderClass}`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${iconWrapperClass}`}
            >
              {report.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{typeLabel}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {report.regulationCode && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {report.regulationCode}
                  </Badge>
                )}
                <Badge variant={report.isReady ? "default" : "secondary"} className="gap-1">
                  {meta.icon}
                  {t(meta.labelKey)}
                </Badge>
                {report.isPending && (
                  <span className="text-xs text-muted-foreground">
                    {t("compliance.autoRefreshing")}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{report.id}</p>
            </div>
          </div>

          {/* Download Actions */}
          {report.isReady && (
            <div className="flex shrink-0 items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="report-format-selector"
                    variant="outline"
                    size="sm"
                    className="min-w-[140px] gap-2"
                  >
                    {selectedFormat.icon}
                    <span>{selectedFormat.label}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={direction === "rtl" ? "start" : "end"}
                  className="w-[220px]"
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setDownloadFormat(opt.value)}
                      className="flex items-center gap-3 py-2.5"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                          downloadFormat === opt.value
                            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "border-border/50 bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{t(opt.descKey)}</span>
                      </div>
                      {downloadFormat === opt.value && (
                        <CheckCircle2 className="ms-auto h-4 w-4 text-indigo-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                id="report-detail-download"
                onClick={() => downloadExport(downloadFormat)}
                disabled={isDownloadingPending}
              >
                {isDownloadingPending ? (
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
  );
}
