"use client";

/**
 * useExportReport — Generic export hook for dashboard/analytics/security pages.
 *
 * Handles blob-based file downloads for CSV, Excel, and PDF formats.
 * Reusable across any page that needs export with date range.
 *
 * SOLID: Single responsibility — export logic only.
 */
import { useState, useCallback } from "react";
import { getCoreContainer } from "@core/di";
import { buildUrl } from "@core/config/api-endpoints";

export type ExportFormat = "csv" | "excel" | "pdf";

interface ExportReportParams {
  /** API endpoint path (e.g., '/Dashboard/export') */
  endpoint: string;
  /** File format */
  format: ExportFormat;
  /** ISO date string: YYYY-MM-DD */
  dateFrom?: string;
  /** ISO date string: YYYY-MM-DD */
  dateTo?: string;
}

interface UseExportReportResult {
  exportReport: (params: ExportReportParams) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}

export function useExportReport(): UseExportReportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = useCallback(
    async ({ endpoint, format, dateFrom, dateTo }: ExportReportParams) => {
      setIsExporting(true);
      setError(null);

      try {
        const token = getCoreContainer().apiService.getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

        const url = buildUrl(endpoint, {
          format,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
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

        // Extract filename from Content-Disposition header
        const disposition = response.headers.get("content-disposition");
        let filename = `report-export.${format === "excel" ? "xlsx" : format}`;
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match?.[1]) filename = match[1].replace(/['"']*/g, "");
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
    },
    []
  );

  return { exportReport, isExporting, error };
}
