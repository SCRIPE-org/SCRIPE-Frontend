/**
 * UserSubscriptions ViewModel
 * TenantId is resolved server-side from JWT context.
 *
 * GAP-3 fix: adds availableUsers (server-search) and availablePlans (static list)
 * to drive the Create form's searchable selectors instead of raw text inputs.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import type {
  CreateUserSubscriptionRequest,
  ChangePlanRequest,
} from "../../domain/entities/UserSubscriptionRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { FieldOption } from "@core/ui/forms/generic-form";

/**
 * React hook/ViewModel orchestrating state and data flows for user subscriptions view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useUserSubscriptionsViewModel() {
  const { success, error } = useEnhancedToast();
  const { userSubscriptionRepository, tenantPlanRepository } = entitlementsContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const queryKey = ["entitlements", "user-subscriptions"];

  const vm = useCrudViewModel<UserSubscription, CreateUserSubscriptionRequest, ChangePlanRequest>(
    queryKey,
    {
      getAll: async (params) => {
        const res = await userSubscriptionRepository.getAll({
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
        const id = await userSubscriptionRepository.create(data);
        success({
          title: t("entitlements.userSubscriptions.assigned"),
          description: t("entitlements.userSubscriptions.assignedDesc"),
        });
        return { id } as unknown as UserSubscription;
      },
      update: async (id, data) => {
        await userSubscriptionRepository.changePlan(id, {
          newTenantPlanId: data.newTenantPlanId,
          billingCycle: data.billingCycle,
          reason: data.reason,
        });
        success({
          title: t("entitlements.userSubscriptions.planChanged"),
          description: t("entitlements.userSubscriptions.planChangedDesc"),
        });
        return userSubscriptionRepository.getById(id);
      },
    }
  );

  // ── Available Plans (static list for the Create form plan selector) ──────────
  // Plans are a relatively small set (rarely > 20 per tenant) — fetch all upfront.
  const { data: plansData } = useQuery({
    queryKey: ["entitlements", "tenant-plans", "options"],
    queryFn: () => tenantPlanRepository.getAll({ page: 1, pageSize: 100 }),
    staleTime: 5 * 60 * 1000, // 5-minute cache — plans don't change often
  });

  const availablePlans: FieldOption[] = (plansData?.items ?? [])
    .filter((p) => p.isActive)
    .map((p) => ({
      value: p.id,
      label: `${p.name} (${p.supportedCycles.join(", ") || "No cycles"} · ${p.formattedStartingPrice})`,
    }));

  // ── Server-Search for Users (debounced combobox in Create form) ──────────────
  // Queries the Users endpoint with a search term; returns FieldOption[] for the
  // generic-form "server-select" field type.
  const searchUsers = async (query: string): Promise<FieldOption[]> => {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await userSubscriptionRepository.searchUsers(query);
      return (res ?? []).map((u) => ({
        value: u.id, // encrypted user ID — sent as-is to backend
        label: `${u.name} (${u.email})`,
      }));
    } catch {
      return [];
    }
  };

  // ── Cancel Mutation ──────────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await userSubscriptionRepository.cancel(id);
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

  // ── Renew Mutation ───────────────────────────────────────────────────────────
  const renewMutation = useMutation({
    mutationFn: async (id: string) => {
      await userSubscriptionRepository.renew(id);
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

  // ── GetById (full detail fetch for custom view modal) ──
  const getById = async (id: string): Promise<UserSubscription | null> => {
    try {
      return await userSubscriptionRepository.getById(id);
    } catch {
      return null;
    }
  };

  return {
    ...vm,
    availablePlans,
    searchUsers,
    getById,
    cancelSubscription: (id: string) => cancelMutation.mutate(id),
    renewSubscription: (id: string) => renewMutation.mutate(id),
    isCancelling: cancelMutation.isPending,
    isRenewing: renewMutation.isPending,
  };
}
