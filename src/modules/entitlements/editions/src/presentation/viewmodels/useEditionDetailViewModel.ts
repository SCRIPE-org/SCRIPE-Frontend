"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { Edition, EditionBundleDto } from "../../domain/entities/Edition";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";

// ── Disabled defaults ──
function getDisabledDefault(valueType: string): string {
      switch (valueType?.toLowerCase()) {
            case "boolean": return "false";
            case "numeric": return "0";
            default: return "";
      }
}

export interface EditionDetailViewModelResult {
      edition: Edition | undefined;
      features: Feature[] | undefined;
      isLoading: boolean;
      error: Error | null;

      // ── Feature state (local pending changes) ──
      pendingValues: Record<string, string>; // featureId -> value
      getEffectiveValue: (featureId: string, feature: Feature) => string;
      setLocalValue: (featureId: string, value: string) => void;
      hasUnsavedChanges: boolean;

      // ── Save/Discard ──
      saveAllFeatures: () => void;
      discardChanges: () => void;
      isSaving: boolean;

      // ── Bundles ──
      attachedBundles: EditionBundleDto[];
      availableBundles: { id: string; name: string; displayNameEn?: string; displayNameAr?: string }[];
      isLoadingBundles: boolean;
      attachBundle: (bundleId: string) => void;
      detachBundle: (bundleId: string) => void;
      isAttaching: boolean;
      isDetaching: boolean;

      // ── Collapsible modules ──
      collapsedModules: Record<string, boolean>;
      toggleModule: (moduleName: string) => void;
      expandAll: () => void;
      collapseAll: () => void;
}

