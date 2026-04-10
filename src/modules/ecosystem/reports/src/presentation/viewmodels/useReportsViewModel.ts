"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";

export function useReportsViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { reportsRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reports", page, pageSize, search],
    queryFn: () => reportsRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const executeMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => reportsRepository.execute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success(t("reports.runSuccess") || "Report executed");
    },
    onError: () => toast.error(t("reports.runError") || "Failed to execute report"),
  });

  const exportMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => reportsRepository.exportReport(data),
    onSuccess: (blob) => {
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(t("reports.exportSuccess") || "Report exported");
    },
    onError: () => toast.error(t("reports.exportError") || "Failed to export report"),
  });

  const handleRun = useCallback((reportId: string) => { executeMutation.mutate({ reportId }); }, [executeMutation]);
  const handleExport = useCallback((reportId: string) => { exportMutation.mutate({ reportId, format: "csv" }); }, [exportMutation]);
  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading, error, page, pageSize, search,
    setPage, setPageSize, handleSearch, refetch,
    handleRun, handleExport,
    isRunning: executeMutation.isPending,
    runningId: executeMutation.variables,
    isExporting: exportMutation.isPending,
    createDialogOpen, setCreateDialogOpen,
  };
}
