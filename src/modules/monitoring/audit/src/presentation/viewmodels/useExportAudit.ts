"use client";

/**
 * useExportAudit Hook
 *
 * Handles audit log export with blob download for CSV, Excel, and PDF formats.
 * Uses fetch directly (instead of IApiService.get) because the response is a
 * binary file, not JSON.
 *
 * SOLID: Single responsibility — export logic only.
 */
import { useState, useCallback } from "react";
import { getCoreContainer } from "@core/di";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { AuditFilterState } from "./useAuditViewModel";

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

export function useExportAudit(): UseExportAuditResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAudit = useCallback(async ({ format, filters }: ExportParams) => {
    setIsExporting(true);
    setError(null);

    try {
      const token = getCoreContainer().apiService.getAuthToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

      // Build query params from filters
      const url = buildUrl(API_ENDPOINTS.AUDIT.EXPORT, {
        format,
        eventType: filters.eventType || undefined,
        username: filters.username || undefined,
        entityType: filters.entityType || undefined,
        search: filters.search || undefined,
        correlationId: filters.correlationId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        isSuccess: filters.isSuccess,
      });

      const response = await fetch(`${apiUrl}${url}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `Export failed (${response.status})`);
      }

      // Extract filename from Content-Disposition header, or build a default
      const disposition = response.headers.get("content-disposition");
      let filename = `audit-export.${format === "excel" ? "xlsx" : format}`;
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) filename = match[1].replace(/['"]*/g, "");
      }

      // Download blob
      const blob = await response.blob();
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
