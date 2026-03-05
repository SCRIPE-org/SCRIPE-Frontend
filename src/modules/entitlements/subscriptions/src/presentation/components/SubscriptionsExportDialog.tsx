/**
 * SubscriptionsExportDialog
 *
 * Professional export modal with comprehensive filters:
 *  - Format selection (CSV / Excel / PDF)
 *  - Currency selector
 *  - Date range (presets + custom)
 *  - Expiring soon (in N days)
 *  - Edition filter
 *
 * SOLID: Pure UI — delegates all logic to useExportSubscriptions hook.
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useExportSubscriptions, type ExportFormat } from "../viewmodels/useExportSubscriptions";
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
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import GenericSelect from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import {
      FileSpreadsheet,
      FileText,
      FileDown,
      Loader2,
      CheckCircle,
      AlertCircle,
      Calendar,
      Clock,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────

interface SubscriptionsExportDialogProps {
      open: boolean;
      onClose: () => void;
      statusFilter: string;
      typeFilter: string;
      totalCount: number;
}

interface FormatOption {
      value: ExportFormat;
      icon: React.ReactNode;
      label: string;
      description: string;
      color: string;
      borderActive: string;
}

type DatePreset = "all" | "last7" | "last30" | "last90" | "lastYear" | "custom";

// ── Constants ────────────────────────────────────────────

const FORMAT_OPTIONS: FormatOption[] = [
      {
            value: "csv",
            icon: <FileText className="h-8 w-8" />,
            label: "CSV",
            description: "Comma-separated values",
            color: "text-emerald-500",
            borderActive: "border-emerald-500 bg-emerald-500/10",
      },
      {
            value: "excel",
            icon: <FileSpreadsheet className="h-8 w-8" />,
            label: "XLSX",
            description: "Microsoft Excel",
            color: "text-blue-500",
            borderActive: "border-blue-500 bg-blue-500/10",
      },
      {
            value: "pdf",
            icon: <FileDown className="h-8 w-8" />,
            label: "PDF",
            description: "Print-ready document",
            color: "text-red-500",
            borderActive: "border-red-500 bg-red-500/10",
      },
];

const CURRENCY_OPTIONS: GenericSelectOption[] = [
      { value: "_native", label: "🌐  Original currency (as stored)" },
      { value: "USD", label: "🇺🇸  USD — US Dollar" },
      { value: "EUR", label: "🇪🇺  EUR — Euro" },
      { value: "GBP", label: "🇬🇧  GBP — British Pound" },
      { value: "SAR", label: "🇸🇦  SAR — Saudi Riyal" },
      { value: "AED", label: "🇦🇪  AED — UAE Dirham" },
      { value: "EGP", label: "🇪🇬  EGP — Egyptian Pound" },
      { value: "TRY", label: "🇹🇷  TRY — Turkish Lira" },
      { value: "INR", label: "🇮🇳  INR — Indian Rupee" },
];

const DATE_PRESET_OPTIONS: GenericSelectOption[] = [
      { value: "all", label: "📅  All time" },
      { value: "last7", label: "📅  Last 7 days" },
      { value: "last30", label: "📅  Last 30 days" },
      { value: "last90", label: "📅  Last 90 days (Quarter)" },
      { value: "lastYear", label: "📅  Last 12 months" },
      { value: "custom", label: "📅  Custom range..." },
];

const EXPIRING_OPTIONS: GenericSelectOption[] = [
      { value: "0", label: "⏰  No filter" },
      { value: "5", label: "🔴  Expiring in 5 days" },
      { value: "7", label: "🔴  Expiring in 7 days" },
      { value: "14", label: "🟡  Expiring in 14 days" },
      { value: "30", label: "🟡  Expiring in 30 days" },
      { value: "60", label: "🟢  Expiring in 60 days" },
      { value: "90", label: "🟢  Expiring in 90 days" },
];

// ── Helpers ──────────────────────────────────────────────

function getDateRange(preset: DatePreset): { from?: string; to?: string } {
      if (preset === "all" || preset === "custom") return {};
      const now = new Date();
      const to = now.toISOString().split("T")[0];
      const from = new Date(now);
      switch (preset) {
            case "last7":
                  from.setDate(from.getDate() - 7);
                  break;
            case "last30":
                  from.setDate(from.getDate() - 30);
                  break;
            case "last90":
                  from.setDate(from.getDate() - 90);
                  break;
            case "lastYear":
                  from.setFullYear(from.getFullYear() - 1);
                  break;
      }
      return { from: from.toISOString().split("T")[0], to };
}

// ── Component ────────────────────────────────────────────

export function SubscriptionsExportDialog({
      open,
      onClose,
      statusFilter,
      typeFilter,
      totalCount,
}: SubscriptionsExportDialogProps) {
      const { t } = useI18n();
      const { exportSubscriptions, isExporting, error } = useExportSubscriptions();
      const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("excel");
      const [selectedCurrency, setSelectedCurrency] = useState("_native");
      const [datePreset, setDatePreset] = useState<DatePreset>("all");
      const [customDateFrom, setCustomDateFrom] = useState("");
      const [customDateTo, setCustomDateTo] = useState("");
      const [expiringInDays, setExpiringInDays] = useState("0");
      const [success, setSuccess] = useState(false);

      const handleExport = async () => {
            setSuccess(false);
            try {
                  // Compute date range
                  let dateFrom: string | undefined;
                  let dateTo: string | undefined;
                  if (datePreset === "custom") {
                        dateFrom = customDateFrom || undefined;
                        dateTo = customDateTo || undefined;
                  } else {
                        const range = getDateRange(datePreset);
                        dateFrom = range.from;
                        dateTo = range.to;
                  }

                  await exportSubscriptions({
                        format: selectedFormat,
                        statusFilter,
                        typeFilter,
                        displayCurrency: selectedCurrency === "_native" ? undefined : selectedCurrency,
                        dateFrom,
                        dateTo,
                        expiringInDays: parseInt(expiringInDays) || undefined,
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

      // Active filter summary
      const activeFilters: string[] = [];
      if (statusFilter !== "all") activeFilters.push(`Status: ${statusFilter}`);
      if (typeFilter !== "all") activeFilters.push(`Type: ${typeFilter}`);
      if (datePreset !== "all") {
            if (datePreset === "custom") {
                  if (customDateFrom || customDateTo)
                        activeFilters.push(`Date: ${customDateFrom || "..."} → ${customDateTo || "..."}`);
            } else {
                  const label = DATE_PRESET_OPTIONS.find((o) => o.value === datePreset)?.label || datePreset;
                  activeFilters.push(label.replace("📅  ", ""));
            }
      }
      if (parseInt(expiringInDays) > 0)
            activeFilters.push(`Expiring ≤ ${expiringInDays}d`);

      return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                  <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                    <FileDown className="h-5 w-5" />
                                    {t("entitlements.subscriptions.export.title") || "Export Subscriptions"}
                              </DialogTitle>
                              <DialogDescription>
                                    {t("entitlements.subscriptions.export.description") ||
                                          "Generate comprehensive subscription analytics reports."}
                              </DialogDescription>
                        </DialogHeader>

                        {/* Record Count */}
                        <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                              <span className="text-muted-foreground">
                                    {t("entitlements.subscriptions.export.records") || "Records to export"}
                              </span>
                              <Badge variant="secondary" className="font-mono">
                                    {totalCount}
                              </Badge>
                        </div>

                        {/* Format Cards */}
                        <div className="grid grid-cols-3 gap-3">
                              {FORMAT_OPTIONS.map((opt) => (
                                    <button
                                          key={opt.value}
                                          onClick={() => setSelectedFormat(opt.value)}
                                          disabled={isExporting}
                                          className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:shadow-md ${selectedFormat === opt.value
                                                ? opt.borderActive
                                                : "border-border hover:border-muted-foreground/30"
                                                } ${isExporting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                    >
                                          <span className={opt.color}>{opt.icon}</span>
                                          <span className="text-sm font-semibold">{opt.label}</span>
                                          <span className="text-center text-[10px] leading-tight text-muted-foreground">
                                                {opt.description}
                                          </span>
                                    </button>
                              ))}
                        </div>

                        {/* Filters Grid — 2 columns */}
                        <div className="grid grid-cols-2 gap-3">
                              {/* Date Range */}
                              <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                          <Calendar className="h-3 w-3" />
                                          Date Range
                                    </Label>
                                    <GenericSelect
                                          options={DATE_PRESET_OPTIONS}
                                          value={datePreset}
                                          onValueChange={(v: string | string[]) => setDatePreset(v as DatePreset)}
                                          placeholder="Select range"
                                          searchable
                                          searchType="client"
                                          searchPlaceholder="Search..."
                                    />
                              </div>

                              {/* Expiring Soon */}
                              <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          Expiring Soon
                                    </Label>
                                    <GenericSelect
                                          options={EXPIRING_OPTIONS}
                                          value={expiringInDays}
                                          onValueChange={(v: string | string[]) => setExpiringInDays(v as string)}
                                          placeholder="No filter"
                                          searchable
                                          searchType="client"
                                          searchPlaceholder="Search..."
                                    />
                              </div>
                        </div>

                        {/* Custom Date Range (only when "custom" is selected) */}
                        {datePreset === "custom" && (
                              <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                          <Label className="text-[10px] text-muted-foreground">From</Label>
                                          <Input
                                                type="date"
                                                value={customDateFrom}
                                                onChange={(e) => setCustomDateFrom(e.target.value)}
                                                className="h-9 text-sm"
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <Label className="text-[10px] text-muted-foreground">To</Label>
                                          <Input
                                                type="date"
                                                value={customDateTo}
                                                onChange={(e) => setCustomDateTo(e.target.value)}
                                                className="h-9 text-sm"
                                          />
                                    </div>
                              </div>
                        )}

                        {/* Currency Selector */}
                        <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                    {t("entitlements.subscriptions.export.currency") || "Display Currency"}
                              </Label>
                              <GenericSelect
                                    options={CURRENCY_OPTIONS}
                                    value={selectedCurrency}
                                    onValueChange={(v: string | string[]) => setSelectedCurrency(v as string)}
                                    placeholder={t("entitlements.subscriptions.export.currencyPlaceholder") || "Select currency"}
                                    searchable
                                    searchType="client"
                                    searchPlaceholder={t("common.search") || "Search..."}
                              />
                              <p className="text-[10px] text-muted-foreground/60 italic">
                                    {t("entitlements.subscriptions.export.currencyHint") || "Amounts will be shown in the selected currency where applicable"}
                              </p>
                        </div>

                        {/* Active Filters Summary */}
                        {activeFilters.length > 0 && (
                              <div className="space-y-1.5 rounded-md bg-muted/50 p-3">
                                    <p className="text-xs font-medium text-muted-foreground">
                                          {t("audit.export.appliedFilters") || "Applied Filters"}
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
                                    {t("entitlements.subscriptions.export.success") || "Export downloaded successfully!"}
                              </div>
                        )}

                        <DialogFooter>
                              <Button variant="outline" onClick={onClose} disabled={isExporting}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button onClick={handleExport} disabled={isExporting}>
                                    {isExporting ? (
                                          <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t("entitlements.subscriptions.export.generating") || "Generating..."}
                                          </>
                                    ) : (
                                          <>
                                                <FileDown className="mr-2 h-4 w-4" />
                                                {t("entitlements.subscriptions.export.download") || "Download"}
                                          </>
                                    )}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
