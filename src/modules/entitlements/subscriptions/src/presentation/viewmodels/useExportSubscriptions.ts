/**
 * useExportSubscriptions Hook
 *
 * Calls the backend export API to generate professional Excel/CSV/PDF files.
 * The backend uses ClosedXML for real .xlsx files.
 *
 * SOLID: Single responsibility — export logic only.
 */
"use client";

import { useState, useCallback } from "react";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { secureTokenService } from "@core/common/secure-token-service";

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
                        const url = API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.EXPORT(
                              format,
                              statusFilter,
                              typeFilter,
                              displayCurrency
                        );

                        const token = secureTokenService.getAccessToken();
                        const response = await fetch(url, {
                              method: "GET",
                              credentials: "include",
                              headers: {
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                              },
                        });

                        if (!response.ok) {
                              const errorData = await response.json().catch(() => null);
                              throw new Error(errorData?.error || `Export failed (${response.status})`);
                        }

                        // For PDF (HTML), open in new tab for browser print
                        if (format === "pdf") {
                              const html = await response.text();
                              const printWindow = window.open("", "_blank");
                              if (printWindow) {
                                    printWindow.document.write(html);
                                    printWindow.document.close();
                              }
                              return;
                        }

                        // For Excel/CSV, download as file
                        const blob = await response.blob();
                        const contentDisposition = response.headers.get("content-disposition");
                        let filename = `subscriptions-export.${format === "excel" ? "xlsx" : "csv"}`;

                        // Parse filename from Content-Disposition header if available
                        if (contentDisposition) {
                              const match = contentDisposition.match(/filename[^;=\n]*=["']?([^"';\n]*)["']?/);
                              if (match?.[1]) filename = match[1];
                        }

                        const url2 = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url2;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url2);
                  } catch (err) {
                        const message = err instanceof Error ? err.message : "Export failed";
                        setError(message);
                  } finally {
                        setIsExporting(false);
                  }
            },
            []
      );

      return { exportSubscriptions, isExporting, error };
}
