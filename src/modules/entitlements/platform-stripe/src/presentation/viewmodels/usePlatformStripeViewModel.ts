/**
 * usePlatformStripeViewModel — fetches the complete Platform Stripe Dashboard data.
 *
 * Uses IPlatformStripeRepository via DI container (never accesses services directly).
 * Returns PlatformStripeDashboard domain entity (never raw DTOs).
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlatformStripeDashboard } from "../../domain/entities/PlatformStripeDashboard";
import { entitlementsContainer } from "@modules/entitlements/di";

/**
 * React hook/ViewModel orchestrating state and data flows for platform stripe view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function usePlatformStripeViewModel() {
  const { platformStripeRepository } = entitlementsContainer;

  const {
    data: dashboard,
    isLoading,
    error,
    refetch,
  } = useQuery<PlatformStripeDashboard>({
    queryKey: ["platform-stripe", "dashboard"],
    queryFn: () => platformStripeRepository.getDashboard(),
    staleTime: 30 * 1000, // 30 seconds — live data
    retry: 2,
  });

  return {
    dashboard,
    isLoading,
    error,
    refetch,
  };
}
