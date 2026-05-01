/**
 * useExportSubscriptions Hook
 *
 * State management ONLY — delegates all data operations to the Repository
 * via the parent-level Entitlements DI container.
 *
 * Architecture: ViewModel → entitlementsContainer → SubscriptionRepository → Service → API
 *
 * SOLID: Single responsibility — export state management only.
 */
"use client";

import { useState, useCallback } from "react";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { ExportFormat, ExportParams } from "../../domain/entities/SubscriptionExport";

export type { ExportFormat };

interface ExportOptions {
  format: ExportFormat;
  statusFilter?: string;
  typeFilter?: string;
  displayCurrency?: string;
  dateFrom?: string;
  dateTo?: string;
  expiringInDays?: number;
  editionFilter?: string;
}

interface UseExportSubscriptionsResult {
  exportSubscriptions: (params: ExportOptions) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}

export function useExportSubscriptions(): UseExportSubscriptionsResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSubscriptions = useCallback(async (params: ExportOptions) => {
    setIsExporting(true);
    setError(null);

    try {
      // ── All data operations via Entitlements DI Container ──
      const exportParams: ExportParams = {
        format: params.format,
        statusFilter: params.statusFilter,
        typeFilter: params.typeFilter,
        displayCurrency: params.displayCurrency,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        expiringInDays: params.expiringInDays,
        editionFilter: params.editionFilter,
      };

      const { blob, filename } =
        await entitlementsContainer.subscriptionRepository.exportSubscriptions(exportParams);

      // ── Trigger browser download (pure UI concern) ──
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

  return { exportSubscriptions, isExporting, error };
}
