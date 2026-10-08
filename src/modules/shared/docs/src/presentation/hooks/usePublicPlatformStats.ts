/**
 * usePublicPlatformStats — fetches real, safe aggregate platform stats
 * (tenant count, module count, uptime SLA) for the public marketing hero.
 * Calls the unauthenticated GET /api/v1/public/platform-stats endpoint —
 * no revenue/MRR is ever returned by that endpoint, by design.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getBaseApiService } from "@core/services/api-factory";
import { V1 } from "@core/config/api-endpoints/_shared";

/**
 * Telemetry response payload representing high-level public platform metrics.
 */
export interface PublicPlatformStatsResponse {
  /** Total count of active tenants provisioned across the platform */
  activeTenants: number;
  /** Number of active operational business modules */
  activeModules: number;
  /** Service level agreement uptime commitment indicator */
  uptimeSla: string;
}

/**
 * Documentation for module export
 */
export function usePublicPlatformStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["public", "platform-stats"],
    queryFn: () =>
      getBaseApiService().get<PublicPlatformStatsResponse>(`${V1}/public/platform-stats`),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { stats: data, isLoading };
}
