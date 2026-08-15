"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardHeader, CardTitle } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileJson,
  FileType,
  type LucideIcon,
} from "lucide-react";
import { ComplianceReport } from "../../domain/entities/ComplianceReport";
import type { ExportFormat } from "../viewmodels/useReportDetailViewModel";

/**
 * Metadata map linking each report status to its glyph and measured badge tone.
 * `Generating` carries no glyph — it renders the shared loader instead, because
 * it is the only status that is genuinely in flight.
 */
const STATUS_META: Record<
  string,
  { labelKey: string; icon: LucideIcon | null; variant: "success" | "pending" | "info" | "error" }
> = {
  Ready: { labelKey: "compliance.status.ready", icon: CheckCircle2, variant: "success" },
  Pending: { labelKey: "compliance.status.pending", icon: Clock, variant: "pending" },
  Generating: { labelKey: "compliance.status.generating", icon: null, variant: "info" },
  Failed: { labelKey: "compliance.status.failed", icon: AlertTriangle, variant: "error" },
};

/**
 * Export formats. The labels are format identifiers, not prose — they read the
 * same in every language, which is why they are not routed through t().
 */
const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  descKey: string;
  icon: LucideIcon;
}[] = [
  { value: "csv", label: "CSV", descKey: "compliance.format.csvDesc", icon: FileText },
  {
    value: "xlsx",
    label: "Excel (XLSX)",
    descKey: "compliance.format.xlsxDesc",
    icon: FileSpreadsheet,
  },
  { value: "json", label: "JSON", descKey: "compliance.format.jsonDesc", icon: FileJson },
  { value: "pdf", label: "PDF", descKey: "compliance.format.pdfDesc", icon: FileType },
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
 * Renders the report's status and its export controls. The card itself stays a
 * neutral surface — status speaks through the glyph tile and the badge, so a
 * ready report and a failed one differ by reading, not by card colour.
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
  const StatusIcon = meta.icon;
  const selectedFormat =
    FORMAT_OPTIONS.find((f) => f.value === downloadFormat) ?? FORMAT_OPTIONS[0];
  const SelectedFormatIcon = selectedFormat.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-nx-md border ${
                report.isReady
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-nx-line bg-nx-raised text-nx-ink-3"
              }`}
              aria-hidden="true"
            >
              {report.isPending ? (
                <LoadingSpinner size="inline" showText={false} />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate">{typeLabel}</CardTitle>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {report.regulationCode && (
                  <Badge variant="outline" className="font-mono">
                    {report.regulationCode}
                  </Badge>
                )}
                <Badge variant={meta.variant}>
                  {StatusIcon ? (
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <LoadingSpinner size="inline" showText={false} />
                  )}
                  {t(meta.labelKey)}
                </Badge>
                {report.isPending && (
                  <span className="text-xs text-nx-ink-3">{t("compliance.autoRefreshing")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Download Actions */}
          {report.isReady && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="report-format-selector"
                    variant="outline"
                    size="sm"
                    className="min-w-36 gap-2"
                  >
                    {/* The visible label is a format identifier on its own —
                        the sr-only prefix is what makes it a named control. */}
                    <span className="sr-only">{t("compliance.exportFormat")}</span>
                    <SelectedFormatIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{selectedFormat.label}</span>
                    <ChevronDown className="ms-auto h-3 w-3 shrink-0" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={direction === "rtl" ? "start" : "end"} className="w-56">
                  <DropdownMenuRadioGroup
                    value={downloadFormat}
                    onValueChange={(value) => setDownloadFormat(value as ExportFormat)}
                  >
                    {FORMAT_OPTIONS.map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          className="gap-2.5 py-2"
                        >
                          <OptionIcon
                            className="h-4 w-4 shrink-0 text-nx-ink-3"
                            aria-hidden="true"
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium">{option.label}</span>
                            <span className="truncate text-xs text-nx-ink-3">
                              {t(option.descKey)}
                            </span>
                          </span>
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                id="report-detail-download"
                onClick={() => downloadExport(downloadFormat)}
                loading={isDownloadingPending}
              >
                {!isDownloadingPending && (
                  <Download className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {t("compliance.downloadReport")}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
