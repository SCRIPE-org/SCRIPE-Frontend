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

interface PublicPlatformStatsResponse {
  activeTenants: number;
  activeModules: number;
  uptimeSla: string;
}

export function usePublicPlatformStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["public", "platform-stats"],
    queryFn: () => getBaseApiService().get<PublicPlatformStatsResponse>(`${V1}/public/platform-stats`),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { stats: data, isLoading };
}
