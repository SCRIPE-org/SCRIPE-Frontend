"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";

export function useBulkOperationsViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { bulkOperationsRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bulk-operations", page, pageSize, search],
    queryFn: () => bulkOperationsRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => bulkOperationsRepository.importData(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulk-operations"] });
      toast.success(t("bulkOperations.importSuccess") || "Import started");
    },
    onError: () => toast.error(t("bulkOperations.importError") || "Import failed"),
  });

  const exportMutation = useMutation({
    mutationFn: (params: Record<string, unknown>) => bulkOperationsRepository.exportData(params),
    onSuccess: (blob) => {
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bulk-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(t("bulkOperations.exportSuccess") || "Export completed");
    },
    onError: () => toast.error(t("bulkOperations.exportError") || "Export failed"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bulkOperationsRepository.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulk-operations"] });
      toast.success(t("bulkOperations.cancelSuccess") || "Operation cancelled");
    },
    onError: () => toast.error(t("bulkOperations.cancelError") || "Failed to cancel"),
  });

  const handleImport = useCallback(() => { fileInputRef.current?.click(); }, []);
  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
    e.target.value = "";
  }, [importMutation]);
  const handleExport = useCallback(() => { exportMutation.mutate({ format: "csv" }); }, [exportMutation]);
  const handleCancel = useCallback((id: string) => { cancelMutation.mutate(id); }, [cancelMutation]);
  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading, error, page, pageSize, search,
    setPage, setPageSize, handleSearch, refetch,
    handleImport, handleFileSelected, handleExport, handleCancel,
    isImporting: importMutation.isPending,
    isExporting: exportMutation.isPending,
    isCancelling: cancelMutation.isPending,
    cancellingId: cancelMutation.variables,
    fileInputRef,
  };
}
