"use client";

/**
 * AuditExportDialog
 *
 * Professional export modal with interval selection (daily/weekly/monthly/yearly/custom),
 * format selection (CSV, Excel, PDF), filter summary, and download trigger.
 *
 * SOLID: Pure UI — delegates all logic to useExportAudit hook.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useExportAudit, type ExportFormat } from "../viewmodels/useExportAudit";
import type { AuditFilterState } from "../viewmodels/useAuditViewModel";
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
import { Badge } from "@core/ui/badge";
import {
  FileSpreadsheet,
  FileText,
  FileDown,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AuditExportDialogProps {
  open: boolean;
  onClose: () => void;
  filters: AuditFilterState;
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
    color: "text-emerald-500",
    borderActive: "border-emerald-500 bg-emerald-500/10",
  },
  {
    value: "excel",
    icon: <FileSpreadsheet className="h-8 w-8" />,
    color: "text-blue-500",
    borderActive: "border-blue-500 bg-blue-500/10",
  },
  {
    value: "pdf",
    icon: <FileDown className="h-8 w-8" />,
    color: "text-red-500",
    borderActive: "border-red-500 bg-red-500/10",
  },
];

export function AuditExportDialog({ open, onClose, filters }: AuditExportDialogProps) {
  const { t } = useI18n();
  const { exportAudit, isExporting, error } = useExportAudit();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("excel");
  const [success, setSuccess] = useState(false);
  const [intervalDates, setIntervalDates] = useState<IntervalDates>({ dateFrom: "", dateTo: "" });

  const handleExport = async () => {
    setSuccess(false);
    try {
      // Merge interval dates into filters (interval overrides filter dates)
      const mergedFilters: AuditFilterState = {
        ...filters,
        dateFrom: intervalDates.dateFrom || filters.dateFrom,
        dateTo: intervalDates.dateTo || filters.dateTo,
      };
      await exportAudit({ format: selectedFormat, filters: mergedFilters });
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

  // Active filter summary (non-date filters)
  const activeFilters: string[] = [];
  if (filters.eventType)
    activeFilters.push(`${t("audit.filters.eventType")}: ${filters.eventType}`);
  if (filters.username) activeFilters.push(`${t("audit.filters.username")}: ${filters.username}`);
  if (filters.entityType)
    activeFilters.push(`${t("audit.filters.entityType")}: ${filters.entityType}`);
  if (filters.isSuccess !== undefined)
    activeFilters.push(
      `${t("audit.filters.status")}: ${filters.isSuccess ? t("audit.filters.success") : t("audit.filters.failed")}`
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            {t("audit.export.title")}
          </DialogTitle>
          <DialogDescription>{t("audit.export.description")}</DialogDescription>
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
                {t(`audit.export.formats.${opt.value}`)}
              </span>
            </button>
          ))}
        </div>

        {/* Active Filters Summary */}
        {activeFilters.length > 0 && (
          <div className="space-y-1.5 rounded-md bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {t("audit.export.appliedFilters")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-600">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {t("audit.export.success")}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} loading={isExporting}>
            {!isExporting && <FileDown className="mr-2 h-4 w-4" />}
            {isExporting ? t("audit.export.generating") : t("audit.export.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
