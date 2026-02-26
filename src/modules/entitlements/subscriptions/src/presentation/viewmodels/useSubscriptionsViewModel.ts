/**
 * Subscriptions ViewModel
 *
 * Manages tenant edition subscriptions: listing, assigning, changing, revoking.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useState } from "react";

export function useSubscriptionsViewModel(tenantId: string) {
      const { subscriptionService } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();
      const { t } = useI18n();

      // Dialog state
      const [showAssignDialog, setShowAssignDialog] = useState(false);
      const [showChangeDialog, setShowChangeDialog] = useState(false);
      const [selectedEditionId, setSelectedEditionId] = useState("");
      const [subscriptionType, setSubscriptionType] = useState("Lifetime");
      const [endDate, setEndDate] = useState("");

      // Fetch subscriptions
      const subscriptionsQuery = useQuery({
            queryKey: ["entitlements", "subscriptions", tenantId],
            queryFn: () => subscriptionService.getByTenant(tenantId),
            enabled: !!tenantId,
      });

      // Assign edition mutation
      const assignMutation = useMutation({
            mutationFn: (params: { editionId: string; type: string; endDate?: string }) =>
                  subscriptionService.assign(tenantId, params),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "subscriptions", tenantId] });
                  success({
                        title: t("entitlements.subscriptions.assigned"),
                        description: t("entitlements.subscriptions.assignedDesc"),
                  });
                  setShowAssignDialog(false);
                  resetForm();
            },
            onError: (err: Error) => {
                  showError({ title: "Error", description: err.message });
            },
      });

      // Change edition mutation
      const changeMutation = useMutation({
            mutationFn: (editionId: string) => subscriptionService.change(tenantId, editionId),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "subscriptions", tenantId] });
                  success({
                        title: t("entitlements.subscriptions.changed"),
                        description: t("entitlements.subscriptions.changedDesc"),
                  });
                  setShowChangeDialog(false);
                  resetForm();
            },
            onError: (err: Error) => {
                  showError({ title: "Error", description: err.message });
            },
      });

      // Revoke subscription mutation
      const revokeMutation = useMutation({
            mutationFn: (id: string) => subscriptionService.revoke(id),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "subscriptions", tenantId] });
                  success({
                        title: t("entitlements.subscriptions.revoked"),
                        description: t("entitlements.subscriptions.revokedDesc"),
                  });
            },
            onError: (err: Error) => {
                  showError({ title: "Error", description: err.message });
            },
      });

      const resetForm = () => {
            setSelectedEditionId("");
            setSubscriptionType("Lifetime");
            setEndDate("");
      };

      const submitAssign = () => {
            assignMutation.mutate({
                  editionId: selectedEditionId,
                  type: subscriptionType,
                  endDate: endDate || undefined,
            });
      };

      const submitChange = () => {
            changeMutation.mutate(selectedEditionId);
      };

      return {
            // Data
            subscriptions: subscriptionsQuery.data ?? [],
            isLoading: subscriptionsQuery.isLoading,
            error: subscriptionsQuery.error,

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
