"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { Edition } from "../../domain/entities/Edition";
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
      // All keyed by featureName (stable, unique, not encrypted)
      pendingValues: Record<string, string>;
      getEffectiveValue: (feature: Feature) => string;
      setLocalValue: (featureName: string, value: string) => void;
      hasUnsavedChanges: boolean;

      // ── Save/Discard ──
      saveAllFeatures: () => void;
      discardChanges: () => void;
      isSaving: boolean;

      // ── Module/Category grouping ──
      collapsedModules: Record<string, boolean>;
      toggleModule: (moduleName: string) => void;
      expandAll: () => void;
      collapseAll: () => void;

      // ── Overflow Policy ──
      overflowPolicy: string;
      updateOverflowPolicy: (policy: string) => void;
      isUpdatingOverflowPolicy: boolean;
}

export function useEditionDetailViewModel(editionId: string): EditionDetailViewModelResult {
      const { success, error: toastError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const { editionRepository, featureRepository } = entitlementsContainer;

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

      // ── Server map: featureName → value (from edition features) ──
      // Uses featureName as key because encrypted IDs are non-deterministic
      // (same GUID encrypted twice gives different strings)
      const serverValueMap = useMemo(() => {
            const map: Record<string, string> = {};
            if (edition) {
                  for (const ef of edition.features) {
                        map[ef.featureName] = ef.value;
                  }
            }
            return map;
      }, [edition]);

      // ── featureName → featureId lookup (from edition features, for save API) ──
      const featureIdByName = useMemo(() => {
            const map: Record<string, string> = {};
            if (edition) {
                  for (const ef of edition.features) {
                        map[ef.featureName] = ef.featureId;
                  }
            }
            return map;
      }, [edition]);

      // ── Local pending feature values (keyed by featureName) ──
      const [pendingValues, setPendingValues] = useState<Record<string, string>>({});

      // Sync pending values when edition data changes
      const [lastEditionId, setLastEditionId] = useState<string | undefined>();
      useEffect(() => {
            if (edition && edition.id !== lastEditionId) {
                  setPendingValues(serverValueMap);
                  setLastEditionId(edition.id);
            }
      }, [edition, serverValueMap, lastEditionId]);

      // Get effective value: pending → server → disabled default
      const getEffectiveValue = useCallback((feature: Feature): string => {
            const name = feature.name;
            if (pendingValues[name] !== undefined) return pendingValues[name];
            if (serverValueMap[name] !== undefined) return serverValueMap[name];
            return getDisabledDefault(feature.valueType);
      }, [pendingValues, serverValueMap]);

      // Set a local value (no API call)
      const setLocalValue = useCallback((featureName: string, value: string) => {
            setPendingValues(prev => ({ ...prev, [featureName]: value }));
      }, []);

      // Check for unsaved changes
      const hasUnsavedChanges = useMemo(() => {
            if (!edition) return false;
            for (const [name, val] of Object.entries(pendingValues)) {
                  if (serverValueMap[name] !== val) return true;
            }
            return false;
      }, [edition, pendingValues, serverValueMap]);

      const discardChanges = useCallback(() => {
            setPendingValues(serverValueMap);
      }, [serverValueMap]);

      // ── Save all features mutation ──
      const saveAllMutation = useMutation({
            mutationFn: async (updates: Record<string, string>) => {
                  const entries = Object.entries(updates);
                  for (const [featureName, value] of entries) {
                        // Look up the featureId from the edition's feature list
                        const fId = featureIdByName[featureName];
                        if (fId) {
                              await editionRepository.setFeatureValue(editionId, fId, value);
                        }
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
            const changes: Record<string, string> = {};
            for (const [name, val] of Object.entries(pendingValues)) {
                  if (serverValueMap[name] !== val) {
                        changes[name] = val;
                  }
            }
            if (Object.keys(changes).length > 0) {
                  saveAllMutation.mutate(changes);
            }
      }, [edition, pendingValues, serverValueMap, saveAllMutation]);

      // ── Module/Category grouping ──
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

      // ── Overflow Policy ──
      const overflowPolicyMutation = useMutation({
            mutationFn: async (policy: string) => {
                  if (!edition) return;
                  await editionRepository.update(editionId, {
                        name: edition.name,
                        displayNameEn: edition.displayNameEn,
                        displayNameAr: edition.displayNameAr,
                        description: edition.description,
                        overflowPolicy: policy,
                  });
            },
            onSuccess: () => {
                  success({
                        title: "Overflow Policy Updated",
                        description: "The downgrade overflow policy has been saved.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
            },
            onError: (err) => {
                  toastError({
                        title: "Update Failed",
                        description: err instanceof Error ? err.message : "Failed to update overflow policy",
                  });
            },
      });

      const updateOverflowPolicy = useCallback((policy: string) => {
            overflowPolicyMutation.mutate(policy);
      }, [overflowPolicyMutation]);

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

            collapsedModules,
            toggleModule,
            expandAll,
            collapseAll,

            overflowPolicy: edition?.overflowPolicy ?? 'Block',
            updateOverflowPolicy,
            isUpdatingOverflowPolicy: overflowPolicyMutation.isPending,
      };
}
