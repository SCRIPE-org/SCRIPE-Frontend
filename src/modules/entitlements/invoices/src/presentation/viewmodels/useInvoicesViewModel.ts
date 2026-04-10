"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";

export function useInvoicesViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { invoicesRepository } = entitlementsContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["invoices", page, pageSize, search],
    queryFn: () => invoicesRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => invoicesRepository.pay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(t("invoices.paySuccess") || "Payment processed");
    },
    onError: () => toast.error(t("invoices.payError") || "Payment failed"),
  });

  const voidMutation = useMutation({
    mutationFn: (id: string) => invoicesRepository.void(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(t("invoices.voidSuccess") || "Invoice voided");
    },
    onError: () => toast.error(t("invoices.voidError") || "Failed to void invoice"),
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => invoicesRepository.downloadPdf(id),
    onSuccess: (blob) => {
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(t("invoices.downloadSuccess") || "Invoice downloaded");
    },
    onError: () => toast.error(t("invoices.downloadError") || "Download failed"),
  });

  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);
  const handlePay = useCallback((id: string) => { payMutation.mutate(id); }, [payMutation]);
  const handleVoid = useCallback((id: string) => { voidMutation.mutate(id); }, [voidMutation]);
  const handleDownload = useCallback((id: string) => { downloadMutation.mutate(id); }, [downloadMutation]);
  const handleView = useCallback((inv: any) => { setSelectedInvoice(inv); setViewDialogOpen(true); }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading, error, page, pageSize, search,
    setPage, setPageSize, handleSearch, refetch,
    handlePay, handleVoid, handleDownload, handleView,
    isPaying: payMutation.isPending,
    payingId: payMutation.variables,
    isVoiding: voidMutation.isPending,
    isDownloading: downloadMutation.isPending,
    downloadingId: downloadMutation.variables,
    viewDialogOpen, setViewDialogOpen, selectedInvoice,
  };
}
