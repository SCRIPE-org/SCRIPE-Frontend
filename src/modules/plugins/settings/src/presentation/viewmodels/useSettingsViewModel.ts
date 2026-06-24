"use client";

import { useQuery } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";

/**
 * React hook/ViewModel managing logic, state, and repository queries for settings view model.
 */
export function useSettingsViewModel(installationId: string, tenantId: string) {
  const { installedRepository } = pluginsContainer;

  const installation = useQuery({
    queryKey: ["plugins", "installation", installationId],
    queryFn: () =>
      installedRepository
        .getInstalled(tenantId)
        .then((list) => list.find((i) => i.id === installationId) ?? null),
    enabled: !!installationId && !!tenantId,
    staleTime: 60_000,
  });

  return {
    installation: installation.data ?? null,
    isLoading: installation.isLoading,
    isError: installation.isError,
    refetch: installation.refetch,
  };
}
