/**
 * usePlatformStripeViewModel — fetches the complete Platform Stripe Dashboard data.
 * Uses the entitlementsContainer DI to access PlatformStripeService.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlatformStripeDashboardModel } from "../../data/models/PlatformStripeModels";
import { entitlementsContainer } from "@modules/entitlements/di";

export function usePlatformStripeViewModel() {
  const { platformStripeService } = entitlementsContainer;

  const {
    data: dashboard,
    isLoading,
    error,
    refetch,
  } = useQuery<PlatformStripeDashboardModel>({
    queryKey: ["platform-stripe", "dashboard"],
    queryFn: () => platformStripeService.getDashboard(),
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
