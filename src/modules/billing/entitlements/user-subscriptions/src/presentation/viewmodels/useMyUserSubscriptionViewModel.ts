/**
 * useMyUserSubscriptionViewModel — end-user self-service viewmodel for the
 * caller's own UserSubscription record (distinct from the tenant-level
 * TenantSubscription behind useMySubscriptionViewModel).
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

const QUERY_KEY = ["user-subscriptions", "me"];

export function useMyUserSubscriptionViewModel() {
  const { userSubscriptionRepository } = entitlementsContainer;
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => userSubscriptionRepository.getMySubscription(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const cancelMutation = useMutation({
    mutationFn: () => userSubscriptionRepository.cancelMine(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({
        title: t("entitlements.mySubscription.cancelled"),
        description: t("entitlements.mySubscription.cancelledDesc"),
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error"), description: err.message });
    },
  });

  return {
    subscription,
    isLoading,
    error,
    refetch,
    hasSubscription: !!subscription,
    cancel: () => cancelMutation.mutate(),
    isCancelling: cancelMutation.isPending,
  };
}
