"use client";

import React, { useEffect, useState } from "react";
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
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import type { DataExchangeDescriptorResponseDto } from "../../domain/types";
import { DataExchangeExportDialog } from "./DataExchangeExportDialog";
import { DataExchangeStudioOverlay } from "./DataExchangeStudioOverlay";

export interface DataExchangeToolbarActionsProps {
  entityKey: string;
  enableMultiSheetMigration?: boolean;
  multiSheetEntityKeys?: string[];
  activeSearch?: string;
  activeFilters?: Record<string, string>;
  onImportComplete?: () => void;
  onOverlayOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

/**
 * Drop-in toolbar action cluster (Smart Template, Import Studio, Multi-Sheet Migration, Export)
 * automatically governed by tenant feature flags, module/entity permissions, and FLS descriptors.
 */
export function DataExchangeToolbarActions({
  entityKey,
  enableMultiSheetMigration = false,
  multiSheetEntityKeys,
  activeSearch,
  activeFilters,
  onImportComplete,
  onOverlayOpenChange,
  defaultOpen = false,
}: DataExchangeToolbarActionsProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const { hasPermission } = usePermissions();

  const canViewJobs = hasPermission("datatransfer.jobs.view");
  const canManageJobs = hasPermission("datatransfer.jobs.manage");
  const canExecuteMultiSheet =
    hasPermission("datatransfer.migrations.execute") ||
    hasPermission("datatransfer.migration.execute");

  const [descriptor, setDescriptor] = useState<DataExchangeDescriptorResponseDto | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioMultiSheet, setStudioMultiSheet] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  useEffect(() => {
    if (!entityKey || !canViewJobs) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    getCoreContainer()
      .dataExchangeRepository.getEntityDescriptor(entityKey, controller.signal)
      .then((res) => {
        if (!cancelled) setDescriptor(res);
      })
      .catch(() => {
        if (!cancelled) setDescriptor(null);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [entityKey, canViewJobs]);

  useEffect(() => {
    onOverlayOpenChange?.(studioOpen || exportOpen);
  }, [exportOpen, onOverlayOpenChange, studioOpen]);

  const effectiveDescriptor =
    canViewJobs &&
    entityKey &&
    descriptor &&
    (!descriptor.descriptor?.entityKey || descriptor.descriptor.entityKey === entityKey)
      ? descriptor
      : null;

  if (!effectiveDescriptor) {
    return null;
  }

  const showImport =
    canManageJobs && effectiveDescriptor.canImport && effectiveDescriptor.isImportFeatureEnabled;
  const showExport =
    canManageJobs && effectiveDescriptor.canExport && effectiveDescriptor.isExportFeatureEnabled;
  const showMultiSheet =
    showImport &&
    enableMultiSheetMigration &&
    canExecuteMultiSheet &&
    Boolean(multiSheetEntityKeys && multiSheetEntityKeys.length > 1);
  const showTemplate = effectiveDescriptor.canImport || effectiveDescriptor.canExport;

  if (!showImport && !showExport && !showTemplate) {
    return null;
  }

  const handleDownloadTemplate = async (format: "xlsx" | "csv" = "xlsx") => {
    setIsDownloadingTemplate(true);
    try {
      await getCoreContainer().dataExchangeRepository.downloadTemplateFile({
        entityKey,
        format,
        locale: isAr ? "ar" : "en",
        multiSheet: false,
      });
    } catch {
      // Silently ignored if user lacks permission or aborted
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

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

          {showTemplate && (
            <>
              <DropdownMenuItem
                onClick={() => handleDownloadTemplate("xlsx")}
                disabled={isDownloadingTemplate}
                data-testid={`dx-template-${entityKey}`}
              >
                <FileDown className="me-2 h-4 w-4 text-nx-ink-2" />
                <span>{t("dataExchange.actions.template")} (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDownloadTemplate("csv")}
                disabled={isDownloadingTemplate}
                data-testid={`dx-template-csv-${entityKey}`}
              >
                <FileDown className="me-2 h-4 w-4 text-nx-ink-2" />
                <span>{t("dataExchange.actions.template")} (.csv)</span>
              </DropdownMenuItem>
              {(showImport || showExport) && <DropdownMenuSeparator />}
            </>
          )}

          {showImport && (
            <DropdownMenuItem
              onClick={() => {
                setStudioMultiSheet(false);
                setStudioOpen(true);
              }}
              data-testid={`dx-import-${entityKey}`}
            >
              <Upload className="me-2 h-4 w-4 text-nx-accent" />
              <span>{t("dataExchange.actions.import")}</span>
            </DropdownMenuItem>
          )}

          {showMultiSheet && (
            <DropdownMenuItem
              onClick={() => {
                setStudioMultiSheet(true);
                setStudioOpen(true);
              }}
              data-testid={`dx-multisheet-${entityKey}`}
            >
              <Layers className="me-2 h-4 w-4 text-nx-accent" />
              <span>{t("dataExchange.actions.multiSheetMigration")}</span>
            </DropdownMenuItem>
          )}

          {showExport && (
            <>
              {showImport && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => setExportOpen(true)}
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
        open={studioOpen}
        onOpenChange={setStudioOpen}
        entityKey={entityKey}
        initialMultiSheet={studioMultiSheet}
        multiSheetEntityKeys={multiSheetEntityKeys}
        onImportComplete={onImportComplete}
      />

      <DataExchangeExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        entityKey={entityKey}
        descriptor={effectiveDescriptor}
        activeSearch={activeSearch}
        activeFilters={activeFilters}
      />
    </>
  );
}
