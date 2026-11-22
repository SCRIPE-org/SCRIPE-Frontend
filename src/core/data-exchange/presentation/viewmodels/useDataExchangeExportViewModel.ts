"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCoreContainer } from "@core/di";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import { getEntityDisplayName } from "../utils/entity-display-names";
import {
  getStudioErrorMessage,
  isAbortOrInterceptedError,
} from "./studio/studio-viewmodel.helpers";
import type {
  DataExchangeColumnDescriptor,
  DataExchangeDescriptorResponseDto,
  DataExchangeFileFormat,
} from "../../domain/types";

export interface UseDataExchangeExportOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityKey: string;
  descriptor?: DataExchangeDescriptorResponseDto | null;
  activeSearch?: string;
  activeFilters?: Record<string, string>;
}

export interface UseDataExchangeExportReturn {
  direction: "ltr" | "rtl";
  isAr: boolean;
  entityTitle: string;
  exportableColumns: DataExchangeColumnDescriptor[];
  isLoadingDescriptor: boolean;
  format: DataExchangeFileFormat;
  setFormat: (format: DataExchangeFileFormat) => void;
  selectedColumns: string[];
  isExporting: boolean;
  isEnqueuingBackground: boolean;
  errorMessage: string | null;
  toggleColumn: (key: string, checked: boolean) => void;
  selectAllColumns: () => void;
  clearSelection: () => void;
  handleExport: () => Promise<void>;
  handleExportInBackground: () => Promise<void>;
}

function getExportableColumnsForDescriptor(
  descriptor: DataExchangeDescriptorResponseDto | null | undefined
): DataExchangeColumnDescriptor[] {
  if (!descriptor) return [];
  const restrictedSet = new Set(descriptor.restrictedFieldKeys ?? []);
  return (descriptor.descriptor.columns ?? []).filter(
    (col) => col.direction !== "ImportOnly" && !restrictedSet.has(col.key)
  );
}

/**
 * Presentation ViewModel hook managing DataExchangeExportDialog state,
 * entity descriptor hydration, column selection, and immediate/background exports.
 */
