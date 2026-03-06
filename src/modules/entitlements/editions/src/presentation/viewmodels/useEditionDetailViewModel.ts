"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useAppStore } from "@core/store/useAppStore";
import type { Edition } from "../../domain/entities/Edition";
import { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";

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
      pendingValues: Record<string, string>;
      getEffectiveValue: (feature: Feature) => string;
      setLocalValue: (featureName: string, value: string) => void;
      hasUnsavedChanges: boolean;

      // ── Version-based apply ──
      createVersionWithChanges: (changeNotes?: string) => void;
      isCreatingVersion: boolean;

      // ── Direct apply ──
      directApplyChanges: () => void;
      isDirectApplying: boolean;

      // ── Discard ──
      discardChanges: () => void;

      // ── Module/Category grouping ──
      collapsedModules: Record<string, boolean>;
      toggleModule: (moduleName: string) => void;
      expandAll: () => void;
      collapseAll: () => void;

      // ── Overflow Policy (local, not auto-saved) ──
      overflowPolicy: string;
      setOverflowPolicy: (policy: string) => void;
      overflowPolicyChanged: boolean;

      // ── Context info ──
      isSystemAdmin: boolean;
      /** For tenant admins: maps featureName → tenant's effective value (cap) */
      tenantEffectiveCaps: Record<string, string>;
}

