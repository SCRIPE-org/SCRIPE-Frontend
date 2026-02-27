/**
 * Feature Overrides ViewModel
 *
 * Manages per-tenant feature overrides: fetching overrides + resolved features,
 * setting overrides, and removing them.
 * Uses repository (not service directly) per clean architecture.
 * Owns pagination state and all logic — View is pure UI.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useState, useCallback, useMemo } from "react";

const ITEMS_PER_PAGE = 10;

export function useOverridesViewModel(tenantId: string) {
      const { overrideRepository } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();
      const { t } = useI18n();

      // ─── Pagination state ──────────────────────────────
      const [resolvedPage, setResolvedPage] = useState(1);
      const [overridesPage, setOverridesPage] = useState(1);

      // ─── Dialog state ──────────────────────────────────
      const [editingFeature, setEditingFeature] = useState<{
            featureId: string;
            featureName: string;
            valueType: string;
            currentValue: string;
      } | null>(null);
      const [overrideValue, setOverrideValue] = useState("");
      const [overrideReason, setOverrideReason] = useState("");

      // ─── Query keys ────────────────────────────────────
      const overridesKey = ["entitlements", "overrides", tenantId];
      const resolvedKey = ["entitlements", "resolved", tenantId];

      // ─── Fetch overrides ───────────────────────────────
      const overridesQuery = useQuery({
            queryKey: overridesKey,
            queryFn: () => overrideRepository.getOverrides(tenantId),
            enabled: !!tenantId,
      });

      // ─── Fetch resolved features ──────────────────────
      const resolvedQuery = useQuery({
            queryKey: resolvedKey,
            queryFn: () => overrideRepository.getResolved(tenantId),
            enabled: !!tenantId,
      });

      const overrides = overridesQuery.data ?? [];
      const resolvedFeatures = resolvedQuery.data ?? [];

      // ─── Paginated data ────────────────────────────────
      const resolvedTotalPages = Math.max(1, Math.ceil(resolvedFeatures.length / ITEMS_PER_PAGE));
      const safeResolvedPage = Math.min(resolvedPage, resolvedTotalPages);
      const paginatedResolved = useMemo(
            () => resolvedFeatures.slice(
                  (safeResolvedPage - 1) * ITEMS_PER_PAGE,
                  safeResolvedPage * ITEMS_PER_PAGE
            ),
            [resolvedFeatures, safeResolvedPage]
      );

      const overridesTotalPages = Math.max(1, Math.ceil(overrides.length / ITEMS_PER_PAGE));
      const safeOverridesPage = Math.min(overridesPage, overridesTotalPages);
      const paginatedOverrides = useMemo(
            () => overrides.slice(
                  (safeOverridesPage - 1) * ITEMS_PER_PAGE,
                  safeOverridesPage * ITEMS_PER_PAGE
            ),
            [overrides, safeOverridesPage]
      );

      // ─── Invalidation helper ───────────────────────────
      const invalidate = useCallback(() => {
            queryClient.invalidateQueries({ queryKey: overridesKey });
            queryClient.invalidateQueries({ queryKey: resolvedKey });
      }, [queryClient, overridesKey, resolvedKey]);

      // ─── Set override mutation ─────────────────────────
      const setOverrideMutation = useMutation({
            mutationFn: (params: { featureId: string; value: string; reason?: string }) =>
                  overrideRepository.setOverride(tenantId, params.featureId, {
                        value: params.value,
                        reason: params.reason,
                  }),
            onSuccess: () => {
                  invalidate();
                  success({
                        title: t("entitlements.overrides.overrideSet"),
                        description: t("entitlements.overrides.overrideSetDesc"),
                  });
                  setEditingFeature(null);
                  setOverrideValue("");
                  setOverrideReason("");
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      // ─── Remove override mutation ──────────────────────
      const removeOverrideMutation = useMutation({
            mutationFn: (featureId: string) =>
                  overrideRepository.removeOverride(tenantId, featureId),
            onSuccess: () => {
                  invalidate();
                  success({
                        title: t("entitlements.overrides.overrideRemoved"),
                        description: t("entitlements.overrides.overrideRemovedDesc"),
                  });
            },
            onError: (err: Error) =>
                  showError({ title: t("common.error"), description: err.message }),
      });

      // ─── Dialog actions ────────────────────────────────
      const openSetOverride = useCallback(
            (featureId: string, featureName: string, valueType: string, currentValue: string) => {
                  setEditingFeature({ featureId, featureName, valueType, currentValue });
                  setOverrideValue(currentValue);
                  setOverrideReason("");
            },
            []
      );

      const submitOverride = useCallback(() => {
            if (!editingFeature) return;
            setOverrideMutation.mutate({
                  featureId: editingFeature.featureId,
                  value: overrideValue,
                  reason: overrideReason || undefined,
            });
      }, [editingFeature, overrideValue, overrideReason, setOverrideMutation]);

      // ─── Public interface ──────────────────────────────
      return {
            // Data
            isLoading: overridesQuery.isLoading || resolvedQuery.isLoading,
            error: overridesQuery.error || resolvedQuery.error,

            // Overrides tab
            overrides,
            paginatedOverrides,
            overridesPage: safeOverridesPage,
            overridesTotalPages,
            setOverridesPage,

            // Resolved features tab
            resolvedFeatures,
            paginatedResolved,
            resolvedPage: safeResolvedPage,
            resolvedTotalPages,
            setResolvedPage,

            // Set override dialog
            editingFeature,
            overrideValue,
            overrideReason,
            setOverrideValue,
            setOverrideReason,
            openSetOverride,
            closeSetOverride: () => setEditingFeature(null),
            submitOverride,
            isSaving: setOverrideMutation.isPending,

            // Remove override
            removeOverride: removeOverrideMutation.mutate,
            isRemoving: removeOverrideMutation.isPending,
      };
}
