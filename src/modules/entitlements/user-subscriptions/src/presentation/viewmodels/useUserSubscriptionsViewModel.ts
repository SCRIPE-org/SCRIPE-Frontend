/**
 * UserSubscriptions ViewModel
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import type { CreateUserSubscriptionRequest } from "../../domain/entities/UserSubscriptionRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";

export function useUserSubscriptionsViewModel() {
  const { success, error } = useEnhancedToast();
  const { userSubscriptionRepository } = entitlementsContainer;
  const { t } = useI18n();
  const tenantId = useAppStore((s) => s.user?.tenantId) ?? "";
  const queryClient = useQueryClient();
  const queryKey = ["entitlements", "user-subscriptions", tenantId];

  const vm = useCrudViewModel<UserSubscription, CreateUserSubscriptionRequest, never>(
    queryKey,
    {
      getAll: async (params) => {
        const res = await userSubscriptionRepository.getAll(tenantId, {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        });
        return {
          items: res.items || [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: res.totalPages,
          },
        };
      },
      create: async (data) => {
        const id = await userSubscriptionRepository.create(tenantId, data);
        success({
          title: t("entitlements.userSubscriptions.assigned"),
          description: t("entitlements.userSubscriptions.assignedDesc"),
        });
        return { id } as unknown as UserSubscription;
      },
    }
  );

  // ── Cancel Mutation ──
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await userSubscriptionRepository.cancel(id, tenantId);
    },
    onSuccess: () => {
      success({
        title: t("entitlements.userSubscriptions.cancelled"),
        description: t("entitlements.userSubscriptions.cancelledDesc"),
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.userSubscriptions.cancelFailed"),
      });
    },
  });

  // ── Renew Mutation ──
  const renewMutation = useMutation({
    mutationFn: async (id: string) => {
      await userSubscriptionRepository.renew(id, tenantId);
    },
    onSuccess: () => {
      success({
        title: t("entitlements.userSubscriptions.renewed"),
        description: t("entitlements.userSubscriptions.renewedDesc"),
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.userSubscriptions.renewFailed"),
      });
    },
  });

  return {
    ...vm,
    tenantId,
    hasTenantContext: !!tenantId,
    cancelSubscription: (id: string) => cancelMutation.mutate(id),
    renewSubscription: (id: string) => renewMutation.mutate(id),
    isCancelling: cancelMutation.isPending,
    isRenewing: renewMutation.isPending,
  };
}
