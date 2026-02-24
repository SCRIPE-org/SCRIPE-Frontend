"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@core/hooks/use-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import type { SubscriptionModel, EditionThinModel } from "../../data/models/TenantSubscription";

export interface UseTenantSubscriptionViewModelResult {
      subscription: SubscriptionModel | undefined;
      isLoading: boolean;
      error: Error | null;

      availableEditions: EditionThinModel[];
      isEditionsLoading: boolean;

      changeEdition: (editionId: string) => void;
      isChanging: boolean;
}

export function useTenantSubscriptionViewModel(tenantId: string): UseTenantSubscriptionViewModelResult {
      const { t } = useI18n();
      const { toast } = useToast();
      const queryClient = useQueryClient();

      // Fetch current subscription
      const {
            data: subscription,
            isLoading,
            error,
      } = useQuery({
            queryKey: ["tenant-subscriptions", tenantId],
            queryFn: async () => {
                  // Get the highest precedence active subscription or just the first active one
                  const subs = await systemContainer.tenantRepository.getTenantSubscriptions(tenantId);
                  const activeSubs = subs.filter((s) => s.status === "active");
                  return activeSubs.length > 0 ? activeSubs[0] : subs[0]; // fallback to first if none active
            },
            enabled: !!tenantId,
      });

      // Fetch available editions for the dropdown
      const { data: availableEditionsData, isLoading: isEditionsLoading } = useQuery({
            queryKey: ["editions", "available"],
            queryFn: () => systemContainer.tenantRepository.getAvailableEditions(),
      });

      // Change Subscription mutation
      const changeMutation = useMutation({
            mutationFn: async (editionId: string) => {
                  await systemContainer.tenantRepository.changeEdition(tenantId, editionId);
            },
            onSuccess: () => {
                  toast({
                        title: t("common.success") || "Success",
                        description: t("tenant.subscriptionUpdated") || "Subscription plan changed successfully",
                  });
                  queryClient.invalidateQueries({ queryKey: ["tenant-subscriptions", tenantId] });
                  queryClient.invalidateQueries({ queryKey: ["tenants"] });
            },
            onError: (err: Error) => {
                  toast({
                        title: t("common.error") || "Error",
                        description: err.message || "Failed to change subscription",
                        variant: "destructive",
                  });
            },
      });

      return {
            subscription,
            isLoading,
            error: error as Error | null,
            availableEditions: availableEditionsData?.items ?? [],
            isEditionsLoading,
            changeEdition: changeMutation.mutate,
            isChanging: changeMutation.isPending,
      };
}
