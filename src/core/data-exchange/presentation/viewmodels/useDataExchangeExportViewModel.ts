"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCoreContainer } from "@core/di";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import { getEntityDisplayName } from "../utils/entity-display-names";
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

  const [descriptor, setDescriptor] = useState<DataExchangeDescriptorResponseDto | null>(
    initialDescriptor ?? null
  );
  const [format, setFormat] = useState<DataExchangeFileFormat>("xlsx");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isEnqueuingBackground, setIsEnqueuingBackground] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastInitializedRef = useRef<string>("");

  useEffect(() => {
    if (initialDescriptor) {
      setDescriptor(initialDescriptor);
    }
  }, [initialDescriptor]);

  useEffect(() => {
    if (!open || !entityKey || initialDescriptor) return;
    const controller = new AbortController();
    let cancelled = false;
    getCoreContainer()
      .dataExchangeRepository.getEntityDescriptor(entityKey, controller.signal)
      .then((res) => {
        if (!cancelled && res) setDescriptor(res);
      })
      .catch(() => {
        // Error surfaced on export if needed
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, entityKey, initialDescriptor]);

  const restrictedSet = new Set(descriptor?.restrictedFieldKeys ?? []);
  const exportableColumns = (descriptor?.descriptor.columns ?? []).filter(
    (col) => col.direction !== "ImportOnly" && !restrictedSet.has(col.key)
  );
  const descriptorEntityKey = descriptor?.descriptor.entityKey ?? "";

  useEffect(() => {
    if (!open) {
      lastInitializedRef.current = "";
      return;
    }
    if (!descriptorEntityKey || exportableColumns.length === 0) return;
    const initKey = `${entityKey}:${descriptorEntityKey}`;
    if (lastInitializedRef.current === initKey) return;
    lastInitializedRef.current = initKey;
    setSelectedColumns(exportableColumns.map((c) => c.key));
    setErrorMessage(null);
  }, [open, entityKey, descriptorEntityKey, exportableColumns]);

  const toggleColumn = useCallback((key: string, checked: boolean) => {
    setSelectedColumns((prev) =>
      checked ? (prev.includes(key) ? prev : [...prev, key]) : prev.filter((k) => k !== key)
    );
  }, []);

  const selectAllColumns = useCallback(() => {
    setSelectedColumns(exportableColumns.map((c) => c.key));
  }, [exportableColumns]);

  const clearSelection = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      await getCoreContainer().dataExchangeRepository.exportToFile({
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
        err instanceof Error && err.message ? err.message : t("dataExchange.errors.exportFailed")
      );
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
        selectedColumns: selectedColumns.length > 0 ? selectedColumns : null,
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
      setErrorMessage(
        err instanceof Error && err.message ? err.message : t("dataExchange.errors.exportFailed")
      );
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
