/**
 * useUserFeature — Frontend hook for user-level feature gating (Tier 2).
 *
 * Fetches the current user's active subscription features from the /me endpoint
 * and provides utilities to check feature access and quota limits.
 *
 * Usage:
 *   const hasAccess = useUserFeature("api_access");
 *   const projectLimit = useUserFeatureValue("max_projects");
 *
 * Stripe-ready: When Stripe Connect (Phase 10) is wired, this hook's data
 * will be populated from Stripe subscription metadata via the same /me endpoint.
 *
 * Architecture Note:
 * - Fetches from /me endpoint (UserSubscriptionsController)
 * - Uses TanStack Query with long stale time (features don't change frequently)
 * - Does NOT import IApiService — goes through the DI container
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";

interface UserFeatureMap {
  [featureKey: string]: {
    value: string;
    valueType: string;
    displayNameEn?: string;
    displayNameAr?: string;
  };
}

interface UseUserFeatureResult {
  /** Whether the feature is enabled (for Boolean features) */
  hasFeature: (key: string) => boolean;
  /** Get the raw value of a feature */
  getFeatureValue: (key: string) => string | undefined;
  /** Get the numeric value of a feature (-1 = unlimited, 0 = disabled) */
  getFeatureLimit: (key: string) => number;
  /** Whether the subscription data is still loading */
  isLoading: boolean;
  /** The complete feature map */
  features: UserFeatureMap;
  /** Whether the user has any active subscription */
  hasSubscription: boolean;
  /** Current plan name (for display) */
  planName: string | undefined;
}

/**
 * Hook to check user-level features from their active subscription.
 * Call at the top level of components that need feature gating.
 */
export function useUserFeatures(): UseUserFeatureResult {
  const { userSubscriptionRepository } = entitlementsContainer;

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["user-subscription", "me"],
    queryFn: () => userSubscriptionRepository.getMySubscription(),
    staleTime: 5 * 60 * 1000, // 5 minutes — features rarely change mid-session
    retry: 1,
  });

  // Build feature map from subscription response
  const features: UserFeatureMap = {};
  if (subscription?.features) {
    for (const f of subscription.features) {
      features[f.featureKey] = {
        value: f.value,
        valueType: f.valueType,
        displayNameEn: f.displayNameEn,
        displayNameAr: f.displayNameAr,
      };
    }
  }

  const hasFeature = (key: string): boolean => {
    const feat = features[key];
    if (!feat) return false;
    if (feat.valueType === "Boolean") return feat.value === "true";
    if (feat.valueType === "Numeric")
      return parseInt(feat.value) > 0 || parseInt(feat.value) === -1;
    return feat.value !== "";
  };

  const getFeatureValue = (key: string): string | undefined => {
    return features[key]?.value;
  };

  const getFeatureLimit = (key: string): number => {
    const feat = features[key];
    if (!feat) return 0;
    const num = parseInt(feat.value);
    return isNaN(num) ? 0 : num;
  };

  return {
    hasFeature,
    getFeatureValue,
    getFeatureLimit,
    isLoading,
    features,
    hasSubscription: !!subscription,
    planName: subscription?.planName,
  };
}

/**
 * Convenience hook: check a single Boolean feature.
 *
 * Usage: const canAccess = useUserFeature("api_access");
 */
export function useUserFeature(key: string): boolean {
  const { hasFeature } = useUserFeatures();
  return hasFeature(key);
}

/**
 * Convenience hook: get a single feature's value.
 *
 * Usage: const limit = useUserFeatureValue("max_projects"); // "10"
 */
export function useUserFeatureValue(key: string): string | undefined {
  const { getFeatureValue } = useUserFeatures();
  return getFeatureValue(key);
}
