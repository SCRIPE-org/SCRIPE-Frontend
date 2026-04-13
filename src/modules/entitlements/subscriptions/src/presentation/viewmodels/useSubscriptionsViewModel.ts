/**
 * Subscriptions ViewModel
 *
 * Manages tenant edition subscriptions — full lifecycle:
 * assign, change, renew, convert-trial, suspend, resume, cancel, revoke, resync.
 * Also exposes billing actions: checkout, portal, cancel-stripe.
 * Pure .ts — no JSX. Returns typed interface for View.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { identityContainer } from "@modules/identity/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useState, useCallback, useEffect, useMemo } from "react";
import { parseLocalizedNumber } from "@core/utils/number-parser";
import type { EditionPromotionData } from "@modules/entitlements/editions/src/domain/entities/EditionPromotion";

export function useSubscriptionsViewModel(tenantId: string) {
      const { subscriptionRepository, editionRepository, billingRepository } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();
      const { t } = useI18n();

      // ─── Dialog state ───────────────────────────────────
      const [showAssignDialog, setShowAssignDialog] = useState(false);
      const [showChangeDialog, setShowChangeDialog] = useState(false);
      const [showSuspendDialog, setShowSuspendDialog] = useState(false);
      const [showCancelDialog, setShowCancelDialog] = useState(false);
      const [showConvertDialog, setShowConvertDialog] = useState(false);
      // ── Billing dialog state ──
      const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
      const [showCancelStripeDialog, setShowCancelStripeDialog] = useState(false);
      const [checkoutUrl, setCheckoutUrl] = useState("");
      const [checkoutQrCode, setCheckoutQrCode] = useState<string | null>(null);
      const [checkoutEmailSent, setCheckoutEmailSent] = useState(false);
      const [cancelImmediately, setCancelImmediately] = useState(false);

      // ─── Form state ─────────────────────────────────────
      const [selectedEditionId, setSelectedEditionId] = useState("");
      const [subscriptionType, setSubscriptionType] = useState("Lifetime");
      const [endDate, setEndDate] = useState("");
      const [expiryBehavior, setExpiryBehavior] = useState("Fallback");
      const [suspendReason, setSuspendReason] = useState("");
      const [cancelReason, setCancelReason] = useState("");
      const [useFallback, setUseFallback] = useState(false);
      const [convertType, setConvertType] = useState("Monthly");
      const [promoCode, setPromoCode] = useState("");
      const [currency, setCurrency] = useState("USD");
      const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
      const [refundType, setRefundType] = useState("None");
      const [customRefundAmount, setCustomRefundAmount] = useState<string>("");
      const [skipPayment, setSkipPayment] = useState(false);

      // ─── Query keys ─────────────────────────────────────
      const queryKey = ["entitlements", "subscriptions", tenantId];

      // ─── Fetch subscriptions ────────────────────────────
      const subscriptionsQuery = useQuery({
            queryKey,
            queryFn: () => subscriptionRepository.getByTenant(tenantId),
            enabled: !!tenantId,
      });

      // ─── Fetch tenant detail (for admin email) ─────────
      const { tenantRepository } = identityContainer;
      const tenantQuery = useQuery({
            queryKey: ["tenant", tenantId],
            queryFn: () => tenantRepository.getById(tenantId),
            enabled: !!tenantId,
      });
      const tenantAdminEmail = tenantQuery.data?.adminEmail;

      const items = subscriptionsQuery.data ?? [];
      const activeSubscription = items.find(
            (s) => s.status === "Active" || s.status === "Trialing"
      );
      const suspendedSubscription = items.find((s) => s.status === "Suspended");
      const pendingPaymentSubscription = items.find((s) => s.status === "PendingPayment");
      const isTrialing = activeSubscription?.status === "Trialing";
      const isDowngraded = activeSubscription?.isDowngraded ?? false;

      // GAP-I: Detect if this is a free edition (totalAmount = 0 or no amount)
      const isFreeEdition = activeSubscription
            ? (activeSubscription.totalAmount ?? 0) === 0
            : false;

      // ─── Invalidation helper ────────────────────────────
      const invalidate = useCallback(
            () => {
                  queryClient.invalidateQueries({ queryKey });
                  // Cross-invalidate: refresh tenant detail page and subscription card
                  queryClient.invalidateQueries({ queryKey: ["tenant-subscriptions", tenantId] });
                  queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
                  queryClient.invalidateQueries({ queryKey: ["tenant-entitlements", tenantId] });
                  queryClient.invalidateQueries({ queryKey: ["tenants"] });
            },
            [queryClient, queryKey, tenantId]
      );

      // ─── Reset form ─────────────────────────────────────
      const resetForm = useCallback(() => {
            setSelectedEditionId("");
            setSubscriptionType("Lifetime");
            setEndDate("");
            setExpiryBehavior("Fallback");
            setSuspendReason("");
            setCancelReason("");
            setUseFallback(false);
            setConvertType("Monthly");
            setPromoCode("");
            setCurrency("USD");
            setSelectedPromotionId(null);
            setRefundType("None");
            setCustomRefundAmount("");
            setSkipPayment(false);
      }, []);

      // ─── Auto-calculate endDate on type change ────────
      useEffect(() => {
            const now = new Date();
            switch (subscriptionType) {
                  case "Monthly":
                        now.setDate(now.getDate() + 30);
                        setEndDate(now.toISOString().split("T")[0]);
                        break;
                  case "Yearly":
                        now.setDate(now.getDate() + 365);
                        setEndDate(now.toISOString().split("T")[0]);
                        break;
                  case "Trial":
                        now.setDate(now.getDate() + 14);
                        setEndDate(now.toISOString().split("T")[0]);
                        break;
                  case "Lifetime":
                  default:
                        setEndDate("");
                        break;
            }
      }, [subscriptionType]);

      // ─── Mutation helper ─────────────────────────────────
      const makeMutation = <T,>(
            mutationFn: (params: T) => Promise<unknown>,
            successKey: string,
            descKey: string,
            onDone?: () => void
      ) =>
            useMutation({
                  mutationFn,
                  onSuccess: () => {
                        invalidate();
                        success({ title: t(successKey), description: t(descKey) });
                        onDone?.();
                        resetForm();
                  },
                  onError: (err: Error) =>
                        showError({ title: t("common.error"), description: err.message }),
            });

      // ── Fetch promotions for selected edition ───────────────────
      const promotionsQuery = useQuery({
            queryKey: ["entitlements", "editions", selectedEditionId, "promotions"],
            queryFn: () => editionRepository.getPromotions(selectedEditionId),
            enabled: !!selectedEditionId,
      });

      const allPromotions: EditionPromotionData[] = promotionsQuery.data ?? [];

      // Filter promotions by billing cycle and active status
      const availablePromotions = useMemo((): EditionPromotionData[] => {
            return allPromotions.filter((p) => {
                  if (!p.isActive) return false;
                  // Check expiry
                  if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
                  // Check not started
                  if (p.validFrom && new Date(p.validFrom) > new Date()) return false;
                  // Check redemption limit
                  if (p.maxRedemptions != null && p.currentRedemptions >= p.maxRedemptions) return false;
                  // Filter by applicable billing cycle
                  if (p.applicableCycle) {
                        if (p.applicableCycle !== subscriptionType) return false;
                  }
                  return true;
            });
      }, [allPromotions, subscriptionType]);

      // Get the selected promotion object
      const selectedPromotion = useMemo(() => {
            if (!selectedPromotionId) return null;
            return availablePromotions.find((p) => p.id === selectedPromotionId) ?? null;
      }, [selectedPromotionId, availablePromotions]);

      // Does the selected promotion require a code?
      const requiresPromoCode = selectedPromotion?.requiresCode ?? false;

      // Reset promotion when edition or subscription type changes
      useEffect(() => {
            setSelectedPromotionId(null);
            setPromoCode("");
      }, [selectedEditionId, subscriptionType]);

      // ─── Mutations ──────────────────────────────────────

      const assignMutation = makeMutation(
            (params: { editionId: string; type: string; endDate?: string; expiryBehavior?: string; promoCode?: string; currency?: string; promotionId?: string; skipPayment?: boolean }) =>
                  subscriptionRepository.assign(tenantId, params),
            "entSubscriptions.assigned",
            "entSubscriptions.assignedDesc",
            () => setShowAssignDialog(false)
      );

      const changeMutation = makeMutation(
            (params: { editionId: string; type: string; promoCode?: string; currency?: string; promotionId?: string }) =>
                  subscriptionRepository.change(tenantId, params),
            "entSubscriptions.changed",
            "entSubscriptions.changedDesc",
            () => setShowChangeDialog(false)
      );

      const renewMutation = makeMutation(
            (type: string) => subscriptionRepository.renew(tenantId, type),
            "entSubscriptions.renewed",
            "entSubscriptions.renewedDesc"
      );

      const convertMutation = makeMutation(
            (type: string) => subscriptionRepository.convertTrial(tenantId, type),
            "entSubscriptions.converted",
            "entSubscriptions.convertedDesc",
            () => setShowConvertDialog(false)
      );

      const suspendMutation = makeMutation(
            (params: { reason: string; useFallback: boolean; refundType: string; customRefundAmount?: number }) =>
                  subscriptionRepository.suspend(tenantId, params.reason, params.useFallback, params.refundType, params.customRefundAmount),
            "entSubscriptions.suspended",
            "entSubscriptions.suspendedDesc",
            () => setShowSuspendDialog(false)
      );

      const resumeMutation = makeMutation(
            (type?: string) => subscriptionRepository.resume(tenantId, type),
            "entSubscriptions.resumed",
            "entSubscriptions.resumedDesc"
      );

      const cancelMutation = makeMutation(
            (params: { reason?: string; useFallback: boolean; refundType: string; customRefundAmount?: number }) =>
                  subscriptionRepository.cancel(tenantId, params.reason, params.useFallback, params.refundType, params.customRefundAmount),
            "entSubscriptions.canceled",
            "entSubscriptions.canceledDesc",
            () => setShowCancelDialog(false)
      );

      const resyncMutation = makeMutation(
            () => subscriptionRepository.resync(tenantId),
            "entSubscriptions.resynced",
            "entSubscriptions.resyncedDesc"
      );

      const revokeMutation = makeMutation(
            (id: string) => subscriptionRepository.revoke(id),
            "entSubscriptions.revoked",
            "entSubscriptions.revokedDesc"
      );

      // ─── Submit helpers ─────────────────────────────────
      const submitAssign = useCallback(() => {
            assignMutation.mutate({
                  editionId: selectedEditionId,
                  type: subscriptionType,
                  endDate: endDate || undefined,
                  expiryBehavior,
                  promoCode: requiresPromoCode ? (promoCode || undefined) : undefined,
                  currency: currency || undefined,
                  promotionId: selectedPromotionId || undefined,
                  skipPayment: skipPayment || undefined,
            });
      }, [assignMutation, selectedEditionId, subscriptionType, endDate, expiryBehavior, promoCode, currency, selectedPromotionId, requiresPromoCode, skipPayment]);

      const submitChange = useCallback(() => {
            changeMutation.mutate({
                  editionId: selectedEditionId,
                  type: subscriptionType,
                  promoCode: requiresPromoCode ? (promoCode || undefined) : undefined,
                  currency: currency || undefined,
                  promotionId: selectedPromotionId || undefined,
            });
      }, [changeMutation, selectedEditionId, subscriptionType, promoCode, currency, selectedPromotionId, requiresPromoCode]);

      const submitSuspend = useCallback(() => {
            const parsed = customRefundAmount ? parseLocalizedNumber(customRefundAmount) : undefined;
            suspendMutation.mutate({ reason: suspendReason, useFallback, refundType, customRefundAmount: parsed && parsed > 0 ? parsed : undefined });
      }, [suspendMutation, suspendReason, useFallback, refundType, customRefundAmount]);

      const submitCancel = useCallback(() => {
            const parsed = customRefundAmount ? parseLocalizedNumber(customRefundAmount) : undefined;
            cancelMutation.mutate({ reason: cancelReason, useFallback, refundType, customRefundAmount: parsed && parsed > 0 ? parsed : undefined });
      }, [cancelMutation, cancelReason, useFallback, refundType, customRefundAmount]);

      const submitConvert = useCallback(() => {
            convertMutation.mutate(convertType);
      }, [convertMutation, convertType]);

      // ─── Billing mutations ──────────────────────────────
      const checkoutMutation = useMutation({
            mutationFn: async (options?: { sendToEmail?: string }) => {
                  // Allow checkout for both active and pending-payment subscriptions
                  const targetSubscription = activeSubscription ?? pendingPaymentSubscription;
                  if (!targetSubscription) throw new Error("No active subscription");
                  const result = await billingRepository.createCheckoutSession(tenantId, {
                        editionId: targetSubscription.editionId,
                        subscriptionType: targetSubscription.type,
                        currency: targetSubscription.currency,
                        successUrl: `${window.location.origin}/entitlements/subscriptions?checkout=success`,
                        cancelUrl: `${window.location.origin}/entitlements/subscriptions?checkout=canceled`,
                        generateQrCode: true,
                        sendToEmail: options?.sendToEmail,
                  });
                  return result;
            },
            onSuccess: (result) => {
                  setCheckoutUrl(result.url);
                  setCheckoutQrCode(result.qrCodeBase64 ?? null);
                  setCheckoutEmailSent(result.emailSent ?? false);
                  setShowCheckoutDialog(true);
                  invalidate();
                  success({ title: t("billing.checkoutSuccess"), description: "" });
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      const portalMutation = useMutation({
            mutationFn: async () => {
                  const result = await billingRepository.createBillingPortal(
                        tenantId,
                        window.location.href
                  );
                  return result;
            },
            onSuccess: (result) => {
                  window.open(result.url, "_blank");
                  success({ title: t("billing.portalSuccess"), description: t("billing.dialogs.portalOpened") });
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      const cancelStripeMutation = useMutation({
            mutationFn: async (immediately: boolean) => {
                  await billingRepository.cancelStripeSubscription(tenantId, immediately);
            },
            onSuccess: () => {
                  invalidate();
                  setShowCancelStripeDialog(false);
                  setCancelImmediately(false);
                  success({ title: t("billing.cancelSuccess"), description: "" });
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      const submitCancelStripe = useCallback(() => {
            cancelStripeMutation.mutate(cancelImmediately);
      }, [cancelStripeMutation, cancelImmediately]);

      // ─── Public interface ───────────────────────────────
      return {
            // Data
            items,
            isLoading: subscriptionsQuery.isLoading,
            error: subscriptionsQuery.error,
            hasActiveSubscription: !!activeSubscription,
            hasSuspendedSubscription: !!suspendedSubscription,
            hasPendingPaymentSubscription: !!pendingPaymentSubscription,
            isFreeEdition,
            isTrialing,
            isDowngraded,
            activeSubscription,
            pendingPaymentSubscription,

            // Assign dialog
            showAssignDialog, setShowAssignDialog,
            submitAssign,
            isAssigning: assignMutation.isPending,

            // Change dialog
            showChangeDialog, setShowChangeDialog,
            submitChange,
            isChanging: changeMutation.isPending,

            // Suspend dialog
            showSuspendDialog,
            setShowSuspendDialog: (open: boolean) => {
                  setShowSuspendDialog(open);
                  if (!open) resetForm(); // Reset shared state on dialog close
            },
            submitSuspend,
            isSuspending: suspendMutation.isPending,
            suspendReason, setSuspendReason,

            // Cancel dialog
            showCancelDialog,
            setShowCancelDialog: (open: boolean) => {
                  setShowCancelDialog(open);
                  if (!open) resetForm(); // Reset shared state on dialog close
            },
            submitCancel,
            isCanceling: cancelMutation.isPending,
            cancelReason, setCancelReason,

            // Convert trial dialog
            showConvertDialog, setShowConvertDialog,
            submitConvert,
            isConverting: convertMutation.isPending,
            convertType, setConvertType,

            // Resume (no dialog — direct action)
            resumeSubscription: () => resumeMutation.mutate(undefined),
            isResuming: resumeMutation.isPending,

            // Renew (direct action)
            renewSubscription: (type: string) => renewMutation.mutate(type),
            isRenewing: renewMutation.isPending,

            // Resync (direct action)
            resyncPermissions: () => resyncMutation.mutate(undefined as never),
            isResyncing: resyncMutation.isPending,

            // Revoke
            revokeSubscription: revokeMutation.mutate,
            isRevoking: revokeMutation.isPending,

            // Shared form state
            selectedEditionId, setSelectedEditionId,
            subscriptionType, setSubscriptionType,
            endDate, setEndDate,
            expiryBehavior, setExpiryBehavior,
            useFallback, setUseFallback,
            promoCode, setPromoCode,
            currency, setCurrency,
            skipPayment, setSkipPayment,

            // Smart promotion picker
            availablePromotions,
            selectedPromotionId, setSelectedPromotionId,
            selectedPromotion,
            requiresPromoCode,
            isLoadingPromotions: promotionsQuery.isLoading,

            // Refund options (for suspend/cancel)
            refundType, setRefundType,
            customRefundAmount, setCustomRefundAmount,

            // Billing actions — dual mode: generate only vs generate & send
            generatePaymentLink: () => checkoutMutation.mutate(undefined),
            sendPaymentLink: (email?: string) => {
                  const targetEmail = email || tenantAdminEmail;
                  if (!targetEmail) {
                        showError({ title: t("common.error"), description: t("billing.errors.noAdminEmail") || "No admin email found for this tenant." });
                        return;
                  }
                  checkoutMutation.mutate({ sendToEmail: targetEmail });
            },
            tenantAdminEmail,
            isSendingPaymentLink: checkoutMutation.isPending,
            openBillingPortal: () => portalMutation.mutate(),
            isOpeningPortal: portalMutation.isPending,
            submitCancelStripe,
            isCancelingStripe: cancelStripeMutation.isPending,

            // Billing dialog state
            showCheckoutDialog, setShowCheckoutDialog,
            showCancelStripeDialog, setShowCancelStripeDialog,
            checkoutUrl,
            checkoutQrCode,
            checkoutEmailSent,
            cancelImmediately, setCancelImmediately,
      };
}
