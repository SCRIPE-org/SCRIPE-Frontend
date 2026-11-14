"use client";

import { useCallback, useEffect, useState } from "react";
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import type { DataExchangeDescriptorResponseDto } from "../../domain/types";

export interface UseDataExchangeToolbarOptions {
  entityKey: string;
  enableMultiSheetMigration?: boolean;
  multiSheetEntityKeys?: string[];
  onOverlayOpenChange?: (open: boolean) => void;
}

export interface UseDataExchangeToolbarReturn {
  effectiveDescriptor: DataExchangeDescriptorResponseDto | null;
  resolvedMultiSheetKeys: string[];
  showTemplate: boolean;
  showImport: boolean;
  showMultiSheet: boolean;
  showExport: boolean;
  isVisible: boolean;
  studioOpen: boolean;
  setStudioOpen: (open: boolean) => void;
  studioMultiSheet: boolean;
  exportOpen: boolean;
  setExportOpen: (open: boolean) => void;
  isDownloadingTemplate: boolean;
  openImportStudio: () => void;
  openMultiSheetStudio: () => void;
  openExportDialog: () => void;
  downloadTemplate: (format?: "xlsx" | "csv") => Promise<void>;
}

/**
 * Presentation ViewModel hook governing DataExchangeToolbarActions permissions,
 * descriptor hydration, template downloads, and Studio/Export overlay lifecycle.
 */
export function useDataExchangeToolbarViewModel({
  entityKey,
  enableMultiSheetMigration = true,
  multiSheetEntityKeys,
  onOverlayOpenChange,
}: UseDataExchangeToolbarOptions): UseDataExchangeToolbarReturn {
  const { language } = useI18n();
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

  const showImport = Boolean(
    effectiveDescriptor &&
      canManageJobs &&
      effectiveDescriptor.canImport &&
      effectiveDescriptor.isImportFeatureEnabled
  );
  const showExport = Boolean(
    effectiveDescriptor &&
      canManageJobs &&
      effectiveDescriptor.canExport &&
      effectiveDescriptor.isExportFeatureEnabled
  );

  const descriptorMultiSheetKeys =
    effectiveDescriptor?.relatedMultiSheetEntityKeys ??
    effectiveDescriptor?.descriptor?.relatedMultiSheetEntityKeys ??
    [];
  const resolvedMultiSheetKeys =
    multiSheetEntityKeys && multiSheetEntityKeys.length > 0
      ? multiSheetEntityKeys
      : descriptorMultiSheetKeys;

  const showMultiSheet = Boolean(
    showImport &&
      enableMultiSheetMigration !== false &&
      canExecuteMultiSheet &&
      resolvedMultiSheetKeys.length > 1
  );
  const showTemplate = Boolean(
    effectiveDescriptor && (effectiveDescriptor.canImport || effectiveDescriptor.canExport)
  );
  const isVisible = Boolean(effectiveDescriptor && (showImport || showExport || showTemplate));

  const openImportStudio = useCallback(() => {
    setStudioMultiSheet(false);
    setStudioOpen(true);
  }, []);

  const openMultiSheetStudio = useCallback(() => {
    setStudioMultiSheet(true);
    setStudioOpen(true);
  }, []);

  const openExportDialog = useCallback(() => {
    setExportOpen(true);
  }, []);

  const downloadTemplate = useCallback(
    async (format: "xlsx" | "csv" = "xlsx") => {
      setIsDownloadingTemplate(true);
      try {
        await getCoreContainer().dataExchangeRepository.downloadTemplateFile({
          entityKey,
          format,
          locale: language === "ar" ? "ar" : "en",
          multiSheet: false,
        });
      } catch {
        // Silently ignored if user lacks permission or aborted
      } finally {
        setIsDownloadingTemplate(false);
      }
    },
    [entityKey, language]
  );

  return {
    effectiveDescriptor,
    resolvedMultiSheetKeys,
    showTemplate,
    showImport,
    showMultiSheet,
    showExport,
    isVisible,
    studioOpen,
    setStudioOpen,
    studioMultiSheet,
    exportOpen,
    setExportOpen,
    isDownloadingTemplate,
    openImportStudio,
    openMultiSheetStudio,
    openExportDialog,
    downloadTemplate,
  };
}
