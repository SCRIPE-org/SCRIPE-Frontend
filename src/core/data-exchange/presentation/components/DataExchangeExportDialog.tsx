"use client";

import React, { useEffect, useState } from "react";
import { Download, FileSpreadsheet, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import { ScrollArea } from "@core/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Badge } from "@core/ui/badge";
import { toast } from "@core/ui/sileo-toast";
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import type {
  DataExchangeDescriptorResponseDto,
  DataExchangeFileFormat,
} from "../../domain/types";

export interface DataExchangeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityKey: string;
  descriptor?: DataExchangeDescriptorResponseDto | null;
  activeSearch?: string;
  activeFilters?: Record<string, string>;
}

/**
 * Formula-safe export configuration dialog supporting column selection,
 * format choice (.xlsx, .csv, .tsv), FLS restriction pruning, and active filter carryover.
 */
export function DataExchangeExportDialog({
  open,
  onOpenChange,
  entityKey,
  descriptor: initialDescriptor,
  activeSearch,
  activeFilters,
}: DataExchangeExportDialogProps) {
  const { direction, language, t } = useI18n();
  const isAr = language === "ar";
  const repo = getCoreContainer().dataExchangeRepository;

  const [descriptor, setDescriptor] = useState<DataExchangeDescriptorResponseDto | null>(
    initialDescriptor ?? null
  );
  const [format, setFormat] = useState<DataExchangeFileFormat>("xlsx");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isEnqueuingBackground, setIsEnqueuingBackground] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialDescriptor) {
      setDescriptor(initialDescriptor);
    }
  }, [initialDescriptor]);

  useEffect(() => {
    if (!open || !entityKey || initialDescriptor) return;
    const controller = new AbortController();
    repo
      .getEntityDescriptor(entityKey, controller.signal)
      .then((res) => setDescriptor(res))
      .catch(() => {
        // Error surfaced on export if needed
      });
    return () => controller.abort();
  }, [open, entityKey, initialDescriptor, repo]);

  const restrictedSet = new Set(descriptor?.restrictedFieldKeys ?? []);
  const exportableColumns = (descriptor?.descriptor.columns ?? []).filter(
    (col) => col.direction !== "ImportOnly" && !restrictedSet.has(col.key)
  );
  const descriptorEntityKey = descriptor?.descriptor.entityKey ?? "";

  useEffect(() => {
    if (!open || exportableColumns.length === 0) return;
    setSelectedColumns(exportableColumns.map((c) => c.key));
    setErrorMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, descriptorEntityKey]);

  const toggleColumn = (key: string, checked: boolean) => {
    setSelectedColumns((prev) =>
      checked ? (prev.includes(key) ? prev : [...prev, key]) : prev.filter((k) => k !== key)
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(exportableColumns.map((c) => c.key));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      await repo.exportToFile({
        entityKey,
        format,
        locale: isAr ? "ar" : "en",
        search: activeSearch || null,
        selectedColumns: selectedColumns.length > 0 ? selectedColumns : null,
        filters: activeFilters ?? null,
      });
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : t("dataExchange.errors.exportFailed")
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportInBackground = async () => {
    if (selectedColumns.length === 0) return;
    setIsEnqueuingBackground(true);
    setErrorMessage(null);
    try {
      const job = await repo.enqueueExport({
        entityKey,
        format,
        locale: isAr ? "ar" : "en",
        search: activeSearch || null,
        selectedColumns: selectedColumns.length > 0 ? selectedColumns : null,
        filters: activeFilters ?? null,
      });
      useDataExchangeJobsStore.getState().trackJob(job);
      toast.info(t("dataExchange.exportDialog.exportQueuedToast"));
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : t("dataExchange.errors.exportFailed")
      );
    } finally {
      setIsEnqueuingBackground(false);
    }
  };

  const entityTitle = descriptor
    ? isAr
      ? descriptor.descriptor.displayNameAr
      : descriptor.descriptor.displayNameEn
    : entityKey;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={direction}
        className="max-w-2xl bg-nx-surface border-nx-line text-nx-ink"
      >
        <DialogHeader className="pe-12">
          <DialogTitle className="flex items-center gap-2 text-nx-ink">
            <FileSpreadsheet className="h-5 w-5 text-nx-accent" />
            <span>{t("dataExchange.exportDialog.title")}</span>
            <Badge variant="secondary">{entityTitle}</Badge>
          </DialogTitle>
          <DialogDescription className="text-nx-ink-2">
            {t("dataExchange.exportDialog.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errorMessage && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {activeSearch && (
            <Alert variant="info">
              <AlertDescription>
                {t("dataExchange.exportDialog.activeSearchNote", { search: activeSearch })}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="dx-export-format" className="text-nx-ink-2">
              {t("dataExchange.exportDialog.formatLabel")}
            </Label>
            <Select
              value={format}
              onValueChange={(val) => setFormat(val as DataExchangeFileFormat)}
            >
              <SelectTrigger id="dx-export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">
                  {t("dataExchange.exportDialog.formatXlsx")}
                </SelectItem>
                <SelectItem value="csv">
                  {t("dataExchange.exportDialog.formatCsv")}
                </SelectItem>
                <SelectItem value="tsv">
                  {t("dataExchange.exportDialog.formatTsv")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-nx-ink-2">
                {t("dataExchange.exportDialog.columnsLabel", {
                  count: selectedColumns.length,
                })}
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllColumns}
                >
                  {t("dataExchange.exportDialog.selectAll")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedColumns([])}
                >
                  {t("dataExchange.exportDialog.clearSelection")}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-56 rounded-nx-md border border-nx-line bg-nx-ground p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {exportableColumns.map((col) => {
                  const checked = selectedColumns.includes(col.key);
                  const colLabel = isAr ? col.displayNameAr : col.displayNameEn;
                  return (
                    <div
                      key={col.key}
                      className="flex items-center gap-2.5 rounded-nx-sm border border-nx-line bg-nx-surface px-3 py-2 hover:border-nx-line-hi"
                    >
                      <Checkbox
                        id={`export-col-${col.key}`}
                        checked={checked}
                        onCheckedChange={(val) => toggleColumn(col.key, val === true)}
                      />
                      <Label
                        htmlFor={`export-col-${col.key}`}
                        className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-xs text-nx-ink"
                      >
                        <span className="truncate">{colLabel}</span>
                        <div className="flex items-center gap-1.5">
                          {(col.key.startsWith("cf:") || col.dataType === "CustomField") && (
                            <Badge variant="secondary" className="text-[10px]">
                              {t("dataExchange.customFieldBadge")}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            dir="ltr"
                            className="font-mono text-[10px]"
                          >
                            {col.dataType}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <p className="text-xs text-nx-ink-3">
              {t("dataExchange.exportDialog.restrictedNote")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting || isEnqueuingBackground}
          >
            {t("dataExchange.actions.cancel")}
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              loading={isEnqueuingBackground}
              disabled={selectedColumns.length === 0 || isExporting || isEnqueuingBackground}
              onClick={handleExportInBackground}
            >
              {t("dataExchange.exportDialog.exportInBackground")}
            </Button>
            <Button
              type="button"
              variant="default"
              loading={isExporting}
              disabled={selectedColumns.length === 0 || isExporting || isEnqueuingBackground}
              onClick={handleExport}
            >
              <Download className="me-2 h-4 w-4" />
              {t("dataExchange.actions.downloadExport")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
