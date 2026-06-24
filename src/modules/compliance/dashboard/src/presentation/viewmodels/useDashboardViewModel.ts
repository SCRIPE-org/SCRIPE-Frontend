"use client";

import { useQuery } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";

/**
 * React hook/ViewModel orchestrating state and data flows for dashboard view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useDashboardViewModel() {
  const { dashboardRepository } = complianceContainer;

  const query = useQuery({
    queryKey: ["compliance", "dashboard"],
    queryFn: () => dashboardRepository.getDashboard(),
    staleTime: 60_000,
    retry: 1,
  });

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
