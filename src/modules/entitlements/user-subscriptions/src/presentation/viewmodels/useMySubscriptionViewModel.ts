/**
 * useMySubscriptionViewModel — Tenant admin self-service subscription viewmodel.
 *
 * Fetches the current tenant's ACTIVE subscription (Tier 1 — TenantSubscription)
 * via the /subscriptions/my-tenant endpoint. This uses the JWT tenant context,
 * so it works correctly for both direct tenant admins and impersonated sessions.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";

/**
 * React hook/ViewModel orchestrating state and data flows for my subscription view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useMySubscriptionViewModel() {
  const { subscriptionRepository } = entitlementsContainer;

  const queryKey = ["tenant-subscription", "my-tenant"];

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => subscriptionRepository.getMyTenantSubscription(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    subscription: subscription ?? null,
    isLoading,
    error,
    refetch,
    hasSubscription: !!subscription,
  };
}
