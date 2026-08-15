// UI-EXCEPTION: compact studio layout
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
import { cn } from "@core/common/utils";
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
import { FileSpreadsheet, FileText, FileDown, CheckCircle, AlertCircle } from "lucide-react";

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
    icon: <FileText className="h-8 w-8" aria-hidden="true" />,
    color: "text-success",
    borderActive: "border-success bg-success/10",
  },
  {
    value: "excel",
    icon: <FileSpreadsheet className="h-8 w-8" aria-hidden="true" />,
    color: "text-info",
    borderActive: "border-info bg-info/10",
  },
  {
    value: "pdf",
    icon: <FileDown className="h-8 w-8" aria-hidden="true" />,
    color: "text-destructive",
    borderActive: "border-destructive bg-destructive/10",
  },
];

/**
 * Presentation UI component rendering the audit export dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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

  // Active filter summary (non-date filters) — event/entity type values are
  // API enum members, so they render through the same audit.eventTypes /
  // audit.entityTypes dictionaries the filter panel uses rather than as the
  // raw payload string.
  const activeFilters: string[] = [];
  if (filters.eventType)
    activeFilters.push(
      `${t("audit.filters.eventType")}: ${t(`audit.eventTypes.${filters.eventType}`)}`
    );
  if (filters.username) activeFilters.push(`${t("audit.filters.username")}: ${filters.username}`);
  if (filters.entityType)
    activeFilters.push(
      `${t("audit.filters.entityType")}: ${t(`audit.entityTypes.${filters.entityType}`)}`
    );
  if (filters.isSuccess !== undefined)
    activeFilters.push(
      `${t("audit.filters.status")}: ${filters.isSuccess ? t("audit.filters.success") : t("audit.filters.failed")}`
    );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" aria-hidden="true" />
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
        <div
          className="grid grid-cols-3 gap-3 py-2"
          role="group"
          aria-label={t("audit.export.formatLabel")}
        >
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedFormat(opt.value)}
              disabled={isExporting}
              aria-pressed={selectedFormat === opt.value}
              className={cn(
                "flex flex-col items-center gap-2 rounded-nx-md border p-4 text-center",
                "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                selectedFormat === opt.value
                  ? opt.borderActive
                  : "border-nx-line hover:border-nx-line-hi"
              )}
            >
              <span className={opt.color}>{opt.icon}</span>
              <span className="text-sm font-semibold uppercase">
                {opt.value === "excel" ? "XLSX" : opt.value.toUpperCase()}
              </span>
              <span className="text-center text-[10px] leading-tight text-nx-ink-3">
                {t(`audit.export.formats.${opt.value}`)}
              </span>
            </button>
          ))}
        </div>

        {/* Active Filters Summary */}
        {activeFilters.length > 0 && (
          <div className="space-y-1.5 rounded-nx-md bg-nx-raised p-3">
            <p className="text-xs font-medium text-nx-ink-3">{t("audit.export.appliedFilters")}</p>
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
          <div className="flex items-center gap-2 rounded-nx-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 rounded-nx-md bg-success/10 p-3 text-sm text-success">
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("audit.export.success")}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} loading={isExporting}>
            {!isExporting && <FileDown className="me-2 h-4 w-4" aria-hidden="true" />}
            {isExporting ? t("audit.export.generating") : t("audit.export.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
