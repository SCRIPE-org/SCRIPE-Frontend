/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE-EXCEPTION: file length
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";
import { downloadSubscriptionReceipt } from "@core/services/module-bridges";
import type {
  SubscriptionModel,
  EditionThinModel,
  SubscriptionType,
  ExpiryBehavior,
  DowngradeImpactReport,
} from "../../domain/types/SubscriptionTypes";
import { appLogger } from "@/core/common/logger";

// ── Result Interface ──

/**
 * Interface defining property specifications, keys types, and structural contract rules for use tenant subscription view model result.
 */
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
  isPendingPayment: boolean;
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
  hasNoSubscription: boolean;

  // Mutations
  assignEdition: (
    editionId: string,
    type: SubscriptionType,
    currency?: string,
    promoCode?: string,
    promotionId?: string
  ) => void;
  isAssigning: boolean;

  changeEdition: (
    editionId: string,
    type: SubscriptionType,
    currency?: string,
    promoCode?: string,
    promotionId?: string
  ) => void;
  isChanging: boolean;

  renewSubscription: (type: SubscriptionType) => void;
  isRenewing: boolean;

  convertTrial: (type: SubscriptionType) => void;
  isConverting: boolean;

  suspendSubscription: (
    reason: string,
    useFallback?: boolean,
    refundType?: string,
    customRefundAmount?: number
  ) => void;
  isSuspending: boolean;

  resumeSubscription: (type?: SubscriptionType) => void;
  isResuming: boolean;

  cancelSubscription: (
    reason?: string,
    useFallback?: boolean,
    refundType?: string,
    customRefundAmount?: number
  ) => void;
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

  // Change Plan Promotions
  changePlanPromotionsRaw: any[];
  isLoadingChangePlanPromos: boolean;
}

// ── ViewModel ──

