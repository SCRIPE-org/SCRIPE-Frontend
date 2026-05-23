"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { GenerateReportRequest } from "../../domain/entities/ComplianceReport";

export function useReportViewModel() {
  const { reportRepository } = complianceContainer;
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();

  const query = useQuery({
    queryKey: ["compliance", "reports"],
    queryFn: () => reportRepository.getAll({ page: 1, pageSize: 50 }),
    staleTime: 10_000,
    retry: false,
    // Auto-poll every 5s while any report is still pending
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((r) => r.isPending) ? 5_000 : false;
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateReportRequest) => reportRepository.generate(data),
    onSuccess: () => {
      // Immediately refetch so the new Pending report appears and polling kicks in
      queryClient.invalidateQueries({ queryKey: ["compliance", "reports"] });
      success({ title: t("compliance.reports.generating") || "Report generation started" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const reports = query.data?.items ?? [];
  const pendingCount = reports.filter((r) => r.isPending).length;

  return {
    reports,
    totalCount: query.data?.totalCount ?? 0,
    pendingCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    generateReport: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
