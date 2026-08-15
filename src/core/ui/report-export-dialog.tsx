"use client";

/**
 * ReportExportDialog — Reusable export dialog for dashboard pages.
 *
 * Combines interval selection (daily/weekly/monthly/yearly/custom)
 * with format selection (CSV, Excel, PDF) and download trigger.
 *
 * Used by: DashboardView, TenantAnalyticsView, SecurityDashboardView.
 *
 * The format chooser used to be three big icon cards in a symmetric grid,
 * each painted a different hue — green CSV, blue Excel, red PDF — with a 2px
 * border, a hover drop-shadow and a 10px caption centred under an 8px icon.
 * None of that colour carried meaning (red is the status the product uses for
 * "this failed", not for "this is a PDF"), the captions are sentences that
 * read badly centred in a third of a modal, and a hover shadow on something
 * welded to the panel claims a depth it does not have.
 *
 * It is now a list of three rows: one accent for the chosen one, aligned
 * labels and descriptions, and real radiogroup semantics with arrow-key
 * navigation.
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";
import {
  FileSpreadsheet,
  FileText,
  FileDown,
  Check,
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
  icon: typeof FileText;
  /** The file type as it is written on disk — an acronym, never translated. */
  label: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: "csv", icon: FileText, label: "CSV" },
  { value: "excel", icon: FileSpreadsheet, label: "XLSX" },
  { value: "pdf", icon: FileDown, label: "PDF" },
];

/** How long the success confirmation stays up before the dialog closes itself. */
const SUCCESS_DISMISS_MS = 1500;

export function ReportExportDialog({
  open,
  onClose,
  endpoint,
  titleKey,
  descriptionKey,
}: ReportExportDialogProps) {
  const { t, direction } = useI18n();
  const { exportReport, isExporting, error } = useExportReport();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("excel");
  const [success, setSuccess] = useState(false);
  const [intervalDates, setIntervalDates] = useState<IntervalDates>({ dateFrom: "", dateTo: "" });

  // The auto-dismiss timer used to be fired and forgotten: unmounting the
  // dialog inside that 1.5s window left a timeout that woke up and set state
  // on a dead component.
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    },
    []
  );

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
      dismissTimer.current = setTimeout(() => {
        setSuccess(false);
        onClose();
      }, SUCCESS_DISMISS_MS);
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

  // Radiogroup keyboard contract: arrows move the selection (and focus with
  // it), Home/End jump to the ends. The horizontal pair follows the reading
  // direction, so ArrowRight advances in LTR and retreats in RTL.
  const moveSelection = useCallback(
    (delta: number) => {
      const current = FORMAT_OPTIONS.findIndex((o) => o.value === selectedFormat);
      const next = (current + delta + FORMAT_OPTIONS.length) % FORMAT_OPTIONS.length;
      setSelectedFormat(FORMAT_OPTIONS[next].value);
      optionRefs.current[next]?.focus();
    },
    [selectedFormat]
  );

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isExporting) return;
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";

    if (event.key === "ArrowDown" || event.key === forward) {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === "ArrowUp" || event.key === backward) {
      event.preventDefault();
      moveSelection(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setSelectedFormat(FORMAT_OPTIONS[0].value);
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const last = FORMAT_OPTIONS.length - 1;
      setSelectedFormat(FORMAT_OPTIONS[last].value);
      optionRefs.current[last]?.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" aria-busy={isExporting || undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 shrink-0 text-nx-ink-3" aria-hidden="true" />
            {t(titleKey)}
          </DialogTitle>
          <DialogDescription>{t(descriptionKey)}</DialogDescription>
        </DialogHeader>

        {/* Time Period / Interval Selector */}
        <div className="flex flex-col gap-2">
          {/* A field label, one ink step below the values it introduces —
              matching the section-label treatment used across the menus. */}
          <p className="text-xs font-medium text-nx-ink-3">{t("export.interval.label")}</p>
          <ExportIntervalSelect value={intervalDates} onChange={setIntervalDates} />
        </div>

        {/* Format chooser */}
        <div role="radiogroup" onKeyDown={handleOptionKeyDown} className="flex flex-col gap-1.5">
          {FORMAT_OPTIONS.map((opt, index) => {
            const Icon = opt.icon;
            const isActive = selectedFormat === opt.value;

            return (
              <button
                key={opt.value}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="radio"
                aria-checked={isActive}
                // Roving tabindex: one stop for the whole group, then arrows.
                tabIndex={isActive ? 0 : -1}
                onClick={() => setSelectedFormat(opt.value)}
                disabled={isExporting}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-nx-control border px-3 py-2.5 text-start",
                  "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "focus-visible:shadow-nx-focus focus-visible:outline-none",
                  // Light collects on the chosen row: an accent hairline plus
                  // the accent wash. No shadow — this is welded to the panel.
                  isActive
                    ? "border-nx-accent bg-nx-accent-wash"
                    : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-hover",
                  // Disabled is dedicated ink, not opacity math over a wash.
                  isExporting ? "cursor-not-allowed text-nx-ink-3" : "cursor-pointer text-nx-ink"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive && !isExporting ? "text-nx-accent" : "text-nx-ink-3"
                  )}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium leading-5">{opt.label}</span>
                  <span
                    className={cn(
                      "truncate text-xs leading-4",
                      isExporting ? "text-nx-ink-3" : "text-nx-ink-2"
                    )}
                  >
                    {t(`export.formats.${opt.value}`)}
                  </span>
                </span>
                {isActive && (
                  <Check
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isExporting ? "text-nx-ink-3" : "text-nx-accent"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Error — announced, and structured like every other inline status in
            the system: a hairline in the status hue over its own wash. */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-nx-control border border-destructive/30 bg-destructive/10 p-3 text-sm leading-5 text-nx-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-nx-control border border-success/30 bg-success/10 p-3 text-sm leading-5 text-nx-success"
          >
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">{t("export.success")}</span>
          </div>
        )}

        {/* Cancel first in the DOM, primary last — the family's one action
            order, so the download button lands on the inline-end edge. */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                {/* The one animation allowed to loop: it turns only while a
                    request is genuinely in flight. */}
                <LoadingSpinner size="inline" className="me-2" />
                {t("export.generating")}
              </>
            ) : (
              <>
                <FileDown className="me-2 h-4 w-4" aria-hidden="true" />
                {t("export.download")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