export function useDataExchangeExportViewModel({
  open,
  onOpenChange,
  entityKey,
  descriptor: initialDescriptor,
  activeSearch,
  activeFilters,
}: UseDataExchangeExportOptions): UseDataExchangeExportReturn {
  const { direction, language, t } = useI18n();
  const isAr = language === "ar";
  const { activeTenantId } = useAdminContext();

  const [fetchedEntry, setFetchedEntry] = useState<{
    tenantId: string | null;
    entityKey: string;
    data: DataExchangeDescriptorResponseDto;
  } | null>(null);
  const [settledRequestKey, setSettledRequestKey] = useState<string | null>(null);
  const [format, setFormat] = useState<DataExchangeFileFormat>("xlsx");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isEnqueuingBackground, setIsEnqueuingBackground] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastInitializedRef = useRef<string>("");
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const matchingFetchedDescriptor =
    fetchedEntry &&
    fetchedEntry.tenantId === activeTenantId &&
    fetchedEntry.entityKey === entityKey.toLowerCase()
      ? fetchedEntry.data
      : null;

  const descriptor = initialDescriptor ?? matchingFetchedDescriptor;
  const activeFetchKey =
    open && entityKey && !initialDescriptor
      ? `${activeTenantId ?? "platform"}:${entityKey.toLowerCase()}`
      : null;
  const isLoadingDescriptor = Boolean(activeFetchKey && settledRequestKey !== activeFetchKey);

  useEffect(() => {
    if (!open || !entityKey || initialDescriptor || !activeFetchKey) {
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    const requestedTenantId = activeTenantId;
    const requestedEntityKey = entityKey.toLowerCase();
    const currentFetchKey = activeFetchKey;

    Promise.resolve(
      getCoreContainer().dataExchangeRepository.getEntityDescriptor(entityKey, controller.signal)
    )
      .then((res) => {
        if (!cancelled && res) {
          setFetchedEntry({
            tenantId: requestedTenantId,
            entityKey: requestedEntityKey,
            data: res,
          });
          setErrorMessage(null);
        }
      })
      .catch((err) => {
        if (!cancelled && !isAbortOrInterceptedError(err)) {
          setErrorMessage(
            getStudioErrorMessage(err, tRef.current("dataExchange.errors.loadMetaFailed"))
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSettledRequestKey(currentFetchKey);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, entityKey, initialDescriptor, activeTenantId, activeFetchKey]);

  const exportableColumns = getExportableColumnsForDescriptor(descriptor);
  const descriptorEntityKey = descriptor?.descriptor.entityKey ?? "";

  useEffect(() => {
    if (!open) {
      lastInitializedRef.current = "";
      return;
    }
    if (!descriptorEntityKey || !descriptor) return;
    const columns = getExportableColumnsForDescriptor(descriptor);
    const initKey = `${activeTenantId ?? "platform"}:${entityKey.toLowerCase()}:${descriptorEntityKey}`;
    if (lastInitializedRef.current === initKey) return;
    lastInitializedRef.current = initKey;
    setSelectedColumns(columns.map((c) => c.key));
    setErrorMessage(null);
  }, [open, activeTenantId, entityKey, descriptorEntityKey, descriptor]);

  const toggleColumn = useCallback((key: string, checked: boolean) => {
    setSelectedColumns((prev) =>
      checked ? (prev.includes(key) ? prev : [...prev, key]) : prev.filter((k) => k !== key)
    );
  }, []);

  const selectAllColumns = useCallback(() => {
    const cols = getExportableColumnsForDescriptor(descriptor);
    setSelectedColumns(cols.map((c) => c.key));
  }, [descriptor]);

  const clearSelection = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  const handleExport = useCallback(async () => {
    if (selectedColumns.length === 0) return;
    setIsExporting(true);
    setErrorMessage(null);
    try {
      await getCoreContainer().dataExchangeRepository.exportToFile({
        entityKey,
        format,
        locale: isAr ? "ar" : "en",
        search: activeSearch || null,
        selectedColumns,
        filters: activeFilters ?? null,
      });
      onOpenChange(false);
    } catch (err) {
      if (!isAbortOrInterceptedError(err)) {
        setErrorMessage(getStudioErrorMessage(err, t("dataExchange.errors.exportFailed")));
      }
    } finally {
      setIsExporting(false);
    }
  }, [activeFilters, activeSearch, entityKey, format, isAr, onOpenChange, selectedColumns, t]);

  const handleExportInBackground = useCallback(async () => {
    if (selectedColumns.length === 0) return;
    setIsEnqueuingBackground(true);
    setErrorMessage(null);
    try {
      const job = await getCoreContainer().dataExchangeRepository.enqueueExport({
        entityKey,
        format,
        locale: isAr ? "ar" : "en",
        search: activeSearch || null,
        selectedColumns,
        filters: activeFilters ?? null,
      });
      useDataExchangeJobsStore.getState().trackJob(job);
      const targetTitle = getEntityDisplayName(entityKey, t, isAr, descriptor);
      toast.info({
        id: "dx-job-" + job.id,
        title: t("dataExchange.exportDialog.toastExportQueuedTitle"),
        description: t("dataExchange.exportDialog.toastExportQueuedDesc", { entity: targetTitle }),
      });
      onOpenChange(false);
    } catch (err) {
      if (!isAbortOrInterceptedError(err)) {
        setErrorMessage(getStudioErrorMessage(err, t("dataExchange.errors.exportFailed")));
      }
    } finally {
      setIsEnqueuingBackground(false);
    }
  }, [
    activeFilters,
    activeSearch,
    descriptor,
    entityKey,
    format,
    isAr,
    onOpenChange,
    selectedColumns,
    t,
  ]);

  const entityTitle = getEntityDisplayName(entityKey, t, isAr, descriptor);

  return {
    direction,
    isAr,
    entityTitle,
    exportableColumns,
    isLoadingDescriptor,
    format,
    setFormat,
    selectedColumns,
    isExporting,
    isEnqueuingBackground,
    errorMessage,
    toggleColumn,
    selectAllColumns,
    clearSelection,
    handleExport,
    handleExportInBackground,
  };
}
