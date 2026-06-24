import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { pluginsContainer } from "@modules/plugins/di";

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
