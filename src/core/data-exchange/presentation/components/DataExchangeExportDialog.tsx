"use client";

import React from "react";
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
import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeExportViewModel } from "../viewmodels/useDataExchangeExportViewModel";
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
  descriptor,
  activeSearch,
  activeFilters,
}: DataExchangeExportDialogProps) {
  const { t } = useI18n();
  const vm = useDataExchangeExportViewModel({
    open,
    onOpenChange,
    entityKey,
    descriptor,
    activeSearch,
    activeFilters,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={vm.direction}
        className="max-w-2xl bg-nx-surface border-nx-line text-nx-ink"
      >
        <DialogHeader className="pe-12">
          <DialogTitle className="flex items-center gap-2 text-nx-ink">
            <FileSpreadsheet className="h-5 w-5 text-nx-accent" />
            <span>{t("dataExchange.exportDialog.title")}</span>
            <Badge variant="secondary">{vm.entityTitle}</Badge>
          </DialogTitle>
          <DialogDescription className="text-nx-ink-2">
            {t("dataExchange.exportDialog.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {vm.errorMessage && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{vm.errorMessage}</AlertDescription>
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
              value={vm.format}
              onValueChange={(val) => vm.setFormat(val as DataExchangeFileFormat)}
            >
              <SelectTrigger id="dx-export-format" className="h-8 text-xs border-nx-line">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">{t("dataExchange.exportDialog.formatXlsx")}</SelectItem>
                <SelectItem value="csv">{t("dataExchange.exportDialog.formatCsv")}</SelectItem>
                <SelectItem value="tsv">{t("dataExchange.exportDialog.formatTsv")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-nx-ink-2">
                {t("dataExchange.exportDialog.columnsLabel", { count: vm.selectedColumns.length })}
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={
                    vm.isLoadingDescriptor ||
                    vm.exportableColumns.length === 0 ||
                    vm.selectedColumns.length === vm.exportableColumns.length
                  }
                  onClick={vm.selectAllColumns}
                  className="h-7 text-xs text-nx-ink-2 hover:text-nx-ink"
                >
                  {t("dataExchange.exportDialog.selectAll")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={vm.isLoadingDescriptor || vm.selectedColumns.length === 0}
                  onClick={vm.clearSelection}
                  className="h-7 text-xs text-nx-ink-2 hover:text-nx-ink"
                >
                  {t("dataExchange.exportDialog.clearSelection")}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-56 rounded-nx-md border border-nx-line bg-nx-ground p-3">
              {vm.isLoadingDescriptor ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-busy="true">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-9 w-full rounded-nx-sm" />
                  ))}
                </div>
              ) : vm.exportableColumns.length === 0 ? (
                <div className="flex h-44 items-center justify-center text-center text-xs text-nx-ink-3 px-4">
                  {t("dataExchange.exportDialog.noExportableColumns")}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vm.exportableColumns.map((col) => {
                    const checked = vm.selectedColumns.includes(col.key);
                    const colLabel = vm.isAr ? col.displayNameAr : col.displayNameEn;
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-between gap-2.5 rounded-nx-sm border border-nx-line bg-nx-surface px-3 py-2 hover:border-nx-line-hi"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <Checkbox
                            id={`export-col-${col.key}`}
                            checked={checked}
                            onCheckedChange={(val) => vm.toggleColumn(col.key, val === true)}
                          />
                          <Label
                            htmlFor={`export-col-${col.key}`}
                            className="min-w-0 flex-1 cursor-pointer truncate text-xs text-nx-ink"
                          >
                            {colLabel}
                          </Label>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {(col.key.startsWith("cf:") || col.dataType === "CustomField") && (
                            <Badge variant="secondary" className="text-[10px]">
                              {t("dataExchange.customFieldBadge")}
                            </Badge>
                          )}
                          <Badge variant="outline" dir="ltr" className="font-mono text-[10px]">
                            {col.dataType}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-nx-ink-3">{t("dataExchange.exportDialog.restrictedNote")}</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={vm.isExporting || vm.isEnqueuingBackground}
            className="border-nx-line text-xs h-8"
          >
            {t("dataExchange.actions.cancel")}
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              loading={vm.isEnqueuingBackground}
              disabled={
                vm.selectedColumns.length === 0 || vm.isExporting || vm.isEnqueuingBackground
              }
              onClick={vm.handleExportInBackground}
              className="border-nx-line text-xs h-8"
            >
              {t("dataExchange.exportDialog.exportInBackground")}
            </Button>
            <Button
              type="button"
              variant="default"
              loading={vm.isExporting}
              disabled={
                vm.selectedColumns.length === 0 || vm.isExporting || vm.isEnqueuingBackground
              }
              onClick={vm.handleExport}
              className="font-medium text-xs h-8"
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
