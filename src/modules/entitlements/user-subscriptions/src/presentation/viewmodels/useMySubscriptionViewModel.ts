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
