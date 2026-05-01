"use client";

import { useQuery } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";

export function useRetentionViewModel() {
  const { retentionRepository } = complianceContainer;

  const query = useQuery({
    queryKey: ["compliance", "retention"],
    queryFn: () => retentionRepository.getAll(),
    staleTime: 60_000,
  });

  const policies = query.data ?? [];
  const activeCount = policies.filter(p => p.isActive).length;

  return {
    policies,
    activeCount,
    totalCount: policies.length,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
