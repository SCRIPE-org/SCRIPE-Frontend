"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import { CommissionLedgerEntry } from "../../domain/entities/CommissionLedgerEntry";
import { CommissionInvoice } from "../../domain/entities/CommissionInvoice";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc, formatDateUtc } from "@core/common/utils";

/**
 * React hook/ViewModel orchestrating state and data flows for commission ledger view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useCommissionLedgerViewModel() {
  const { t } = useI18n();
  const { toast } = useEnhancedToast();
  const queryClient = useQueryClient();

  const { commissionLedgerRepository } = entitlementsContainer;

  const [ledgerPage, setLedgerPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const pageSize = 10;

  const { data: ledgerData, isLoading: isLoadingLedgers } = useQuery({
    queryKey: ["commission-ledgers", ledgerPage, pageSize],
    queryFn: () => commissionLedgerRepository.getLedgers({ page: ledgerPage, pageSize }),
  });

  const { data: invoiceData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["commission-invoices", invoicePage, pageSize],
    queryFn: () => commissionLedgerRepository.getInvoices({ page: invoicePage, pageSize }),
  });

  const waiveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      commissionLedgerRepository.waiveInvoice(id, notes),
    onSuccess: () => {
      toast({
        title: t("common.success") || "Success",
        description: t("entitlements.commissionLedger.waived") || "Invoice waived successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["commission-invoices"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => commissionLedgerRepository.retryCharge(id),
    onSuccess: () => {
      toast({
        title: t("common.success") || "Success",
        description: t("entitlements.commissionLedger.retryScheduled") || "Charge retry scheduled",
      });
      queryClient.invalidateQueries({ queryKey: ["commission-invoices"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const ledgerColumns: CrudColumn<CommissionLedgerEntry>[] = [
    {
      key: "tenantId",
      label: t("entitlements.commissionLedger.tenantId") || "Tenant ID",
    },
    {
      key: "gateway",
      label: t("entitlements.commissionLedger.gateway") || "Gateway",
      render: (_value, item) => item.displayGateway,
    },
    {
      key: "collectionMethod",
      label: t("entitlements.commissionLedger.collectionMethod") || "Type",
      render: (_value, item) =>
        item.isInstant
          ? "⚡ Instant" // Stripe Connect — already collected
          : "📋 Post-Billing", // PayPal/Paymob — will be invoiced
    },
    {
      key: "grossAmount",
      label: t("entitlements.commissionLedger.grossAmount") || "Gross Amount",
      render: (value, item) => `${(value as number).toFixed(2)} ${item.currency}`,
    },
    {
      key: "commissionAmount",
      label: t("entitlements.commissionLedger.commission") || "Commission",
      render: (value, item) =>
        `${(value as number).toFixed(2)} ${item.currency} (${item.commissionRateDisplay})`,
    },
    {
      key: "netAmount",
      label: t("entitlements.commissionLedger.netAmount") || "Net to Tenant",
      render: (value, item) => `${(value as number).toFixed(2)} ${item.currency}`,
    },
    {
      key: "status",
      label: t("entitlements.commissionLedger.status") || "Status",
    },
    {
      key: "createdAt",
      label: t("entitlements.commissionLedger.date") || "Date",
      render: (value) => formatDateTimeUtc(value as string),
    },
  ];

  const invoiceColumns: CrudColumn<CommissionInvoice>[] = [
    {
      key: "invoiceNumber",
      label: t("entitlements.commissionLedger.invoiceNumber") || "Invoice #",
    },
    {
      key: "periodStart",
      label: t("entitlements.commissionLedger.period") || "Period",
      render: (value, item) =>
        `${formatDateUtc(value)} - ${formatDateUtc(item.periodEnd)}`,
    },
    {
      key: "totalCommission",
      label: t("entitlements.commissionLedger.total") || "Total",
      render: (value, item) => `${value} ${item.currency}`,
    },
    {
      key: "status",
      label: t("entitlements.commissionLedger.status") || "Status",
    },
    {
      key: "actions",
      label: t("entitlements.commissionLedger.actions") || "Actions",
      render: (value, item) => item.id, // Handled by view actions normally
    },
  ];

  return {
    ledgerTable: {
      items: ledgerData?.items || [],
      pagination: {
        page: ledgerPage,
        pageSize,
        totalCount: ledgerData?.totalCount || 0,
        totalPages: Math.ceil((ledgerData?.totalCount || 0) / pageSize),
        onPageChange: setLedgerPage,
      },
      isLoading: isLoadingLedgers,
      columns: ledgerColumns,
    },
    invoiceTable: {
      items: invoiceData?.items || [],
      pagination: {
        page: invoicePage,
        pageSize,
        totalCount: invoiceData?.totalCount || 0,
        totalPages: Math.ceil((invoiceData?.totalCount || 0) / pageSize),
        onPageChange: setInvoicePage,
      },
      isLoading: isLoadingInvoices,
      columns: invoiceColumns,
    },
    actions: {
      waive: (id: string, notes: string) => waiveMutation.mutateAsync({ id, notes }),
      isWaiving: waiveMutation.isPending,
      retry: (id: string) => retryMutation.mutateAsync(id),
      isRetrying: retryMutation.isPending,
    },
  };
}
