"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";

export function useMarketplaceViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { marketplaceRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["marketplace", page, pageSize, search],
    queryFn: () => marketplaceRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const installMutation = useMutation({
    mutationFn: (pluginId: string) => marketplaceRepository.install(pluginId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      toast.success(t("marketplace.installSuccess") || "Plugin installed successfully");
    },
    onError: () => {
      toast.error(t("marketplace.installError") || "Failed to install plugin");
    },
  });

  const handleInstall = useCallback((pluginId: string) => {
    installMutation.mutate(pluginId);
  }, [installMutation]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    handleSearch,
    refetch,
    handleInstall,
    isInstalling: installMutation.isPending,
    installingId: installMutation.variables,
  };
}
