"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@core/hooks/use-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import type { SubscriptionModel, EditionThinModel, SubscriptionType } from "../../data/models/TenantSubscription";

// ── Result Interface ──

export interface UseTenantSubscriptionViewModelResult {
      // Data
      subscription: SubscriptionModel | undefined;
      subscriptionHistory: SubscriptionModel[];
      isLoading: boolean;
      error: Error | null;
      availableEditions: EditionThinModel[];
      isEditionsLoading: boolean;

      // Computed
      isTrialing: boolean;
      isSuspended: boolean;
      isExpired: boolean;
      isCanceled: boolean;
      isActive: boolean;
      daysRemaining: number | null;
      canRenew: boolean;
      canConvertTrial: boolean;
      canSuspend: boolean;
      canResume: boolean;
      canCancel: boolean;

      // Mutations
      changeEdition: (editionId: string, type: SubscriptionType) => void;
      isChanging: boolean;

      renewSubscription: (type: SubscriptionType) => void;
      isRenewing: boolean;

      convertTrial: (type: SubscriptionType) => void;
      isConverting: boolean;

      suspendSubscription: (reason: string) => void;
      isSuspending: boolean;

      resumeSubscription: () => void;
      isResuming: boolean;

      cancelSubscription: (reason?: string) => void;
      isCanceling: boolean;

      resyncPermissions: () => void;
      isResyncing: boolean;
}

// ── ViewModel ──

export function useTenantSubscriptionViewModel(tenantId: string): UseTenantSubscriptionViewModelResult {
      const { t } = useI18n();
      const { toast } = useToast();
      const queryClient = useQueryClient();

      const queryKey = ["tenant-subscriptions", tenantId];

      // ── Queries ──

      const {
            data: subscriptionHistory,
            isLoading,
            error,
      } = useQuery({
            queryKey,
            queryFn: () => systemContainer.tenantRepository.getTenantSubscriptions(tenantId),
            enabled: !!tenantId,
      });

      // Current active subscription (first active/trialing, or most recent)
      const subscription = subscriptionHistory
            ? subscriptionHistory.find(
                  (s) => s.status.toLowerCase() === "active" || s.status.toLowerCase() === "trialing"
            ) ?? subscriptionHistory[0]
            : undefined;

      const { data: availableEditionsData, isLoading: isEditionsLoading } = useQuery({
            queryKey: ["editions", "available"],
            queryFn: () => systemContainer.tenantRepository.getAvailableEditions(),
      });

      // ── Computed ──

      const status = subscription?.status?.toLowerCase() ?? "";
      const isTrialing = status === "trialing";
      const isSuspended = status === "suspended";
      const isExpired = status === "expired";
      const isCanceled = status === "canceled";
      const isActive = status === "active" || isTrialing;

      const daysRemaining = (() => {
            if (!subscription?.endDate) return null;
            const end = new Date(subscription.endDate);
            const now = new Date();
            const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diff;
      })();

      const canRenew = isActive && !isTrialing && subscription?.type !== "Lifetime";
      const canConvertTrial = isTrialing;
      const canSuspend = isActive;
      const canResume = isSuspended;
      const canCancel = isActive || isSuspended;

      // ── Helper: invalidate + toast ──

      const invalidateAll = () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
            queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      };

      const successToast = (desc: string) => {
            toast({ title: t("common.success") || "Success", description: desc });
      };

      const errorToast = (err: Error) => {
            toast({
                  title: t("common.error") || "Error",
                  description: err.message || "Operation failed",
                  variant: "destructive",
            });
      };

      // ── Mutations ──

      const changeMutation = useMutation({
            mutationFn: async ({ editionId, type }: { editionId: string; type: string }) => {
                  await systemContainer.tenantRepository.changeEdition(tenantId, editionId, type);
            },
            onSuccess: () => { successToast(t("tenant.subscriptionUpdated") || "Plan changed successfully"); invalidateAll(); },
            onError: errorToast,
      });

      const renewMutation = useMutation({
            mutationFn: async (type: string) => {
                  await systemContainer.tenantRepository.renewSubscription(tenantId, type);
            },
            onSuccess: () => { successToast(t("tenant.subscriptionRenewed") || "Subscription renewed successfully"); invalidateAll(); },
            onError: errorToast,
      });

      const convertMutation = useMutation({
            mutationFn: async (type: string) => {
                  await systemContainer.tenantRepository.convertTrial(tenantId, type);
            },
            onSuccess: () => { successToast(t("tenant.trialConverted") || "Trial converted to paid plan"); invalidateAll(); },
            onError: errorToast,
      });

      const suspendMutation = useMutation({
            mutationFn: async (reason: string) => {
                  await systemContainer.tenantRepository.suspendSubscription(tenantId, reason);
            },
            onSuccess: () => { successToast(t("tenant.subscriptionSuspended") || "Subscription suspended"); invalidateAll(); },
            onError: errorToast,
      });

      const resumeMutation = useMutation({
            mutationFn: async () => {
                  await systemContainer.tenantRepository.resumeSubscription(tenantId);
            },
            onSuccess: () => { successToast(t("tenant.subscriptionResumed") || "Subscription resumed"); invalidateAll(); },
            onError: errorToast,
      });

      const cancelMutation = useMutation({
            mutationFn: async (reason?: string) => {
                  await systemContainer.tenantRepository.cancelSubscription(tenantId, reason);
            },
            onSuccess: () => { successToast(t("tenant.subscriptionCanceled") || "Subscription canceled"); invalidateAll(); },
            onError: errorToast,
      });

      const resyncMutation = useMutation({
            mutationFn: async () => {
                  await systemContainer.tenantRepository.resyncPermissions(tenantId);
            },
            onSuccess: () => { successToast(t("tenant.permissionsResynced") || "Permissions re-synced from edition"); invalidateAll(); },
            onError: errorToast,
      });

      // ── Return ──

      return {
            subscription,
            subscriptionHistory: subscriptionHistory ?? [],
            isLoading,
            error: error as Error | null,
            availableEditions: availableEditionsData?.items ?? [],
            isEditionsLoading,

            isTrialing, isSuspended, isExpired, isCanceled, isActive,
            daysRemaining,
            canRenew, canConvertTrial, canSuspend, canResume, canCancel,

            changeEdition: (editionId, type) => changeMutation.mutate({ editionId, type }),
            isChanging: changeMutation.isPending,

            renewSubscription: renewMutation.mutate,
            isRenewing: renewMutation.isPending,

            convertTrial: convertMutation.mutate,
            isConverting: convertMutation.isPending,

            suspendSubscription: suspendMutation.mutate,
            isSuspending: suspendMutation.isPending,

            resumeSubscription: () => resumeMutation.mutate(),
            isResuming: resumeMutation.isPending,

            cancelSubscription: cancelMutation.mutate,
            isCanceling: cancelMutation.isPending,

            resyncPermissions: () => resyncMutation.mutate(),
            isResyncing: resyncMutation.isPending,
      };
}
