"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import type { DsrListParams, SubmitDsrRequest, ReviewDsrRequest } from "../../domain/entities/DsrRequests";

export function useDsrViewModel(params: DsrListParams = {}) {
  const { dsrRepository } = complianceContainer;
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["compliance", "dsr", params],
    queryFn: () => dsrRepository.getAll(params),
    staleTime: 30_000,
  });

  const submitMutation = useMutation({
    mutationFn: (data: SubmitDsrRequest) => dsrRepository.submit(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "dsr"] }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewDsrRequest }) =>
      dsrRepository.review(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "dsr"] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => dsrRepository.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance", "dsr"] }),
  });

  return {
    dsrs: listQuery.data?.items ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    submitDsr: submitMutation.mutateAsync,
    reviewDsr: reviewMutation.mutateAsync,
    cancelDsr: cancelMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    isReviewing: reviewMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
