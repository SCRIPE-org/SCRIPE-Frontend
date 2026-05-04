"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import type { UpdateRetentionPolicyRequest } from "../../domain/entities/RetentionPolicy";

export function useRetentionViewModel() {
  const { retentionRepository } = complianceContainer;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compliance", "retention"],
    queryFn: () => retentionRepository.getAll(),
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRetentionPolicyRequest }) =>
      retentionRepository.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "retention"] }),
  });

  const policies = query.data ?? [];
  const activeCount = policies.filter((p) => p.isActive).length;

  return {
    policies,
    activeCount,
    totalCount: policies.length,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updatePolicy: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
