/**
 * Feature Overrides ViewModel
 *
 * Manages per-tenant feature overrides: fetching overrides + resolved features,
 * setting overrides, and removing them.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useState } from "react";

export function useOverridesViewModel(tenantId: string) {
      const { overrideService } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();
      const { t } = useI18n();

      // State for the set-override dialog
      const [editingFeature, setEditingFeature] = useState<{
            featureId: string;
            featureName: string;
            valueType: string;
            currentValue: string;
      } | null>(null);
      const [overrideValue, setOverrideValue] = useState("");
      const [overrideReason, setOverrideReason] = useState("");

      // Fetch overrides
      const overridesQuery = useQuery({
            queryKey: ["entitlements", "overrides", tenantId],
            queryFn: () => overrideService.getOverrides(tenantId),
            enabled: !!tenantId,
      });

      // Fetch resolved features
      const resolvedQuery = useQuery({
            queryKey: ["entitlements", "resolved", tenantId],
            queryFn: () => overrideService.getResolved(tenantId),
            enabled: !!tenantId,
      });

      // Set override mutation
      const setOverrideMutation = useMutation({
            mutationFn: (params: { featureId: string; value: string; reason?: string }) =>
                  overrideService.setOverride(tenantId, params.featureId, {
                        value: params.value,
                        reason: params.reason,
                  }),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "overrides", tenantId] });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "resolved", tenantId] });
                  success({
                        title: t("entitlements.overrides.overrideSet"),
                        description: t("entitlements.overrides.overrideSetDesc"),
                  });
                  setEditingFeature(null);
                  setOverrideValue("");
                  setOverrideReason("");
            },
            onError: (err: Error) => {
                  showError({ title: "Error", description: err.message });
            },
      });

      // Remove override mutation
      const removeOverrideMutation = useMutation({
            mutationFn: (featureId: string) => overrideService.removeOverride(tenantId, featureId),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "overrides", tenantId] });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "resolved", tenantId] });
                  success({
                        title: t("entitlements.overrides.overrideRemoved"),
                        description: t("entitlements.overrides.overrideRemovedDesc"),
                  });
            },
            onError: (err: Error) => {
                  showError({ title: "Error", description: err.message });
            },
      });

      // Open the set-override dialog
      const openSetOverride = (featureId: string, featureName: string, valueType: string, currentValue: string) => {
            setEditingFeature({ featureId, featureName, valueType, currentValue });
            setOverrideValue(currentValue);
            setOverrideReason("");
      };

      // Submit the override
      const submitOverride = () => {
            if (!editingFeature) return;
            setOverrideMutation.mutate({
                  featureId: editingFeature.featureId,
                  value: overrideValue,
                  reason: overrideReason || undefined,
            });
      };

      return {
            // Data
            overrides: overridesQuery.data ?? [],
            resolvedFeatures: resolvedQuery.data ?? [],
            isLoading: overridesQuery.isLoading || resolvedQuery.isLoading,
            error: overridesQuery.error || resolvedQuery.error,

            // Dialog state
            editingFeature,
            overrideValue,
            overrideReason,
            setOverrideValue,
            setOverrideReason,
            openSetOverride,
            closeSetOverride: () => setEditingFeature(null),
            submitOverride,
            isSaving: setOverrideMutation.isPending,

            // Actions
            removeOverride: removeOverrideMutation.mutate,
            isRemoving: removeOverrideMutation.isPending,
      };
}
