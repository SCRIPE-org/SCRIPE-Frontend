"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useDevelopersViewModel() {
  const queryClient = useQueryClient();
  const { developersRepository } = marketplaceContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["marketplace", "developers"] });

  const developersQuery = useQuery({
    queryKey: ["marketplace", "developers", page, search],
    queryFn: () => developersRepository.getAll({ page, pageSize: 20, search: search || undefined }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => developersRepository.verify(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("marketplace.developers.verified") || "Developer verified" });
    },
    onError: (err: Error) => {
      showError({ title: t("common.error") || "Error", description: err.message });
    },
  });

  const data = developersQuery.data;
  return {
    developers: data?.items ?? [],
    pagination: {
      page,
      pageSize: 20,
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 1,
    },
    isLoading: developersQuery.isLoading,
    error: developersQuery.error,
    setPage,
    setSearch,
    verify: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,
    stats: {
      total: data?.totalCount ?? 0,
      verified: (data?.items ?? []).filter((d) => d.isVerified).length,
    },
  };
}
