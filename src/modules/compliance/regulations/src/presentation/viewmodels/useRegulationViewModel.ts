"use client";

import { useQuery } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";

export function useRegulationViewModel() {
  const { regulationRepository } = complianceContainer;

  const query = useQuery({
    queryKey: ["compliance", "regulations"],
    queryFn: () => regulationRepository.getAll(),
    staleTime: 5 * 60_000,
  });

  return {
    regulations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
