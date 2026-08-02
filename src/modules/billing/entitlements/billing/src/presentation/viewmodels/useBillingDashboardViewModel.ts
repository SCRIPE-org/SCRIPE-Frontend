"use client";

import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { BillingDashboard } from "../../domain/entities/BillingDashboard";
import { appLogger } from "@/core/common/logger";

/**
 * Dashboard ViewModel — fetches server-computed KPIs from the billing dashboard API.
 * All financial calculations (MRR, ARR, churn) are performed on the backend.
 * This hook simply consumes the pre-computed data.
 */
export function useBillingDashboardViewModel() {
  const { billingRepository } = entitlementsContainer;

  const dashboardQuery = useQuery<BillingDashboard>({
    queryKey: ["entitlements", "billing", "dashboard"],
    queryFn: () => billingRepository.getDashboard(),
    staleTime: 60_000, // 1 minute cache
    refetchOnWindowFocus: false,
  });

  const downloadInvoicePdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await billingRepository.downloadInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      appLogger.error("Failed to download invoice PDF:", error);
    }
  };

  return {
    dashboard: dashboardQuery.data ?? null,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    refetch: dashboardQuery.refetch,
    downloadInvoicePdf,
  };
}