export function useEditionDetailViewModel(editionId: string): EditionDetailViewModelResult {
      const { success, error: toastError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const { editionRepository, featureRepository } = entitlementsContainer;

      // ── System admin detection (tenantId == null) ──
      const userTenantId = useAppStore((s) => s.user?.tenantId);
      const isSystemAdmin = !userTenantId;

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

      // System admin: fetch ALL features from catalog
      const {
            data: catalogResult,
            isLoading: isCatalogLoading,
            error: catalogError,
      } = useQuery({
            queryKey: ["entitlements", "features", "all"],
            queryFn: () => featureRepository.getAll({ page: 1, pageSize: 1000 }),
            enabled: isSystemAdmin,
      });

      // Tenant admin: fetch only their effective features
      const {
            data: effectiveFeatures,
            isLoading: isEffectiveLoading,
            error: effectiveError,
      } = useQuery({
            queryKey: ["entitlements", "effective-features", "for-edition"],
            queryFn: () => featureRepository.getEffective(),
            enabled: !isSystemAdmin,
      });

      // ── Map effective features to Feature-compatible objects ──
      const { mappedFeatures, tenantEffectiveCaps } = useMemo(() => {
            if (isSystemAdmin || !effectiveFeatures) {
                  return { mappedFeatures: undefined, tenantEffectiveCaps: {} as Record<string, string> };
            }
            const caps: Record<string, string> = {};
            const features: Feature[] = effectiveFeatures.map((ef) => {
                  caps[ef.name] = ef.effectiveValue;
                  return new Feature({
                        id: ef.featureId,
                        name: ef.name,
                        displayNameEn: ef.displayNameEn,
                        displayNameAr: ef.displayNameAr,
                        category: ef.category,
                        sortOrder: 0,
                        isVisibleInUI: true,
                        valueType: ef.valueType as "Boolean" | "Numeric" | "String",
                        defaultValue: ef.effectiveValue,
                        module: ef.module || "Other",
                        isSystem: false,
                        createdAt: "",
                  });
            });
            return { mappedFeatures: features, tenantEffectiveCaps: caps };
      }, [isSystemAdmin, effectiveFeatures]);

      // ── Resolved features list ──
      const resolvedFeatures = isSystemAdmin ? catalogResult?.items : mappedFeatures;
      const isFeaturesLoading = isSystemAdmin ? isCatalogLoading : isEffectiveLoading;
      const featuresError = isSystemAdmin ? catalogError : effectiveError;

      // ── Server map: featureName → value (from edition features) ──
      const serverValueMap = useMemo(() => {
            const map: Record<string, string> = {};
            if (edition) {
                  for (const ef of edition.features) {
                        map[ef.featureName] = ef.value;
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

      // Check for unsaved changes (features + overflow policy)
      const hasUnsavedChanges = useMemo(() => {
            if (!edition) return false;
            // Check feature changes
            for (const [name, val] of Object.entries(pendingValues)) {
                  if (serverValueMap[name] !== val) return true;
            }
            return false;
      }, [edition, pendingValues, serverValueMap]);

      const discardChanges = useCallback(() => {
            setPendingValues(serverValueMap);
            if (edition) {
                  setLocalOverflowPolicy(edition.overflowPolicy ?? "Block");
            }
      }, [serverValueMap, edition]);

      // ── Build the changed feature map (featureName → newValue) ──
      const getChangedFeatures = useCallback((): Record<string, string> => {
            const changes: Record<string, string> = {};
            for (const [name, val] of Object.entries(pendingValues)) {
                  if (serverValueMap[name] !== val) {
                        changes[name] = val;
                  }
            }
            return changes;
      }, [pendingValues, serverValueMap]);

      // ── Create Version with pending changes + pricing snapshot ──
      const createVersionMutation = useMutation({
            mutationFn: async ({ changeNotes }: { changeNotes?: string }) => {
                  // Fetch current pricing to include in the version snapshot
                  let pricingSnapshot: Array<{ currency: string; billingCycle: string; amount: number }> | undefined;
                  try {
                        const priceData = await editionRepository.getEditionPrices(editionId);
                        if (priceData?.prices && priceData.prices.length > 0) {
                              pricingSnapshot = priceData.prices.map((p: { currency: string; billingCycle: string; amount: number }) => ({
                                    currency: p.currency,
                                    billingCycle: p.billingCycle,
                                    amount: p.amount,
                              }));
                        }
                  } catch {
                        // If pricing fetch fails, still create version with just features
                  }
                  // Send ALL pending feature values (full snapshot) + pricing snapshot
                  return editionRepository.createVersion(editionId, changeNotes, pendingValues, pricingSnapshot);
            },
            onSuccess: () => {
                  success({
                        title: "Version Created",
                        description: "Feature and pricing changes captured in a new draft version. Publish it to apply.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId, "versions"] });
            },
            onError: (err) => {
                  toastError({
                        title: "Version Creation Failed",
                        description: err instanceof Error ? err.message : "Failed to create version",
                  });
            },
      });

      const createVersionWithChanges = useCallback((changeNotes?: string) => {
            createVersionMutation.mutate({ changeNotes });
      }, [createVersionMutation]);

      // ── Direct Apply (save features immediately + sync tenants) ──
      const directApplyMutation = useMutation({
            mutationFn: async () => {
                  const changes = getChangedFeatures();
                  if (Object.keys(changes).length === 0) return;
                  // Also update overflow policy if changed
                  if (localOverflowPolicy !== (edition?.overflowPolicy ?? "Block")) {
                        await editionRepository.update(editionId, {
                              name: edition!.name,
                              displayNameEn: edition!.displayNameEn,
                              displayNameAr: edition!.displayNameAr,
                              description: edition!.description,
                              overflowPolicy: localOverflowPolicy,
                        });
                  }
                  await editionRepository.directApplyFeatures(editionId, changes);
            },
            onSuccess: () => {
                  success({
                        title: "Changes Applied",
                        description: "Features updated and all affected tenants synced.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId, "versions"] });
            },
            onError: (err) => {
                  toastError({
                        title: "Apply Failed",
                        description: err instanceof Error ? err.message : "Failed to apply changes",
                  });
            },
      });

      const directApplyChanges = useCallback(() => {
            directApplyMutation.mutate();
      }, [directApplyMutation]);

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
            if (resolvedFeatures) {
                  const modules = new Set(resolvedFeatures.map((f: Feature) => f.module));
                  const collapsed: Record<string, boolean> = {};
                  modules.forEach((m: string) => { collapsed[m] = true; });
                  setCollapsedModules(collapsed);
            }
      }, [resolvedFeatures]);

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

      // ── Overflow Policy (local state — not auto-saved) ──
      const [localOverflowPolicy, setLocalOverflowPolicy] = useState("Block");

      // Sync overflow policy from server
      useEffect(() => {
            if (edition) {
                  setLocalOverflowPolicy(edition.overflowPolicy ?? "Block");
            }
      }, [edition]);

      const overflowPolicyChanged = useMemo(() => {
            if (!edition) return false;
            return localOverflowPolicy !== (edition.overflowPolicy ?? "Block");
      }, [localOverflowPolicy, edition]);

      // Combined unsaved — features or overflow policy
      const combinedHasUnsavedChanges = hasUnsavedChanges || overflowPolicyChanged;

      return {
            edition,
            features: resolvedFeatures,
            isLoading: isEditionLoading || isFeaturesLoading,
            error: (editionError as Error) || (featuresError as Error) || null,

            pendingValues,
            getEffectiveValue,
            setLocalValue,
            hasUnsavedChanges: combinedHasUnsavedChanges,

            createVersionWithChanges,
            isCreatingVersion: createVersionMutation.isPending,

            directApplyChanges,
            isDirectApplying: directApplyMutation.isPending,

            discardChanges,

            collapsedModules,
            toggleModule,
            expandAll,
            collapseAll,

            overflowPolicy: localOverflowPolicy,
            setOverflowPolicy: setLocalOverflowPolicy,
            overflowPolicyChanged,

            isSystemAdmin,
            tenantEffectiveCaps,
      };
}
