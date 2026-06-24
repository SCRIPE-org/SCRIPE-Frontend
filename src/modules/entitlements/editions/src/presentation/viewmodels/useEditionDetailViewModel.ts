// FILE-EXCEPTION: file length
"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import type { Edition } from "../../domain/entities/Edition";
import {
  Feature,
  type FeatureModuleGroup,
} from "@modules/entitlements/features/src/domain/entities/Feature";

// ── Disabled defaults ──
function getDisabledDefault(valueType: string): string {
  switch (valueType?.toLowerCase()) {
    case "boolean":
      return "false";
    case "numeric":
      return "0";
    default:
      return "";
  }
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for edition detail view model result.
 */
export interface EditionDetailViewModelResult {
  edition: Edition | undefined;
  /**
   * Backend-grouped features: Module → Category → Feature[].
   * ZERO client-side groupBy. FeaturesTab renders this tree directly.
   */
  moduleGroups: FeatureModuleGroup[];
  isLoading: boolean;
  error: Error | null;

  // ── Feature state (local pending changes) ──
  pendingValues: Record<string, string>;
  pendingLabels: Record<string, { en?: string; ar?: string }>;
  pendingHighlights: Record<string, { isHighlight?: boolean; highlightOrder?: number }>;
  getEffectiveValue: (feature: Feature) => string;
  getEffectiveLabel: (featureName: string) => { en: string; ar: string };
  getEffectiveHighlight: (featureName: string) => { isHighlight: boolean; highlightOrder: number };
  setLocalValue: (featureName: string, value: string) => void;
  setLocalLabel: (featureName: string, field: "en" | "ar", value: string) => void;
  setLocalHighlight: (
    featureName: string,
    field: "isHighlight" | "highlightOrder",
    value: boolean | number
  ) => void;
  hasUnsavedChanges: boolean;

  // ── Version-based apply ──
  createVersionWithChanges: (changeNotes?: string) => void;
  isCreatingVersion: boolean;

  // ── Direct apply ──
  directApplyChanges: () => void;
  isDirectApplying: boolean;

  // ── Discard ──
  discardChanges: () => void;

  // ── Remove Feature ──
  removeFeature: (featureId: string) => void;
  isRemovingFeature: boolean;

  // ── Module/Category collapse state ──
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

/**
 * React hook/ViewModel orchestrating state and data flows for edition detail view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function useEditionDetailViewModel(editionId: string): EditionDetailViewModelResult {
  const { success, error: toastError } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { editionRepository, featureRepository } = entitlementsContainer;

  // ── System admin detection (tenantId == null) ──
  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const isSystemAdmin = !userTenantId;

  // ── Edition Query ──
  const {
    data: edition,
    isLoading: isEditionLoading,
    error: editionError,
  } = useQuery({
    queryKey: ["entitlements", "editions", editionId],
    queryFn: () => editionRepository.getById(editionId),
    enabled: !!editionId,
  });

  // ── System admin: grouped features from backend (Module → Category → Feature[]) ──
  // Backend sends the tree — ZERO client-side groupBy.
  const {
    data: catalogModuleGroups = [],
    isLoading: isCatalogLoading,
    error: catalogError,
  } = useQuery({
    queryKey: ["entitlements", "features", "grouped"],
    queryFn: () => featureRepository.getGrouped(),
    enabled: isSystemAdmin,
  });

  // ── Tenant admin: fetch only their effective features ──
  const {
    data: effectiveFeatures,
    isLoading: isEffectiveLoading,
    error: effectiveError,
  } = useQuery({
    queryKey: ["entitlements", "effective-features", "for-edition"],
    queryFn: () => featureRepository.getEffective(),
    enabled: !isSystemAdmin,
  });

  // ── Map effective features → FeatureModuleGroup[] for tenant admins ──
  // This mapping is needed because tenant gets TenantEffectiveFeature (not Feature).
  // We reconstruct a Module → Category tree from the flat effective list.
  const { tenantModuleGroups, tenantEffectiveCaps } = useMemo(() => {
    if (isSystemAdmin || !effectiveFeatures) {
      return {
        tenantModuleGroups: [] as FeatureModuleGroup[],
        tenantEffectiveCaps: {} as Record<string, string>,
      };
    }

    const caps: Record<string, string> = {};
    const moduleMap = new Map<string, Map<string, Feature[]>>();

    effectiveFeatures.forEach((ef) => {
      caps[ef.name] = ef.effectiveValue;

      const mod = ef.module || "General";
      const cat = ef.category || "General";

      if (!moduleMap.has(mod)) moduleMap.set(mod, new Map());
      const catMap = moduleMap.get(mod)!;
      if (!catMap.has(cat)) catMap.set(cat, []);

      catMap.get(cat)!.push(
        new Feature({
          id: ef.featureId,
          name: ef.name,
          displayNameEn: ef.displayNameEn,
          displayNameAr: ef.displayNameAr,
          category: cat,
          sortOrder: 0,
          isVisibleInUI: true,
          valueType: ef.valueType as "Boolean" | "Numeric" | "String",
          defaultValue: ef.effectiveValue,
          module: mod,
          isSystem: false,
          isMarketingOnly: false,
          createdAt: "",
        })
      );
    });

    const groups: FeatureModuleGroup[] = Array.from(moduleMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, catMap]) => ({
        module,
        categories: Array.from(catMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, features]) => ({ category, features })),
      }));

    return { tenantModuleGroups: groups, tenantEffectiveCaps: caps };
  }, [isSystemAdmin, effectiveFeatures]);

  // ── Resolved module groups ──
  const moduleGroups = isSystemAdmin ? catalogModuleGroups : tenantModuleGroups;
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
  // ── Local pending display labels (keyed by featureName) ──
  const [pendingLabels, setPendingLabels] = useState<Record<string, { en?: string; ar?: string }>>(
    {}
  );
  // ── Local pending highlight state (keyed by featureName) ──
  const [pendingHighlights, setPendingHighlights] = useState<
    Record<string, { isHighlight?: boolean; highlightOrder?: number }>
  >({});

  // ── Overflow Policy (local state — not auto-saved) ──
  const [localOverflowPolicy, setLocalOverflowPolicy] = useState("Block");

  // Sync pending values, labels, and highlights when edition data changes
  const [lastEditionId, setLastEditionId] = useState<string | undefined>();
  if (edition && edition.id !== lastEditionId) {
    const serverLabels: Record<string, { en?: string; ar?: string }> = {};
    const serverHighlightSnapshot: Record<
      string,
      { isHighlight?: boolean; highlightOrder?: number }
    > = {};
    edition.features.forEach((ef) => {
      if (ef.displayLabelEn || ef.displayLabelAr) {
        serverLabels[ef.featureName] = { en: ef.displayLabelEn ?? "", ar: ef.displayLabelAr ?? "" };
      }
      if (ef.isHighlight !== undefined || ef.highlightOrder !== undefined) {
        serverHighlightSnapshot[ef.featureName] = {
          isHighlight: ef.isHighlight ?? false,
          highlightOrder: ef.highlightOrder ?? 0,
        };
      }
    });
    setPendingValues(serverValueMap);
    setPendingLabels(serverLabels);
    setPendingHighlights(serverHighlightSnapshot);
    setLastEditionId(edition.id);
  }

  // Get effective value: pending → server → disabled default
  const getEffectiveValue = useCallback(
    (feature: Feature): string => {
      const name = feature.name;
      if (pendingValues && pendingValues[name] !== undefined) return pendingValues[name];
      if (serverValueMap[name] !== undefined) return serverValueMap[name];
      return getDisabledDefault(feature.valueType);
    },
    [pendingValues, serverValueMap]
  );

  // Get effective display label: pending → server → empty
  const serverLabelMap = useMemo(() => {
    const map: Record<string, { en: string; ar: string }> = {};
    if (edition) {
      edition.features.forEach((ef) => {
        map[ef.featureName] = {
          en: ef.displayLabelEn ?? "",
          ar: ef.displayLabelAr ?? "",
        };
      });
    }
    return map;
  }, [edition]);

  const getEffectiveLabel = useCallback(
    (featureName: string): { en: string; ar: string } => {
      const pending = pendingLabels[featureName];
      const server = serverLabelMap[featureName];
      return {
        en: pending?.en !== undefined ? pending.en : (server?.en ?? ""),
        ar: pending?.ar !== undefined ? pending.ar : (server?.ar ?? ""),
      };
    },
    [pendingLabels, serverLabelMap]
  );

  // Set a local value (no API call)
  const setLocalValue = useCallback((featureName: string, value: string) => {
    setPendingValues((prev) => ({ ...(prev ?? {}), [featureName]: value }));
  }, []);

  // Set a local display label (no API call)
  const setLocalLabel = useCallback((featureName: string, field: "en" | "ar", value: string) => {
    setPendingLabels((prev) => ({
      ...prev,
      [featureName]: { ...(prev[featureName] ?? {}), [field]: value },
    }));
  }, []);

  // ── Highlight state ──
  const serverHighlightMap = useMemo(() => {
    const map: Record<string, { isHighlight: boolean; highlightOrder: number }> = {};
    if (edition) {
      edition.features.forEach((ef) => {
        map[ef.featureName] = {
          isHighlight: ef.isHighlight ?? false,
          highlightOrder: ef.highlightOrder ?? 0,
        };
      });
    }
    return map;
  }, [edition]);

  const getEffectiveHighlight = useCallback(
    (featureName: string): { isHighlight: boolean; highlightOrder: number } => {
      const pending = pendingHighlights[featureName];
      const server = serverHighlightMap[featureName];
      return {
        isHighlight:
          pending?.isHighlight !== undefined ? pending.isHighlight : (server?.isHighlight ?? false),
        highlightOrder:
          pending?.highlightOrder !== undefined
            ? pending.highlightOrder
            : (server?.highlightOrder ?? 0),
      };
    },
    [pendingHighlights, serverHighlightMap]
  );

  const setLocalHighlight = useCallback(
    (featureName: string, field: "isHighlight" | "highlightOrder", value: boolean | number) => {
      setPendingHighlights((prev) => ({
        ...prev,
        [featureName]: { ...(prev[featureName] ?? {}), [field]: value },
      }));
    },
    []
  );

  // Check for unsaved changes (features + labels + highlights + overflow policy)
  const hasUnsavedChanges = useMemo(() => {
    if (!edition) return false;
    for (const [name, val] of Object.entries(pendingValues ?? {})) {
      if (serverValueMap[name] !== val) return true;
    }
    for (const [name, labels] of Object.entries(pendingLabels)) {
      const server = serverLabelMap[name];
      if ((labels.en ?? "") !== (server?.en ?? "")) return true;
      if ((labels.ar ?? "") !== (server?.ar ?? "")) return true;
    }
    for (const [name, h] of Object.entries(pendingHighlights)) {
      const server = serverHighlightMap[name];
      if ((h.isHighlight ?? false) !== (server?.isHighlight ?? false)) return true;
      if ((h.highlightOrder ?? 0) !== (server?.highlightOrder ?? 0)) return true;
    }
    return false;
  }, [
    edition,
    pendingValues,
    serverValueMap,
    pendingLabels,
    serverLabelMap,
    pendingHighlights,
    serverHighlightMap,
  ]);

  const discardChanges = useCallback(() => {
    setPendingValues(serverValueMap);
    const serverLabels: Record<string, { en?: string; ar?: string }> = {};
    const serverHighlightSnapshot: Record<
      string,
      { isHighlight?: boolean; highlightOrder?: number }
    > = {};
    edition?.features.forEach((ef) => {
      if (ef.displayLabelEn || ef.displayLabelAr) {
        serverLabels[ef.featureName] = { en: ef.displayLabelEn ?? "", ar: ef.displayLabelAr ?? "" };
      }
      if (ef.isHighlight !== undefined || ef.highlightOrder !== undefined) {
        serverHighlightSnapshot[ef.featureName] = {
          isHighlight: ef.isHighlight ?? false,
          highlightOrder: ef.highlightOrder ?? 0,
        };
      }
    });
    setPendingLabels(serverLabels);
    setPendingHighlights(serverHighlightSnapshot);
    if (edition) {
      setLocalOverflowPolicy(edition.overflowPolicy ?? "Block");
    }
  }, [serverValueMap, edition]);

  // ── Build the changed feature map (featureName → newValue) ──
  const getChangedFeatures = useCallback((): Record<string, string> => {
    const changes: Record<string, string> = {};
    for (const [name, val] of Object.entries(pendingValues ?? {})) {
      if (serverValueMap[name] !== val) {
        changes[name] = val;
      }
    }
    return changes;
  }, [pendingValues, serverValueMap]);

  // ── Create Version with pending changes + pricing snapshot ──
  const createVersionMutation = useMutation({
    mutationFn: async ({ changeNotes }: { changeNotes?: string }) => {
      let pricingSnapshot:
        | Array<{ currency: string; billingCycle: string; amount: number }>
        | undefined;
      try {
        const priceData = await editionRepository.getEditionPrices(editionId);
        if (priceData?.prices && priceData.prices.length > 0) {
          pricingSnapshot = priceData.prices.map(
            (p: { currency: string; billingCycle: string; amount: number }) => ({
              currency: p.currency,
              billingCycle: p.billingCycle,
              amount: p.amount,
            })
          );
        }
      } catch {
        // If pricing fetch fails, still create version with just features
      }
      return editionRepository.createVersion(
        editionId,
        changeNotes,
        pendingValues,
        pricingSnapshot,
        pendingLabels
      );
    },
    onSuccess: () => {
      success({
        title: t("entitlements.editions.versions.created") || "Version Created",
        description:
          t("entitlements.editions.versions.createdDesc") ||
          "Feature and pricing changes captured in a new draft version.",
      });
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "editions", editionId, "versions"],
      });
    },
    onError: (err) => {
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.error"),
      });
    },
  });

  const createVersionWithChanges = useCallback(
    (changeNotes?: string) => {
      createVersionMutation.mutate({ changeNotes });
    },
    [createVersionMutation]
  );

  // ── Direct Apply (save features immediately + sync tenants) ──
  const directApplyMutation = useMutation({
    mutationFn: async () => {
      if (localOverflowPolicy !== (edition?.overflowPolicy ?? "Block")) {
        await editionRepository.update(editionId, {
          name: edition!.name,
          displayNameEn: edition!.displayNameEn,
          displayNameAr: edition!.displayNameAr,
          description: edition!.description,
          overflowPolicy: localOverflowPolicy,
        });
      }
      const changes = getChangedFeatures();
      const changedLabels: Record<string, { en?: string; ar?: string }> = {};
      for (const [name, labels] of Object.entries(pendingLabels)) {
        const server = serverLabelMap[name];
        if ((labels.en ?? "") !== (server?.en ?? "") || (labels.ar ?? "") !== (server?.ar ?? "")) {
          changedLabels[name] = labels;
        }
      }
      // Detect changed highlights
      const changedHighlights: Record<string, { isHighlight: boolean; highlightOrder: number }> =
        {};
      for (const [name, h] of Object.entries(pendingHighlights)) {
        const server = serverHighlightMap[name];
        if (
          (h.isHighlight ?? false) !== (server?.isHighlight ?? false) ||
          (h.highlightOrder ?? 0) !== (server?.highlightOrder ?? 0)
        ) {
          changedHighlights[name] = {
            isHighlight: h.isHighlight ?? false,
            highlightOrder: h.highlightOrder ?? 0,
          };
        }
      }
      const hasFeatureChanges =
        Object.keys(changes).length > 0 || Object.keys(changedLabels).length > 0;
      const hasHighlightChanges = Object.keys(changedHighlights).length > 0;
      if (!hasFeatureChanges && !hasHighlightChanges) return;
      // Apply feature value + label changes via batch endpoint
      if (hasFeatureChanges) {
        await editionRepository.directApplyFeatures(editionId, changes, changedLabels);
      }
      // Apply highlight changes individually (no batch endpoint for highlights)
      if (hasHighlightChanges && edition) {
        const featureIdMap: Record<string, string> = {};
        edition.features.forEach((ef) => {
          featureIdMap[ef.featureName] = ef.featureId;
        });
        await Promise.all(
          Object.entries(changedHighlights).map(
            ([featureName, { isHighlight, highlightOrder }]) => {
              const featureId = featureIdMap[featureName];
              if (!featureId) return Promise.resolve();
              const currentValue = pendingValues[featureName] ?? serverValueMap[featureName] ?? "";
              const currentLabel = getEffectiveLabel(featureName);
              return editionRepository.setFeatureValue(
                editionId,
                featureId,
                currentValue,
                currentLabel.en || undefined,
                currentLabel.ar || undefined,
                isHighlight,
                highlightOrder
              );
            }
          )
        );
      }
    },
    onSuccess: () => {
      success({
        title: t("entitlements.editions.changesApplied") || "Changes Applied",
        description:
          t("entitlements.editions.changesAppliedDesc") ||
          "Features updated and all affected tenants synced.",
      });
      queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "editions", editionId, "versions"],
      });
    },
    onError: (err) => {
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.error"),
      });
    },
  });

  const directApplyChanges = useCallback(() => {
    directApplyMutation.mutate();
  }, [directApplyMutation]);

  // ── Remove Feature Mutation ──
  const removeFeatureMutation = useMutation({
    mutationFn: async (featureId: string) => {
      await editionRepository.removeFeature(editionId, featureId);
    },
    onSuccess: () => {
      success({
        title: t("entitlements.editions.featureRemoved") || "Feature Removed",
        description:
          t("entitlements.editions.featureRemovedDesc") ||
          "The feature has been detached from this edition.",
      });
      queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
    },
    onError: (err) => {
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.error"),
      });
    },
  });

  const removeFeature = useCallback(
    (featureId: string) => {
      removeFeatureMutation.mutate(featureId);
    },
    [removeFeatureMutation]
  );

  // ── Module/Category collapse state ──
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const toggleModule = useCallback((moduleName: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  }, []);

  // Auto-collapse all modules on first load
  const [prevModuleGroups, setPrevModuleGroups] = useState(moduleGroups);
  if (moduleGroups !== prevModuleGroups && moduleGroups.length > 0) {
    setPrevModuleGroups(moduleGroups);
    const collapsed: Record<string, boolean> = {};
    moduleGroups.forEach((mg) => {
      collapsed[mg.module] = true;
    });
    setCollapsedModules(collapsed);
  }

  const expandAll = useCallback(() => {
    setCollapsedModules((prev) => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach((k) => {
        next[k] = false;
      });
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedModules((prev) => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach((k) => {
        next[k] = true;
      });
      return next;
    });
  }, []);

  // Sync overflow policy from server
  const [prevEdition, setPrevEdition] = useState(edition);
  if (edition !== prevEdition) {
    setPrevEdition(edition);
    if (edition) {
      setLocalOverflowPolicy(edition.overflowPolicy ?? "Block");
    }
  }

  const overflowPolicyChanged = useMemo(() => {
    if (!edition) return false;
    return localOverflowPolicy !== (edition.overflowPolicy ?? "Block");
  }, [localOverflowPolicy, edition]);

  // Combined unsaved — features or overflow policy
  const combinedHasUnsavedChanges = hasUnsavedChanges || overflowPolicyChanged;

  return {
    edition,
    moduleGroups,
    isLoading: isEditionLoading || isFeaturesLoading,
    error: (editionError as Error) || (featuresError as Error) || null,

    pendingValues: pendingValues ?? {},
    pendingLabels,
    pendingHighlights,
    getEffectiveValue,
    getEffectiveLabel,
    getEffectiveHighlight,
    setLocalValue,
    setLocalLabel,
    setLocalHighlight,
    hasUnsavedChanges: combinedHasUnsavedChanges,

    createVersionWithChanges,
    isCreatingVersion: createVersionMutation.isPending,

    directApplyChanges,
    isDirectApplying: directApplyMutation.isPending,

    discardChanges,

    removeFeature,
    isRemovingFeature: removeFeatureMutation.isPending,

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
