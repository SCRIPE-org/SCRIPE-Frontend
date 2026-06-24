"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * React hook/ViewModel managing logic, state, and repository queries for installed view model.
 */
export function useInstalledViewModel(tenantId: string) {
  const { installedRepository } = pluginsContainer;
  const queryClient = useQueryClient();
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();

  const installedKey = ["plugins", "installed", tenantId];

  const installed = useQuery({
    queryKey: installedKey,
    queryFn: () => installedRepository.getInstalled(tenantId),
    staleTime: 2 * 60_000,
    enabled: !!tenantId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: installedKey });

  const uninstall = useMutation({
    mutationFn: (installationId: string) => installedRepository.uninstall(installationId, tenantId),
    onSuccess: () => {
      invalidate();
      success({ title: t("plugins.uninstallSuccess") });
    },
    onError: () => error({ title: t("plugins.uninstallError") }),
  });

  const activate = useMutation({
    mutationFn: (installationId: string) => installedRepository.activate(installationId, tenantId),
    onSuccess: () => {
      invalidate();
      success({ title: t("plugins.activateSuccess") });
    },
    onError: () => error({ title: t("plugins.activateError") }),
  });

  const deactivate = useMutation({
    mutationFn: (installationId: string) =>
      installedRepository.deactivate(installationId, tenantId),
    onSuccess: () => {
      invalidate();
      success({ title: t("plugins.deactivateSuccess") });
    },
    onError: () => error({ title: t("plugins.deactivateError") }),
  });

  return {
    installations: installed.data ?? [],
    isLoading: installed.isLoading,
    isError: installed.isError,
    refetch: installed.refetch,
    uninstall: uninstall.mutateAsync,
    activate: activate.mutateAsync,
    deactivate: deactivate.mutateAsync,
    isMutating: uninstall.isPending || activate.isPending || deactivate.isPending,
  };
}
