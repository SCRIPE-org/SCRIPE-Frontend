"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";

export function useReviewsViewModel() {
  const queryClient = useQueryClient();
  const { reviewsRepository } = marketplaceContainer;
  const [page, setPage] = useState(1);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketplace", "reviews"] });

  const reviewsQuery = useQuery({
    queryKey: ["marketplace", "reviews", page],
    queryFn: () => reviewsRepository.getAll({ page, pageSize: 20 }),
  });

  const moderateMutation = useMutation({ mutationFn: (id: string) => reviewsRepository.delete(id), onSuccess: invalidate });

  const data = reviewsQuery.data;
  return {
    reviews: data?.items ?? [],
    pagination: { page, pageSize: 20, totalCount: data?.totalCount ?? 0, totalPages: data?.totalPages ?? 1 },
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error,
    setPage,
    moderate: moderateMutation.mutate,
    isModerating: moderateMutation.isPending,
  };
}
