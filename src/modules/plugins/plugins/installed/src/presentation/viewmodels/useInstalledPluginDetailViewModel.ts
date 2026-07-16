"use client";

import { useQuery } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";
import { useAppStore } from "@core/store/useAppStore";

/**
 * useInstalledPluginDetailViewModel
 *
 * ViewModel hook for the Installed Plugin Detail page.
 * Fetches a single PluginInstallation by ID and exposes it to the view.
 *
 * Dependency flow:
 *   useInstalledPluginDetailViewModel → IInstalledRepository → IInstalledService → IApiService
 */
export function useInstalledPluginDetailViewModel(installationId: string) {
  const { user } = useAppStore();
  const tenantId = user?.tenantId ?? "";
  const { installedRepository } = pluginsContainer;

  const detailQuery = useQuery({
    queryKey: ["plugins", "installed", tenantId, installationId],
    queryFn: async () => {
      // Fetch the full list and find the single installation by ID.
      // This avoids needing a separate getById endpoint on the repository for now.
      const all = await installedRepository.getInstalled(tenantId);
      const found = all.find((i) => i.id === installationId);
      if (!found) throw new Error("Installation not found");
      return found;
    },
    staleTime: 2 * 60_000,
    enabled: !!installationId && !!tenantId,
  });

  return {
    installation: detailQuery.data ?? null,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    refetch: detailQuery.refetch,
    tenantId,
  };
}
