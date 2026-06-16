"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { InstallPluginRequest } from "../../domain/interfaces/ICatalogRepository";

export function useCatalogViewModel(tenantId: string) {
  const { catalogRepository } = pluginsContainer;
  const queryClient = useQueryClient();
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();

  const catalogKey = ["plugins", "catalog", tenantId];

  const catalog = useQuery({
    queryKey: catalogKey,
    queryFn: () => catalogRepository.getCatalog(tenantId),
    staleTime: 5 * 60_000,
    enabled: !!tenantId,
  });

  const install = useMutation({
    mutationFn: (request: InstallPluginRequest) => catalogRepository.install(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKey });
      queryClient.invalidateQueries({ queryKey: ["plugins", "installed", tenantId] });
      success({ title: t("plugins.install") });
    },
    onError: () => {
      error({ title: t("plugins.catalogError") });
    },
  });

  return {
    plugins: catalog.data ?? [],
    isLoading: catalog.isLoading,
    isError: catalog.isError,
    refetch: catalog.refetch,
    install: install.mutateAsync,
    isInstalling: install.isPending,
  };
}
