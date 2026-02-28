/**
 * Subscriptions ViewModel
 *
 * Manages tenant edition subscriptions — full lifecycle:
 * assign, change, renew, convert-trial, suspend, resume, cancel, revoke, resync.
 * Pure .ts — no JSX. Returns typed interface for View.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useState, useCallback, useEffect } from "react";

export function useSubscriptionsViewModel(tenantId: string) {
      const { subscriptionRepository } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();
      const { t } = useI18n();

      // ─── Dialog state ───────────────────────────────────
      const [showAssignDialog, setShowAssignDialog] = useState(false);
      const [showChangeDialog, setShowChangeDialog] = useState(false);
      const [showSuspendDialog, setShowSuspendDialog] = useState(false);
      const [showCancelDialog, setShowCancelDialog] = useState(false);
      const [showConvertDialog, setShowConvertDialog] = useState(false);

      // ─── Form state ─────────────────────────────────────
      const [selectedEditionId, setSelectedEditionId] = useState("");
      const [subscriptionType, setSubscriptionType] = useState("Lifetime");
      const [endDate, setEndDate] = useState("");
      const [expiryBehavior, setExpiryBehavior] = useState("Fallback");
      const [suspendReason, setSuspendReason] = useState("");
      const [cancelReason, setCancelReason] = useState("");
      const [useFallback, setUseFallback] = useState(false);
      const [convertType, setConvertType] = useState("Monthly");

      // ─── Query keys ─────────────────────────────────────
      const queryKey = ["entitlements", "subscriptions", tenantId];

      // ─── Fetch subscriptions ────────────────────────────
      const subscriptionsQuery = useQuery({
            queryKey,
            queryFn: () => subscriptionRepository.getByTenant(tenantId),
            enabled: !!tenantId,
      });

      const items = subscriptionsQuery.data ?? [];
      const activeSubscription = items.find(
            (s) => s.status === "Active" || s.status === "Trialing"
      );
      const suspendedSubscription = items.find((s) => s.status === "Suspended");
      const isTrialing = activeSubscription?.status === "Trialing";
      const isDowngraded = activeSubscription?.isDowngraded ?? false;

      // ─── Invalidation helper ────────────────────────────
      const invalidate = useCallback(
            () => queryClient.invalidateQueries({ queryKey }),
            [queryClient, queryKey]
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

      // ─── Mutations ──────────────────────────────────────

      const assignMutation = makeMutation(
            (params: { editionId: string; type: string; endDate?: string; expiryBehavior?: string }) =>
                  subscriptionRepository.assign(tenantId, params),
            "entitlements.subscriptions.assigned",
            "entitlements.subscriptions.assignedDesc",
            () => setShowAssignDialog(false)
      );

      const changeMutation = makeMutation(
            (params: { editionId: string; type: string }) =>
                  subscriptionRepository.change(tenantId, params),
            "entitlements.subscriptions.changed",
            "entitlements.subscriptions.changedDesc",
            () => setShowChangeDialog(false)
      );

      const renewMutation = makeMutation(
            (type: string) => subscriptionRepository.renew(tenantId, type),
            "entitlements.subscriptions.renewed",
            "entitlements.subscriptions.renewedDesc"
      );

      const convertMutation = makeMutation(
            (type: string) => subscriptionRepository.convertTrial(tenantId, type),
            "entitlements.subscriptions.converted",
            "entitlements.subscriptions.convertedDesc",
            () => setShowConvertDialog(false)
      );

      const suspendMutation = makeMutation(
            (params: { reason: string; useFallback: boolean }) =>
                  subscriptionRepository.suspend(tenantId, params.reason, params.useFallback),
            "entitlements.subscriptions.suspended",
            "entitlements.subscriptions.suspendedDesc",
            () => setShowSuspendDialog(false)
      );

      const resumeMutation = makeMutation(
            (type?: string) => subscriptionRepository.resume(tenantId, type),
            "entitlements.subscriptions.resumed",
            "entitlements.subscriptions.resumedDesc"
      );

      const cancelMutation = makeMutation(
            (params: { reason?: string; useFallback: boolean }) =>
                  subscriptionRepository.cancel(tenantId, params.reason, params.useFallback),
            "entitlements.subscriptions.canceled",
            "entitlements.subscriptions.canceledDesc",
            () => setShowCancelDialog(false)
      );

      const resyncMutation = makeMutation(
            () => subscriptionRepository.resync(tenantId),
            "entitlements.subscriptions.resynced",
            "entitlements.subscriptions.resyncedDesc"
      );

      const revokeMutation = makeMutation(
            (id: string) => subscriptionRepository.revoke(id),
            "entitlements.subscriptions.revoked",
            "entitlements.subscriptions.revokedDesc"
      );

      // ─── Submit helpers ─────────────────────────────────
      const submitAssign = useCallback(() => {
            assignMutation.mutate({
                  editionId: selectedEditionId,
                  type: subscriptionType,
                  endDate: endDate || undefined,
                  expiryBehavior,
            });
      }, [assignMutation, selectedEditionId, subscriptionType, endDate, expiryBehavior]);

      const submitChange = useCallback(() => {
            changeMutation.mutate({ editionId: selectedEditionId, type: subscriptionType });
      }, [changeMutation, selectedEditionId, subscriptionType]);

      const submitSuspend = useCallback(() => {
            suspendMutation.mutate({ reason: suspendReason, useFallback });
      }, [suspendMutation, suspendReason, useFallback]);

      const submitCancel = useCallback(() => {
            cancelMutation.mutate({ reason: cancelReason, useFallback });
      }, [cancelMutation, cancelReason, useFallback]);

      const submitConvert = useCallback(() => {
            convertMutation.mutate(convertType);
      }, [convertMutation, convertType]);

      // ─── Public interface ───────────────────────────────
      return {
            // Data
            items,
            isLoading: subscriptionsQuery.isLoading,
            error: subscriptionsQuery.error,
            hasActiveSubscription: !!activeSubscription,
            hasSuspendedSubscription: !!suspendedSubscription,
            isTrialing,
            isDowngraded,
            activeSubscription,

            // Assign dialog
            showAssignDialog, setShowAssignDialog,
            submitAssign,
            isAssigning: assignMutation.isPending,

            // Change dialog
            showChangeDialog, setShowChangeDialog,
            submitChange,
            isChanging: changeMutation.isPending,

            // Suspend dialog
            showSuspendDialog, setShowSuspendDialog,
            submitSuspend,
            isSuspending: suspendMutation.isPending,
            suspendReason, setSuspendReason,

            // Cancel dialog
            showCancelDialog, setShowCancelDialog,
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
      };
}
