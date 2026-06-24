import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { pluginsContainer } from "@modules/plugins/di";

/**
 * React hook/ViewModel orchestrating state and data flows for plugin execution logs view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function usePluginExecutionLogsViewModel() {
  const { user } = useAppStore();
  const tenantId = user?.tenantId ?? "";

  const { data: installations, isLoading } = useQuery({
    queryKey: ["installed-plugins-for-logs", tenantId],
    queryFn: () => pluginsContainer.installedRepository.getInstalled(tenantId),
    enabled: !!tenantId,
    staleTime: 60_000,
  });

  return {
    installations: installations ?? [],
    isLoading,
  };
}
