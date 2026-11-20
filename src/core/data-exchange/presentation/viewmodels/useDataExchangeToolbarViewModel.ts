"use client";

import { useCallback, useEffect, useState } from "react";
import { getCoreContainer } from "@core/di";
import { DATA_TRANSFER_PERMISSIONS } from "@core/common/types/permissions";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { toast } from "@core/ui/sileo-toast";
import type { DataExchangeDescriptorResponseDto } from "../../domain/types";
import {
  getStudioErrorMessage,
  isAbortOrInterceptedError,
} from "./studio/studio-viewmodel.helpers";

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
  const { language, t } = useI18n();
  const { hasPermission } = usePermissions();
  const { activeTenantId } = useAdminContext();

  const canViewJobs = hasPermission(DATA_TRANSFER_PERMISSIONS.DATATRANSFER_JOBS_VIEW);
  const canManageJobs = hasPermission(DATA_TRANSFER_PERMISSIONS.DATATRANSFER_JOBS_MANAGE);
  const canExecuteMultiSheet =
    hasPermission(DATA_TRANSFER_PERMISSIONS.DATATRANSFER_MIGRATIONS_EXECUTE) ||
    hasPermission("datatransfer.migration.execute");

  const [descriptorEntry, setDescriptorEntry] = useState<{
    tenantId: string | null;
    entityKey: string;
    data: DataExchangeDescriptorResponseDto;
  } | null>(null);
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
    const repo = getCoreContainer().dataExchangeRepository;
    const requestedEntityKey = entityKey;
    const requestedTenantId = activeTenantId;

    async function loadDescriptor() {
      try {
        // Consult cached tenant entity catalog first to eliminate catalog-unbacked 404s
        const entities = await repo.listEntities(controller.signal);
        if (cancelled) return;

        const exists = (entities ?? []).some(
          (e) => e.entityKey.toLowerCase() === requestedEntityKey.toLowerCase()
        );
        if (!exists) {
          setDescriptorEntry(null);
          return;
        }

        const res = await repo.getEntityDescriptor(requestedEntityKey, controller.signal);
        if (!cancelled) {
          setDescriptorEntry({
            tenantId: requestedTenantId,
            entityKey: requestedEntityKey.toLowerCase(),
            data: res,
          });
        }
      } catch {
        // Handles 422 tenant-required, 403 forbidden, or network failures gracefully
        if (!cancelled) setDescriptorEntry(null);
      }
    }

    void loadDescriptor();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [entityKey, canViewJobs, activeTenantId]);

  useEffect(() => {
    onOverlayOpenChange?.(studioOpen || exportOpen);
  }, [exportOpen, onOverlayOpenChange, studioOpen]);

  const effectiveDescriptor =
    canViewJobs &&
    entityKey &&
    descriptorEntry &&
    descriptorEntry.tenantId === activeTenantId &&
    descriptorEntry.entityKey === entityKey.toLowerCase() &&
    (!descriptorEntry.data.descriptor?.entityKey ||
      descriptorEntry.data.descriptor.entityKey.toLowerCase() === entityKey.toLowerCase())
      ? descriptorEntry.data
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
      } catch (err) {
        if (!isAbortOrInterceptedError(err)) {
          toast.error({
            id: `dx-template-err-${entityKey}`,
            title: t("dataExchange.errors.templateDownloadFailed"),
            description: getStudioErrorMessage(
              err,
              t("dataExchange.errors.templateDownloadFailed")
            ),
          });
        }
      } finally {
        setIsDownloadingTemplate(false);
      }
    },
    [entityKey, language, t]
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
