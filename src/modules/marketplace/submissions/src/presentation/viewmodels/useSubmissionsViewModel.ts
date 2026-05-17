"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";

export function useSubmissionsViewModel() {
  const queryClient = useQueryClient();
  const { submissionsRepository } = marketplaceContainer;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketplace", "submissions"] });

  const submissionsQuery = useQuery({
    queryKey: ["marketplace", "submissions", page, statusFilter],
    queryFn: () => submissionsRepository.getAll({ page, pageSize: 20, status: statusFilter }),
  });

  const approveMutation = useMutation({ mutationFn: (id: string) => submissionsRepository.approve(id), onSuccess: invalidate });
  const rejectMutation = useMutation({ mutationFn: ({ id, notes }: { id: string; notes: string }) => submissionsRepository.reject(id, notes), onSuccess: invalidate });
  const revisionsMutation = useMutation({ mutationFn: ({ id, notes }: { id: string; notes: string }) => submissionsRepository.requestRevisions(id, notes), onSuccess: invalidate });

  const data = submissionsQuery.data;
  return {
    submissions: data?.items ?? [],
    pagination: { page, pageSize: 20, totalCount: data?.totalCount ?? 0, totalPages: data?.totalPages ?? 1 },
    isLoading: submissionsQuery.isLoading,
    error: submissionsQuery.error,
    setPage,
    setStatusFilter,
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    requestRevisions: revisionsMutation.mutate,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
