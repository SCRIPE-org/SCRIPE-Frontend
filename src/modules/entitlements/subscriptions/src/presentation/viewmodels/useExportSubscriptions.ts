/**
 * useExportSubscriptions Hook
 *
 * Calls the backend export API to generate professional Excel/CSV/PDF files.
 * The backend uses ClosedXML for real .xlsx files.
 *
 * Follows the exact same pattern as @core/hooks/use-export-report.ts:
 *  - Uses getCoreContainer().apiService.getAuthToken() for auth
 *  - Prepends NEXT_PUBLIC_API_URL to construct the full backend URL
 *
 * SOLID: Single responsibility — export logic only.
 */
"use client";

import { useState, useCallback } from "react";
import { getCoreContainer } from "@core/di";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export type ExportFormat = "csv" | "excel" | "pdf";

interface ExportParams {
      format: ExportFormat;
      statusFilter?: string;
      typeFilter?: string;
      displayCurrency?: string;
}

interface UseExportSubscriptionsResult {
      exportSubscriptions: (params: ExportParams) => Promise<void>;
      isExporting: boolean;
      error: string | null;
}

export function useExportSubscriptions(): UseExportSubscriptionsResult {
      const [isExporting, setIsExporting] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const exportSubscriptions = useCallback(
            async ({ format, statusFilter, typeFilter, displayCurrency }: ExportParams) => {
                  setIsExporting(true);
                  setError(null);

                  try {
                        // ── Auth token from core DI container (architecture pattern) ──
                        const token = getCoreContainer().apiService.getAuthToken();
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

                        // ── Build the endpoint path ──
                        const endpointPath = API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.EXPORT(
                              format,
                              statusFilter,
                              typeFilter,
                              displayCurrency
                        );

                        // ── Full URL = backend base + endpoint path ──
                        const fullUrl = `${apiUrl}${endpointPath}`;

                        const response = await fetch(fullUrl, {
                              method: "GET",
                              headers: {
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                              },
                        });

                        if (!response.ok) {
                              const errorBody = await response.text();
                              throw new Error(errorBody || `Export failed (${response.status})`);
                        }

                        // Download as file for all formats (PDF is now a real binary from QuestPDF)
                        const blob = await response.blob();
                        const contentDisposition = response.headers.get("content-disposition");
                        const ext = format === "excel" ? "xlsx" : format === "csv" ? "csv" : "pdf";
                        let filename = `subscriptions-export.${ext}`;


                        // Parse filename from Content-Disposition header if available
                        if (contentDisposition) {
                              const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                              if (match?.[1]) filename = match[1].replace(/['"']*/g, "");
                        }

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

      return { exportSubscriptions, isExporting, error };
}
