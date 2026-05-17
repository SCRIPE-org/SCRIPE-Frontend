"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";

export function useCategoriesViewModel() {
  const queryClient = useQueryClient();
  const { categoriesRepository } = marketplaceContainer;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketplace", "categories"] });

  const categoriesQuery = useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: () => categoriesRepository.getAll(),
    staleTime: 10 * 60 * 1000, // categories are stable
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesRepository.delete(id),
    onSuccess: invalidate,
  });

  const categories = categoriesQuery.data ?? [];

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    stats: { total: categories.length, active: categories.filter((c) => c.isActive).length },
  };
}
