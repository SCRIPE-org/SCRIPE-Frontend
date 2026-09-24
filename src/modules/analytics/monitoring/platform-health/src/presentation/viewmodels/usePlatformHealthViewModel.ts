"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { monitoringContainer } from "../../../../di";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { usePermission } from "@core/hooks/use-permission";
import { MONITORING_PERMISSIONS } from "../../../../permission-constants";

export function usePlatformHealthViewModel() {
  const { isPlatform } = useAdminContext();
  const canViewObservability = usePermission(MONITORING_PERMISSIONS.OBSERVABILITY_VIEW);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const query = useQuery({
    queryKey: ["platform-health"],
    queryFn: ({ signal }) => monitoringContainer.platformHealthRepository.getHealth(signal),
    enabled: isPlatform && canViewObservability,
    refetchInterval: autoRefresh ? 10000 : false,
    staleTime: 5000,
  });

  return {
    health: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    autoRefresh,
    setAutoRefresh,
    isAuthorized: isPlatform && canViewObservability,
  };
}
