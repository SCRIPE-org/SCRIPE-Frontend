"use client";

/**
 * ReportExportDialog — Reusable export dialog for dashboard pages.
 *
 * Combines interval selection (daily/weekly/monthly/yearly/custom)
 * with format selection (CSV, Excel, PDF) and download trigger.
 *
 * Used by: DashboardView, TenantAnalyticsView, SecurityDashboardView.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useExportReport, type ExportFormat } from "@core/hooks/use-export-report";
import { ExportIntervalSelect, type IntervalDates } from "@core/ui/export-interval-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import {
  FileSpreadsheet,
  FileText,
  FileDown,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ReportExportDialogProps {
  open: boolean;
  onClose: () => void;
  /** API endpoint path for the export (e.g., '/Dashboard/export') */
  endpoint: string;
  /** Translation key prefix for title/description (e.g., 'export.overview') */
  titleKey: string;
  descriptionKey: string;
}

interface FormatOption {
  value: ExportFormat;
  icon: React.ReactNode;
  color: string;
  borderActive: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: "csv",
    icon: <FileText className="h-8 w-8" />,
    color: "text-success",
    borderActive: "border-success bg-success/10",
  },
  {
    value: "excel",
    icon: <FileSpreadsheet className="h-8 w-8" />,
    color: "text-info",
    borderActive: "border-info bg-info/10",
  },
  {
    value: "pdf",
    icon: <FileDown className="h-8 w-8" />,
    color: "text-destructive",
    borderActive: "border-destructive bg-destructive/10",
  },
];

export function ReportExportDialog({
  open,
  onClose,
  endpoint,
  titleKey,
  descriptionKey,
}: ReportExportDialogProps) {
  const { t } = useI18n();
  const { exportReport, isExporting, error } = useExportReport();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("excel");
  const [success, setSuccess] = useState(false);
  const [intervalDates, setIntervalDates] = useState<IntervalDates>({ dateFrom: "", dateTo: "" });

  const handleExport = async () => {
    setSuccess(false);
    try {
      await exportReport({
        endpoint,
        format: selectedFormat,
        dateFrom: intervalDates.dateFrom || undefined,
        dateTo: intervalDates.dateTo || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch {
      // Error handled by hook
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isExporting) {
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            {t(titleKey)}
          </DialogTitle>
          <DialogDescription>{t(descriptionKey)}</DialogDescription>
        </DialogHeader>

        {/* Time Period / Interval Selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("export.interval.label")}</p>
          <ExportIntervalSelect value={intervalDates} onChange={setIntervalDates} />
        </div>

        {/* Format Cards */}
        <div className="grid grid-cols-3 gap-3 py-2">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedFormat(opt.value)}
              disabled={isExporting}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:shadow-md ${selectedFormat === opt.value ? opt.borderActive : "border-border hover:border-muted-foreground/30"} ${isExporting ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
            >
              <span className={opt.color}>{opt.icon}</span>
              <span className="text-sm font-semibold uppercase">
                {opt.value === "excel" ? "XLSX" : opt.value.toUpperCase()}
              </span>
              <span className="text-center text-[10px] leading-tight text-muted-foreground">
                {t(`export.formats.${opt.value}`)}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 rounded-md bg-success/10 p-3 text-sm text-success">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {t("export.success")}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("export.generating")}
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                {t("export.download")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
