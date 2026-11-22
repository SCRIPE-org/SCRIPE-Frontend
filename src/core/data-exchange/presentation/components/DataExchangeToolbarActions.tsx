"use client";

import React from "react";
import { ArrowLeftRight, ChevronDown, Download, FileDown, Layers, Upload } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeToolbarViewModel } from "../viewmodels/useDataExchangeToolbarViewModel";
import { DataExchangeExportDialog } from "./DataExchangeExportDialog";
import { DataExchangeStudioOverlay } from "./DataExchangeStudioOverlay";

export interface DataExchangeToolbarActionsProps {
  entityKey: string;
  enableMultiSheetMigration?: boolean;
  multiSheetEntityKeys?: string[];
  initialPresetId?: string;
  activeSearch?: string;
  activeFilters?: Record<string, string>;
  onImportComplete?: () => void;
  onOverlayOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

/**
 * Pure presentation View rendering the drop-in Data Exchange toolbar dropdown
 * (Smart Template, Import Studio, Multi-Sheet Migration, Export).
 * All repository calls and permission gating are delegated to useDataExchangeToolbarViewModel.
 */
export function DataExchangeToolbarActions({
  entityKey,
  enableMultiSheetMigration = true,
  multiSheetEntityKeys,
  initialPresetId,
  activeSearch,
  activeFilters,
  onImportComplete,
  onOverlayOpenChange,
  defaultOpen = false,
}: DataExchangeToolbarActionsProps) {
  const { t } = useI18n();
  const vm = useDataExchangeToolbarViewModel({
    entityKey,
    enableMultiSheetMigration,
    multiSheetEntityKeys,
    onOverlayOpenChange,
  });

  if (!vm.isVisible || !vm.effectiveDescriptor) {
    return null;
  }

  return (
    <>
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            data-testid={`dx-trigger-${entityKey}`}
          >
            <ArrowLeftRight className="me-1.5 h-4 w-4 text-nx-ink-2" />
            <span>{t("dataExchange.toolbar.actionsMenu", { defaultValue: "Data Exchange" })}</span>
            <ChevronDown className="ms-1.5 h-3.5 w-3.5 text-nx-ink-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t("dataExchange.title", { defaultValue: "Data Exchange" })}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {vm.showTemplate && (
            <>
              <DropdownMenuItem
                onClick={() => void vm.downloadTemplate("xlsx")}
                disabled={vm.isDownloadingTemplate}
                data-testid={`dx-template-${entityKey}`}
              >
                <FileDown className="me-2 h-4 w-4 text-nx-ink-2" />
                <span>{t("dataExchange.actions.template")} (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => void vm.downloadTemplate("csv")}
                disabled={vm.isDownloadingTemplate}
                data-testid={`dx-template-csv-${entityKey}`}
              >
                <FileDown className="me-2 h-4 w-4 text-nx-ink-2" />
                <span>{t("dataExchange.actions.template")} (.csv)</span>
              </DropdownMenuItem>
              {(vm.showImport || vm.showExport) && <DropdownMenuSeparator />}
            </>
          )}

          {vm.showImport && (
            <DropdownMenuItem
              onClick={vm.openImportStudio}
              data-testid={`dx-import-${entityKey}`}
            >
              <Upload className="me-2 h-4 w-4 text-nx-accent" />
              <span>{t("dataExchange.actions.import")}</span>
            </DropdownMenuItem>
          )}

          {vm.showMultiSheet && (
            <DropdownMenuItem
              onClick={vm.openMultiSheetStudio}
              data-testid={`dx-multisheet-${entityKey}`}
            >
              <Layers className="me-2 h-4 w-4 text-nx-accent" />
              <span>{t("dataExchange.actions.multiSheetMigration")}</span>
            </DropdownMenuItem>
          )}

          {vm.showExport && (
            <>
              {vm.showImport && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={vm.openExportDialog}
                data-testid={`dx-export-${entityKey}`}
              >
                <Download className="me-2 h-4 w-4 text-nx-ink-2" />
                <span>{t("dataExchange.actions.export")}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DataExchangeStudioOverlay
        open={vm.studioOpen}
        onOpenChange={vm.setStudioOpen}
        entityKey={entityKey}
        initialMultiSheet={vm.studioMultiSheet}
        multiSheetEntityKeys={vm.resolvedMultiSheetKeys}
        initialPresetId={initialPresetId}
        onImportComplete={onImportComplete}
      />

      <DataExchangeExportDialog
        open={vm.exportOpen}
        onOpenChange={vm.setExportOpen}
        entityKey={entityKey}
        descriptor={vm.effectiveDescriptor}
        activeSearch={activeSearch}
        activeFilters={activeFilters}
      />
    </>
  );
}
