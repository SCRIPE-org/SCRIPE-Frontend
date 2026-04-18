/**
 * useMySubscriptionViewModel — User self-service subscription viewmodel.
 *
 * Fetches the current user's active subscription via /me endpoint,
 * provides cancel action and resolved feature list.
 *
 * Stripe-ready: When Stripe Connect is wired (Phase 10), this hook
 * will also expose the Stripe customer portal link.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function useMySubscriptionViewModel() {
  const { userSubscriptionRepository } = entitlementsContainer;
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const queryKey = ["user-subscription", "me"];

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => userSubscriptionRepository.getMySubscription(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // ── Cancel Subscription ──
  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!subscription) throw new Error("No active subscription");
      return userSubscriptionRepository.cancel(subscription.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({
        title: t("entitlements.mySubscription.cancelled") || "Subscription Cancelled",
        description: t("entitlements.mySubscription.cancelledDesc") || "Your subscription has been cancelled.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.mySubscription.cancelFailed") || "Failed to cancel subscription.",
      });
    },
  });

  return {
    subscription,
    isLoading,
    error,
    refetch,
    cancelSubscription: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    hasSubscription: !!subscription,
  };
}
