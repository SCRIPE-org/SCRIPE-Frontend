"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@/modules/identity/di";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { SubscriptionModel, EditionThinModel, SubscriptionType, ExpiryBehavior, DowngradeImpactReport } from "../../domain/types/SubscriptionTypes";
import { appLogger } from "@/core/common/logger";

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
      isPastDue: boolean;
      isActive: boolean;
      isDowngraded: boolean;
      downgradedFromEditionName: string | null;
      downgradedFromType: string | null;
      downgradedAt: string | null;
      daysRemaining: number | null;
      canRenew: boolean;
      canConvertTrial: boolean;
      canSuspend: boolean;
      canResume: boolean;
      canCancel: boolean;
      canReassign: boolean;
      fallbackEditionName: string | null;
      expiryBehavior: ExpiryBehavior | null;
      hasFallback: boolean;

      // Mutations
      changeEdition: (editionId: string, type: SubscriptionType, currency?: string, promoCode?: string, promotionId?: string) => void;
      isChanging: boolean;

      renewSubscription: (type: SubscriptionType) => void;
      isRenewing: boolean;

      convertTrial: (type: SubscriptionType) => void;
      isConverting: boolean;

      suspendSubscription: (reason: string, useFallback?: boolean, refundType?: string, customRefundAmount?: number) => void;
      isSuspending: boolean;

      resumeSubscription: (type?: SubscriptionType) => void;
      isResuming: boolean;

      cancelSubscription: (reason?: string, useFallback?: boolean, refundType?: string, customRefundAmount?: number) => void;
      isCanceling: boolean;

      resyncPermissions: () => void;
      isResyncing: boolean;

      changeCurrency: (currency: string) => void;
      isChangingCurrency: boolean;

      getDowngradeImpact: (targetEditionId: string) => Promise<DowngradeImpactReport>;
      previewPrice: (editionId: string, currency: string, type: string) => Promise<number>;

      // Receipt
      downloadReceipt: () => void;
      isDownloadingReceipt: boolean;
}

// ── ViewModel ──