export function useEditionDetailViewModel(editionId: string): EditionDetailViewModelResult {
      const { success, error: toastError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const { editionRepository, featureRepository, bundleRepository } = entitlementsContainer;

      // ── Queries ──
      const {
            data: edition,
            isLoading: isEditionLoading,
            error: editionError,
      } = useQuery({
            queryKey: ["entitlements", "editions", editionId],
            queryFn: () => editionRepository.getById(editionId),
            enabled: !!editionId,
      });

      const {
            data: featuresResult,
            isLoading: isFeaturesLoading,
            error: featuresError,
      } = useQuery({
            queryKey: ["entitlements", "features", "all"],
            queryFn: () => featureRepository.getAll({ page: 1, pageSize: 1000 }),
      });

      const {
            data: allBundlesResult,
            isLoading: isLoadingBundles,
      } = useQuery({
            queryKey: ["entitlements", "bundles", "all-list"],
            queryFn: () => bundleRepository.getAll({ page: 1, pageSize: 1000 }),
      });

      // ── Local pending feature values ──
      const [pendingValues, setPendingValues] = useState<Record<string, string>>({});

      // Initialize pending values from edition features when edition loads
      useEffect(() => {
            if (edition) {
                  const initial: Record<string, string> = {};
                  for (const ef of edition.features) {
                        initial[ef.featureId] = ef.value;
                  }
                  setPendingValues(initial);
            }
      }, [edition]);

      // Get effective value for a feature: pending → edition → disabled default
      const getEffectiveValue = useCallback((featureId: string, feature: Feature): string => {
            if (pendingValues[featureId] !== undefined) return pendingValues[featureId];
            return getDisabledDefault(feature.valueType);
      }, [pendingValues]);

      // Set a local value (no API call)
      const setLocalValue = useCallback((featureId: string, value: string) => {
            setPendingValues(prev => ({ ...prev, [featureId]: value }));
      }, []);

      // Check for unsaved changes
      const hasUnsavedChanges = useMemo(() => {
            if (!edition) return false;
            const serverMap: Record<string, string> = {};
            for (const ef of edition.features) {
                  serverMap[ef.featureId] = ef.value;
            }
            for (const [fId, val] of Object.entries(pendingValues)) {
                  if (serverMap[fId] !== val) return true;
            }
            return false;
      }, [edition, pendingValues]);

      const discardChanges = useCallback(() => {
            if (edition) {
                  const initial: Record<string, string> = {};
                  for (const ef of edition.features) {
                        initial[ef.featureId] = ef.value;
                  }
                  setPendingValues(initial);
            }
      }, [edition]);

      // ── Save all features mutation ──
      const saveAllMutation = useMutation({
            mutationFn: async (updates: Record<string, string>) => {
                  const entries = Object.entries(updates);
                  for (const [featureId, value] of entries) {
                        await editionRepository.setFeatureValue(editionId, featureId, value);
                  }
            },
            onSuccess: () => {
                  success({
                        title: "Features Updated",
                        description: "All feature modifications have been saved successfully.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
            },
            onError: (err) => {
                  toastError({
                        title: "Update Failed",
                        description: err instanceof Error ? err.message : "Failed to update features",
                  });
            },
      });

      const saveAllFeatures = useCallback(() => {
            if (!edition) return;
            // Only send changed values
            const serverMap: Record<string, string> = {};
            for (const ef of edition.features) {
                  serverMap[ef.featureId] = ef.value;
            }
            const changes: Record<string, string> = {};
            for (const [fId, val] of Object.entries(pendingValues)) {
                  if (serverMap[fId] !== val) {
                        changes[fId] = val;
                  }
            }
            if (Object.keys(changes).length > 0) {
                  saveAllMutation.mutate(changes);
            }
      }, [edition, pendingValues, saveAllMutation]);

      // ── Bundle mutations ──
      const attachMutation = useMutation({
            mutationFn: (bundleId: string) => editionRepository.attachBundle(editionId, bundleId),
            onSuccess: () => {
                  success({ title: "Bundle Attached", description: "Bundle has been attached to this edition." });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
            },
            onError: (err) => {
                  toastError({
                        title: "Attach Failed",
                        description: err instanceof Error ? err.message : "Failed to attach bundle",
                  });
            },
      });

      const detachMutation = useMutation({
            mutationFn: (bundleId: string) => editionRepository.detachBundle(editionId, bundleId),
            onSuccess: () => {
                  success({ title: "Bundle Detached", description: "Bundle has been detached from this edition." });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
            },
            onError: (err) => {
                  toastError({
                        title: "Detach Failed",
                        description: err instanceof Error ? err.message : "Failed to detach bundle",
                  });
            },
      });

      // ── Available bundles (not yet attached) ──
      const attachedBundles = edition?.bundles ?? [];
      const attachedBundleIds = new Set(attachedBundles.map(b => b.bundleId));
      const availableBundles = useMemo(() => {
            if (!allBundlesResult?.items) return [];
            return allBundlesResult.items
                  .filter(b => !attachedBundleIds.has(b.id))
                  .map(b => ({
                        id: b.id,
                        name: b.name,
                        displayNameEn: b.displayNameEn,
                        displayNameAr: b.displayNameAr,
                  }));
      }, [allBundlesResult, attachedBundleIds]);

      // ── Collapsible modules ──
      const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

      const toggleModule = useCallback((moduleName: string) => {
            setCollapsedModules(prev => ({
                  ...prev,
                  [moduleName]: !prev[moduleName],
            }));
      }, []);

      // Auto-collapse all modules on first load
      useEffect(() => {
            if (featuresResult?.items) {
                  const modules = new Set(featuresResult.items.map(f => f.module));
                  const collapsed: Record<string, boolean> = {};
                  modules.forEach(m => { collapsed[m] = true; });
                  setCollapsedModules(collapsed);
            }
      }, [featuresResult]);

      const expandAll = useCallback(() => {
            setCollapsedModules(prev => {
                  const next: Record<string, boolean> = {};
                  Object.keys(prev).forEach(k => { next[k] = false; });
                  return next;
            });
      }, []);

      const collapseAll = useCallback(() => {
            setCollapsedModules(prev => {
                  const next: Record<string, boolean> = {};
                  Object.keys(prev).forEach(k => { next[k] = true; });
                  return next;
            });
      }, []);

      return {
            edition,
            features: featuresResult?.items,
            isLoading: isEditionLoading || isFeaturesLoading,
            error: (editionError as Error) || (featuresError as Error) || null,

            pendingValues,
            getEffectiveValue,
            setLocalValue,
            hasUnsavedChanges,

            saveAllFeatures,
            discardChanges,
            isSaving: saveAllMutation.isPending,

            attachedBundles,
            availableBundles,
            isLoadingBundles,
            attachBundle: (bundleId: string) => attachMutation.mutate(bundleId),
            detachBundle: (bundleId: string) => detachMutation.mutate(bundleId),
            isAttaching: attachMutation.isPending,
            isDetaching: detachMutation.isPending,

            collapsedModules,
            toggleModule,
            expandAll,
            collapseAll,
      };
}
