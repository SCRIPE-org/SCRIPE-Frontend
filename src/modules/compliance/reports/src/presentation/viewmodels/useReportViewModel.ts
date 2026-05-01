"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import type { GenerateReportRequest } from "../../domain/entities/ComplianceReport";

export function useReportViewModel() {
  const { reportRepository } = complianceContainer;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compliance", "reports"],
    queryFn: () => reportRepository.getAll({ page: 1, pageSize: 20 }),
    staleTime: 30_000,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateReportRequest) => reportRepository.generate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "reports"] }),
  });

  return {
    reports: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    generateReport: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