export function useTenantSubscriptionViewModel(tenantId: string): UseTenantSubscriptionViewModelResult {
      const { t } = useI18n();
      const { success, error: enhancedErrorToast } = useEnhancedToast();
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
      const isPastDue = status === "pastdue";
      const isActive = status === "active" || isTrialing;

      const daysRemaining = (() => {
            if (!subscription?.endDate) return null;
            const end = new Date(subscription.endDate);
            const now = new Date();
            const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diff;
      })();

      // ── Computed: action availability per status ──
      const isDowngraded = (subscription?.isDowngraded ?? false) && isActive;
      const downgradedFromEditionName = subscription?.downgradedFromEditionName ?? null;
      const downgradedFromType = subscription?.downgradedFromType ?? null;
      const downgradedAt = subscription?.downgradedAt ?? null;

      const canRenew = (isActive || isPastDue) && !isTrialing && subscription?.type !== "Lifetime" && !isDowngraded;
      const canConvertTrial = isTrialing;
      const canSuspend = (isActive && !isTrialing) || isPastDue; // FE5: exclude Trialing (backend rejects)
      const canResume = isSuspended || isDowngraded;
      const canCancel = isActive || isSuspended || isPastDue;
      const canReassign = isCanceled || isExpired; // Show Assign button for terminated subscriptions

      // ── Computed: fallback plan info ──
      const fallbackEditionName = subscription?.fallbackEditionName ?? null;
      const expiryBehavior: ExpiryBehavior | null = subscription?.expiryBehavior ?? null;
      const hasFallback = !!fallbackEditionName;

      // ── Helper: invalidate + toast ──

      const invalidateAll = () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
            queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      };

      const successToast = (desc: string) => {
            success({ title: t("common.success") || "Success", description: desc });
      };

      const errorToast = (err: Error) => {
            enhancedErrorToast({
                  title: t("common.error") || "Error",
                  description: err.message || "Operation failed",
            });
      };

      // ── Mutations ──

      const changeMutation = useMutation({
            mutationFn: async ({ editionId, type, currency, promoCode, promotionId }: { editionId: string; type: string; currency?: string; promoCode?: string; promotionId?: string }) => {
                  await systemContainer.tenantRepository.changeEdition(tenantId, editionId, type, currency, promoCode, promotionId);
            },
            onSuccess: () => { successToast(t("tenant.subscriptionUpdated") || "Plan changed successfully"); invalidateAll(); },
            onError: errorToast,
      });

      const renewMutation = useMutation({
            mutationFn: async (type: string) => {
                  return await systemContainer.tenantRepository.renewSubscription(tenantId, type);
            },
            onSuccess: (msg) => {
                  appLogger.debug("renewMutation.onSuccess fired! msg:", msg);
                  successToast(msg || t("tenant.subscriptionRenewed") || "Subscription renewed successfully");
                  invalidateAll();
            },
            onError: errorToast,
      });

      const convertMutation = useMutation({
            mutationFn: async (type: string) => {
                  return await systemContainer.tenantRepository.convertTrial(tenantId, type);
            },
            onSuccess: (msg) => { successToast(msg || t("tenant.trialConverted") || "Trial converted to paid plan"); invalidateAll(); },
            onError: errorToast,
      });

      const suspendMutation = useMutation({
            mutationFn: async ({ reason, useFallback, refundType, customRefundAmount }: { reason: string; useFallback?: boolean; refundType?: string; customRefundAmount?: number }) => {
                  return await systemContainer.tenantRepository.suspendSubscription(tenantId, reason, useFallback, refundType, customRefundAmount);
            },
            onSuccess: (msg) => { successToast(msg || t("tenant.subscriptionSuspended") || "Subscription suspended"); invalidateAll(); },
            onError: errorToast,
      });

      const resumeMutation = useMutation({
            mutationFn: async (type?: string) => {
                  return await systemContainer.tenantRepository.resumeSubscription(tenantId, type);
            },
            onSuccess: (msg) => { successToast(msg || t("tenant.subscriptionResumed") || "Subscription resumed"); invalidateAll(); },
            onError: errorToast,
      });

      const cancelMutation = useMutation({
            mutationFn: async ({ reason, useFallback, refundType, customRefundAmount }: { reason?: string; useFallback?: boolean; refundType?: string; customRefundAmount?: number }) => {
                  return await systemContainer.tenantRepository.cancelSubscription(tenantId, reason, useFallback, refundType, customRefundAmount);
            },
            onSuccess: (msg) => { successToast(msg || t("tenant.subscriptionCanceled") || "Subscription canceled"); invalidateAll(); },
            onError: errorToast,
      });

      const resyncMutation = useMutation({
            mutationFn: async () => {
                  await systemContainer.tenantRepository.resyncPermissions(tenantId);
            },
            onSuccess: () => { successToast(t("tenant.permissionsResynced") || "Permissions re-synced from edition"); invalidateAll(); },
            onError: errorToast,
      });

      const changeCurrencyMutation = useMutation({
            mutationFn: async (currency: string) => {
                  return await systemContainer.tenantRepository.changeCurrency(tenantId, currency);
            },
            onSuccess: (msg) => { successToast(msg || t("tenant.currencyChanged") || "Billing currency changed"); invalidateAll(); },
            onError: errorToast,
      });

      const receiptMutation = useMutation({
            mutationFn: async () => {
                  const { blob, filename } = await entitlementsContainer.subscriptionRepository.downloadReceipt(tenantId);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
            },
            onSuccess: () => { successToast(t("tenant.receiptDownloaded") || "Receipt downloaded successfully"); },
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

            isTrialing, isSuspended, isExpired, isCanceled, isPastDue, isActive,
            isDowngraded, downgradedFromEditionName, downgradedFromType, downgradedAt,
            daysRemaining,
            canRenew, canConvertTrial, canSuspend, canResume, canCancel, canReassign,
            fallbackEditionName, expiryBehavior, hasFallback,

            changeEdition: (editionId: string, type: SubscriptionType, currency?: string, promoCode?: string, promotionId?: string) => changeMutation.mutate({ editionId, type, currency, promoCode, promotionId }),
            isChanging: changeMutation.isPending,

            renewSubscription: renewMutation.mutate,
            isRenewing: renewMutation.isPending,

            convertTrial: convertMutation.mutate,
            isConverting: convertMutation.isPending,

            suspendSubscription: (reason: string, useFallback?: boolean, refundType?: string, customRefundAmount?: number) => suspendMutation.mutate({ reason, useFallback, refundType, customRefundAmount }),
            isSuspending: suspendMutation.isPending,

            resumeSubscription: (type?: SubscriptionType) => resumeMutation.mutate(type),
            isResuming: resumeMutation.isPending,

            cancelSubscription: (reason?: string, useFallback?: boolean, refundType?: string, customRefundAmount?: number) => cancelMutation.mutate({ reason, useFallback, refundType, customRefundAmount }),
            isCanceling: cancelMutation.isPending,

            resyncPermissions: () => resyncMutation.mutate(),
            isResyncing: resyncMutation.isPending,

            changeCurrency: changeCurrencyMutation.mutate,
            isChangingCurrency: changeCurrencyMutation.isPending,

            getDowngradeImpact: (targetEditionId: string) =>
                  systemContainer.tenantRepository.getDowngradeImpact(tenantId, targetEditionId),
            previewPrice: (editionId: string, currency: string, type: string) =>
                  systemContainer.tenantRepository.previewPrice(editionId, currency, type),

            downloadReceipt: () => receiptMutation.mutate(),
            isDownloadingReceipt: receiptMutation.isPending,
      };
}