/**
 * React hook/ViewModel orchestrating state and data flows for tenant subscription view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantSubscriptionViewModel(
  tenantId: string,
  selectedEditionId?: string,
  changePlanOpen?: boolean
): UseTenantSubscriptionViewModelResult {
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
    queryFn: () => identityContainer.tenantRepository.getTenantSubscriptions(tenantId),
    enabled: !!tenantId,
  });

  // H-1 FIX: Current subscription (first active/trialing/pendingpayment, or most recent)
  const subscription = subscriptionHistory
    ? (subscriptionHistory.find((s) =>
        ["active", "trialing", "pendingpayment"].includes(s.status.toLowerCase())
      ) ?? subscriptionHistory[0])
    : undefined;

  const { data: availableEditionsData, isLoading: isEditionsLoading } = useQuery({
    queryKey: ["editions", "available"],
    queryFn: () => identityContainer.tenantRepository.getAvailableEditions(),
  });

  const { data: changePlanPromotionsRaw = [], isLoading: isLoadingChangePlanPromos } = useQuery({
    queryKey: ["entitlements", "editions", selectedEditionId, "promotions", "changePlan"],
    queryFn: () => identityContainer.tenantRepository.getEditionPromotions(selectedEditionId!),
    enabled: !!selectedEditionId && !!changePlanOpen,
  });

  // ── Computed ──

  const status = subscription?.status?.toLowerCase() ?? "";
  const isTrialing = status === "trialing";
  const isSuspended = status === "suspended";
  const isExpired = status === "expired";
  const isCanceled = status === "canceled";
  const isPastDue = status === "pastdue";
  const isPendingPayment = status === "pendingpayment";
  const isActive = (status === "active" || isTrialing) && !isPendingPayment;
  const hasNoSubscription = !subscription;

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

  // H-5 FIX: Gate all action flags behind !isPendingPayment
  const canRenew =
    !isPendingPayment &&
    (isActive || isPastDue) &&
    !isTrialing &&
    subscription?.type !== "Lifetime" &&
    subscription?.type !== "Free" &&
    !isDowngraded;
  const canConvertTrial = !isPendingPayment && isTrialing;
  const canSuspend = !isPendingPayment && ((isActive && !isTrialing) || isPastDue);
  const canResume = !isPendingPayment && (isSuspended || isDowngraded);
  const canCancel = isPendingPayment || isActive || isSuspended || isPastDue; // Allow canceling PendingPayment
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
    success({ title: t("common.success"), description: desc });
  };

  const errorToast = (err: Error) => {
    enhancedErrorToast({
      title: t("common.error"),
      description: err.message || "Operation failed",
    });
  };

  // ── Mutations ──

  // C-4 FIX: Separate assign mutation (POST) for new subscriptions
  const assignMutation = useMutation({
    mutationFn: async ({
      editionId,
      type,
      currency,
      promoCode,
      promotionId,
    }: {
      editionId: string;
      type: string;
      currency?: string;
      promoCode?: string;
      promotionId?: string;
    }) => {
      await identityContainer.tenantRepository.assignEdition(
        tenantId,
        editionId,
        type,
        undefined,
        currency,
        promoCode,
        promotionId
      );
    },
    onSuccess: () => {
      successToast(t("tenant.subscriptionAssigned"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const changeMutation = useMutation({
    mutationFn: async ({
      editionId,
      type,
      currency,
      promoCode,
      promotionId,
    }: {
      editionId: string;
      type: string;
      currency?: string;
      promoCode?: string;
      promotionId?: string;
    }) => {
      await identityContainer.tenantRepository.changeEdition(
        tenantId,
        editionId,
        type,
        currency,
        promoCode,
        promotionId
      );
    },
    onSuccess: () => {
      successToast(t("tenant.subscriptionUpdated"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const renewMutation = useMutation({
    mutationFn: async (type: string) => {
      return await identityContainer.tenantRepository.renewSubscription(tenantId, type);
    },
    onSuccess: (msg) => {
      appLogger.debug("renewMutation.onSuccess fired! msg:", msg);
      successToast(msg || t("tenant.subscriptionRenewed"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const convertMutation = useMutation({
    mutationFn: async (type: string) => {
      return await identityContainer.tenantRepository.convertTrial(tenantId, type);
    },
    onSuccess: (msg) => {
      successToast(msg || t("tenant.trialConverted"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const suspendMutation = useMutation({
    mutationFn: async ({
      reason,
      useFallback,
      refundType,
      customRefundAmount,
    }: {
      reason: string;
      useFallback?: boolean;
      refundType?: string;
      customRefundAmount?: number;
    }) => {
      return await identityContainer.tenantRepository.suspendSubscription(
        tenantId,
        reason,
        useFallback,
        refundType,
        customRefundAmount
      );
    },
    onSuccess: (msg) => {
      successToast(msg || t("tenant.subscriptionSuspended"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const resumeMutation = useMutation({
    mutationFn: async (type?: string) => {
      return await identityContainer.tenantRepository.resumeSubscription(tenantId, type);
    },
    onSuccess: (msg) => {
      successToast(msg || t("tenant.subscriptionResumed"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({
      reason,
      useFallback,
      refundType,
      customRefundAmount,
    }: {
      reason?: string;
      useFallback?: boolean;
      refundType?: string;
      customRefundAmount?: number;
    }) => {
      return await identityContainer.tenantRepository.cancelSubscription(
        tenantId,
        reason,
        useFallback,
        refundType,
        customRefundAmount
      );
    },
    onSuccess: (msg) => {
      successToast(msg || t("tenant.subscriptionCanceled"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const resyncMutation = useMutation({
    mutationFn: async () => {
      await identityContainer.tenantRepository.resyncPermissions(tenantId);
    },
    onSuccess: () => {
      successToast(t("tenant.permissionsResynced"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const changeCurrencyMutation = useMutation({
    mutationFn: async (currency: string) => {
      return await identityContainer.tenantRepository.changeCurrency(tenantId, currency);
    },
    onSuccess: (msg) => {
      successToast(msg || t("tenant.currencyChanged"));
      invalidateAll();
    },
    onError: errorToast,
  });

  const receiptMutation = useMutation({
    mutationFn: async () => {
      // Resolved through the core bridge. The old registry lookup depended on the
      // `@modules/entitlements` barrel having been imported, which no route does, so this
      // mutation always threw "Download receipt service not available".
      const { blob, filename } = await downloadSubscriptionReceipt(tenantId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      successToast(t("tenant.receiptDownloaded"));
    },
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

    isTrialing,
    isSuspended,
    isExpired,
    isCanceled,
    isPastDue,
    isPendingPayment,
    isActive,
    isDowngraded,
    downgradedFromEditionName,
    downgradedFromType,
    downgradedAt,
    daysRemaining,
    canRenew,
    canConvertTrial,
    canSuspend,
    canResume,
    canCancel,
    canReassign,
    fallbackEditionName,
    expiryBehavior,
    hasFallback,
    hasNoSubscription,

    assignEdition: (
      editionId: string,
      type: SubscriptionType,
      currency?: string,
      promoCode?: string,
      promotionId?: string
    ) => assignMutation.mutate({ editionId, type, currency, promoCode, promotionId }),
    isAssigning: assignMutation.isPending,

    changeEdition: (
      editionId: string,
      type: SubscriptionType,
      currency?: string,
      promoCode?: string,
      promotionId?: string
    ) => changeMutation.mutate({ editionId, type, currency, promoCode, promotionId }),
    isChanging: changeMutation.isPending,

    renewSubscription: renewMutation.mutate,
    isRenewing: renewMutation.isPending,

    convertTrial: convertMutation.mutate,
    isConverting: convertMutation.isPending,

    suspendSubscription: (
      reason: string,
      useFallback?: boolean,
      refundType?: string,
      customRefundAmount?: number
    ) => suspendMutation.mutate({ reason, useFallback, refundType, customRefundAmount }),
    isSuspending: suspendMutation.isPending,

    resumeSubscription: (type?: SubscriptionType) => resumeMutation.mutate(type),
    isResuming: resumeMutation.isPending,

    cancelSubscription: (
      reason?: string,
      useFallback?: boolean,
      refundType?: string,
      customRefundAmount?: number
    ) => cancelMutation.mutate({ reason, useFallback, refundType, customRefundAmount }),
    isCanceling: cancelMutation.isPending,

    resyncPermissions: () => resyncMutation.mutate(),
    isResyncing: resyncMutation.isPending,

    changeCurrency: changeCurrencyMutation.mutate,
    isChangingCurrency: changeCurrencyMutation.isPending,

    getDowngradeImpact: (targetEditionId: string) =>
      identityContainer.tenantRepository.getDowngradeImpact(tenantId, targetEditionId),
    previewPrice: (editionId: string, currency: string, type: string) =>
      identityContainer.tenantRepository.previewPrice(editionId, currency, type),

    downloadReceipt: () => receiptMutation.mutate(),
    isDownloadingReceipt: receiptMutation.isPending,

    changePlanPromotionsRaw,
    isLoadingChangePlanPromos,
  };
}
