"use client";

/**
 * useExportAudit Hook
 *
 * Handles audit log export with blob download for CSV, Excel, and PDF formats.
 * Uses the AuditRepository (via DI) instead of direct fetch calls.
 *
 * SOLID: Single responsibility — export logic only.
 */
import { useState, useCallback } from "react";
import { monitoringContainer } from "@modules/monitoring/di";
import type { AuditFilterState } from "./useAuditViewModel";

/**
 * Exported type defining parameters and fields for export format configurations.
 */
export type ExportFormat = "csv" | "excel" | "pdf";

interface ExportParams {
  format: ExportFormat;
  filters: AuditFilterState;
}

interface UseExportAuditResult {
  exportAudit: (params: ExportParams) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}

/**
 * React hook/ViewModel orchestrating state and data flows for export audit.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useExportAudit(): UseExportAuditResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAudit = useCallback(async ({ format, filters }: ExportParams) => {
    setIsExporting(true);
    setError(null);

    try {
      const { auditRepository } = monitoringContainer;

      const blob = await auditRepository.exportLogs(format, {
        eventType: filters.eventType || undefined,
        username: filters.username || undefined,
        entityType: filters.entityType || undefined,
        search: filters.search || undefined,
        correlationId: filters.correlationId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        isSuccess: filters.isSuccess,
      });

      // Build filename
      const filename = `audit-export.${format === "excel" ? "xlsx" : format}`;

      // Download blob
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      setError(message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportAudit, isExporting, error };
}
