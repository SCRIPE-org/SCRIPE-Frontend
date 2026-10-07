"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { monitoringContainer } from "../../../../di";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { usePermission } from "@core/hooks/use-permission";
import { usePermissions } from "@core/providers/permission-provider";
import { MONITORING_PERMISSIONS } from "../../../../permission-constants";

export function usePlatformHealthViewModel() {
  const { isPlatform } = useAdminContext();
  const { isSuperAdmin, isPlatformSuperAdmin } = usePermissions();
  const hasPerm = usePermission(MONITORING_PERMISSIONS.OBSERVABILITY_VIEW);
  const canViewObservability = hasPerm || isSuperAdmin || isPlatformSuperAdmin;
  const isAuthorized = (isPlatform || isSuperAdmin || isPlatformSuperAdmin) && canViewObservability;
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("24h");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["platform-health"],
    queryFn: ({ signal }) => monitoringContainer.platformHealthRepository.getHealth(signal),
    enabled: isAuthorized,
    refetchInterval: autoRefresh ? 8000 : false,
    staleTime: 4000,
  });

  const health = query.data;

  // Selected incident resolution
  const selectedIncident = health?.incidents?.find(i => i.id === selectedIncidentId) 
    ?? health?.incidents?.[0] 
    ?? null;

  return {
    health,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    autoRefresh,
    setAutoRefresh,
    timeRange,
    setTimeRange,
    selectedIncidentId: selectedIncidentId ?? selectedIncident?.id ?? null,
    selectedIncident,
    setSelectedIncidentId,
    isAuthorized,
  };
}
