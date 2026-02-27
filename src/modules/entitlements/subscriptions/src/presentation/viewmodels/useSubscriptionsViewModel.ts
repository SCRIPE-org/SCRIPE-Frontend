/**
 * Subscriptions ViewModel
 *
 * Manages tenant edition subscriptions: listing, assigning, changing, revoking.
 * Uses repository (not service directly) per clean architecture.
 * Pure .ts — no JSX. Returns typed interface for View.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useState, useCallback } from "react";

export function useSubscriptionsViewModel(tenantId: string) {
      const { subscriptionRepository } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();
      const { t } = useI18n();

      // ─── Dialog state ───────────────────────────────────
      const [showAssignDialog, setShowAssignDialog] = useState(false);
      const [showChangeDialog, setShowChangeDialog] = useState(false);
      const [selectedEditionId, setSelectedEditionId] = useState("");
      const [subscriptionType, setSubscriptionType] = useState("Lifetime");
      const [endDate, setEndDate] = useState("");

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
      }, []);

      // ─── Assign mutation ────────────────────────────────
      const assignMutation = useMutation({
            mutationFn: (params: { editionId: string; type: string; endDate?: string }) =>
                  subscriptionRepository.assign(tenantId, params),
            onSuccess: () => {
                  invalidate();
                  success({
                        title: t("entitlements.subscriptions.assigned"),
                        description: t("entitlements.subscriptions.assignedDesc"),
                  });
                  setShowAssignDialog(false);
                  resetForm();
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      // ─── Change mutation ────────────────────────────────
      const changeMutation = useMutation({
            mutationFn: (editionId: string) =>
                  subscriptionRepository.change(tenantId, editionId),
            onSuccess: () => {
                  invalidate();
                  success({
                        title: t("entitlements.subscriptions.changed"),
                        description: t("entitlements.subscriptions.changedDesc"),
                  });
                  setShowChangeDialog(false);
                  resetForm();
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      // ─── Revoke mutation ────────────────────────────────
      const revokeMutation = useMutation({
            mutationFn: (id: string) => subscriptionRepository.revoke(id),
            onSuccess: () => {
                  invalidate();
                  success({
                        title: t("entitlements.subscriptions.revoked"),
                        description: t("entitlements.subscriptions.revokedDesc"),
                  });
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      // ─── Submit helpers ─────────────────────────────────
      const submitAssign = useCallback(() => {
            assignMutation.mutate({
                  editionId: selectedEditionId,
                  type: subscriptionType,
                  endDate: endDate || undefined,
            });
      }, [assignMutation, selectedEditionId, subscriptionType, endDate]);

      const submitChange = useCallback(() => {
            changeMutation.mutate(selectedEditionId);
      }, [changeMutation, selectedEditionId]);

      // ─── Public interface ───────────────────────────────
      return {
            // Data
            items,
            isLoading: subscriptionsQuery.isLoading,
            error: subscriptionsQuery.error,
            hasActiveSubscription: !!activeSubscription,

            // Assign dialog
            showAssignDialog,
            setShowAssignDialog,
            submitAssign,
            isAssigning: assignMutation.isPending,

            // Change dialog
            showChangeDialog,
            setShowChangeDialog,
            submitChange,
            isChanging: changeMutation.isPending,

            // Revoke
            revokeSubscription: revokeMutation.mutate,
            isRevoking: revokeMutation.isPending,

            // Form state
            selectedEditionId,
            setSelectedEditionId,
            subscriptionType,
            setSubscriptionType,
            endDate,
            setEndDate,
      };
}
