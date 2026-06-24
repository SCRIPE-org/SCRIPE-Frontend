// FILE-EXCEPTION: file length
/**
 * TenantPlan Detail ViewModel — Elevated Tier 2
 *
 * Fetches a single plan by ID with its features, prices, and versions.
 * Provides lifecycle mutations (publish/archive) and sub-entity CRUD.
 *
 * CRITICAL: Features and Prices state are lifted HERE so they persist
 * across tab switches (components mount/unmount but this hook stays alive
 * in the parent TenantPlanDetailView).
 *
 * Pricing follows the HYBRID PRICING MODEL (mirrors Edition pricing):
 * - USD is the anchor currency (always present, cannot be removed)
 * - Other currencies are OPTIONAL OVERRIDES with auto-suggest from exchange rates
 * - Live preview shows what tenants would actually pay (explicit OR auto-converted)
 */
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type {
  TenantPlan,
  TenantFeatureDefinition,
  TenantFeatureDefinitionCategoryGroup,
} from "../../domain/entities/TenantPlan";
import type {
  UpdateTenantPlanRequest,
  UpsertTenantPlanFeatureRequest,
  UpsertTenantPlanPriceRequest,
} from "../../domain/entities/TenantPlanRequests";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";

// ── Types for Hybrid Pricing Model ──
interface PriceRow {
  currency: string;
  monthlyAmount: number;
  yearlyAmount: number;
  lifetimeAmount: number;
}

/**
 * Interface structure detailing the properties and attributes of Preview Row.
 */
export interface PreviewRow {
  currency: string;
  monthlyAmount: number;
  yearlyAmount: number;
  lifetimeAmount: number;
  source: "explicit" | "auto";
  rate?: number;
}

/**
 * React hook/ViewModel managing logic, state, and repository queries for tenant plan detail view model.
 */
export function useTenantPlanDetailViewModel(planId: string) {
  const { success, error: showError } = useEnhancedToast();
  const { tenantPlanRepository, editionRepository } = entitlementsContainer;
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const queryKey = ["entitlements", "tenant-plans", planId];

  // ── Fetch Plan Detail ──
  const {
    data: plan,
    isLoading,
    error,
    refetch,
  } = useQuery<TenantPlan>({
    queryKey,
    queryFn: () => tenantPlanRepository.getById(planId),
    enabled: !!planId,
  });

  // ── Fetch Feature Catalog — backend-grouped by category (zero client-side groupBy) ──
  const { data: activeFeatureGroups = [] } = useQuery<TenantFeatureDefinitionCategoryGroup[]>({
    queryKey: ["entitlements", "feature-definitions", "active-grouped"],
    queryFn: () => tenantPlanRepository.getActiveGroupedFeatureDefinitions(),
    staleTime: 5 * 60 * 1000,
  });

  // Flatten active groups to a lookup map (id → entity) for assignments and catalog access
  const featureCatalogMap = useMemo(() => {
    const map = new Map<string, TenantFeatureDefinition>();
    for (const group of activeFeatureGroups) {
      for (const def of group.definitions) {
        map.set(def.id, def);
      }
    }
    return map;
  }, [activeFeatureGroups]);

  // Flat list of ALL active features (for badge counts, etc.)
  const featureCatalog = useMemo(() => Array.from(featureCatalogMap.values()), [featureCatalogMap]);

  // ── Fetch Exchange Rates (for currency overrides — mirrors Edition) ──
  const { data: exchangeRates, isLoading: ratesLoading } = useQuery<Record<string, number>>({
    queryKey: ["entitlements", "exchangeRates", "USD"],
    queryFn: () => editionRepository.getExchangeRates("USD"),
    staleTime: 5 * 60 * 1000,
  });

  // ═══════════════════════════════════════════════════════════════════
  // LIFTED STATE — persists across tab switches
  // ═══════════════════════════════════════════════════════════════════

  // ── Features State ──
  const [localFeatures, setLocalFeatures] = useState<
    Map<string, { value: string; overrideLabel?: string }>
  >(new Map());
  const featuresInitRef = useRef(false);

  // ── Pricing State (Hybrid Model — mirrors Edition) ──
  const [localUsdMonthly, setLocalUsdMonthly] = useState<number | null>(null);
  const [localUsdYearly, setLocalUsdYearly] = useState<number | null>(null);
  const [localUsdLifetime, setLocalUsdLifetime] = useState<number | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Map<string, PriceRow> | null>(null);
  const [removedOverrides, setRemovedOverrides] = useState<Set<string>>(new Set());
  const [addedOverrides, setAddedOverrides] = useState<Map<string, PriceRow>>(new Map());
  const [yearlyDiscountPercent, setYearlyDiscountPercent] = useState(20);
  const pricesInitRef = useRef(false);

  // ── Parse server data into USD base + overrides (mirrors Edition) ──
  const serverPricingData = useMemo(() => {
    const usd: PriceRow = { currency: "USD", monthlyAmount: 0, yearlyAmount: 0, lifetimeAmount: 0 };
    const others: PriceRow[] = [];

    if (plan?.prices) {
      for (const p of plan.prices) {
        const cur = p.currency || "USD";
        if (cur === "USD") {
          if (p.billingCycle === "Monthly") usd.monthlyAmount = p.amount;
          if (p.billingCycle === "Yearly") usd.yearlyAmount = p.amount;
          if (p.billingCycle === "Lifetime") usd.lifetimeAmount = p.amount;
        } else {
          let row = others.find((o) => o.currency === cur);
          if (!row) {
            row = { currency: cur, monthlyAmount: 0, yearlyAmount: 0, lifetimeAmount: 0 };
            others.push(row);
          }
          if (p.billingCycle === "Monthly") row.monthlyAmount = p.amount;
          if (p.billingCycle === "Yearly") row.yearlyAmount = p.amount;
          if (p.billingCycle === "Lifetime") row.lifetimeAmount = p.amount;
        }
      }
    }

    return { usd, others };
  }, [plan]);

  // ── Effective USD values ──
  const usdMonthly = localUsdMonthly ?? serverPricingData.usd.monthlyAmount;
  const usdYearly = localUsdYearly ?? serverPricingData.usd.yearlyAmount;
  const usdLifetime = localUsdLifetime ?? serverPricingData.usd.lifetimeAmount;
  const suggestedYearly =
    Math.round(usdMonthly * 12 * (1 - yearlyDiscountPercent / 100) * 100) / 100;

  // ── Effective overrides (merged: server + local edits + added - removed) ──
  const overrides = useMemo((): PriceRow[] => {
    const merged = new Map<string, PriceRow>();

    for (const row of serverPricingData.others) {
      if (!removedOverrides.has(row.currency)) {
        merged.set(row.currency, { ...row });
      }
    }

    if (localOverrides) {
      for (const [code, row] of localOverrides) {
        if (!removedOverrides.has(code)) {
          merged.set(code, { ...row });
        }
      }
    }

    for (const [code, row] of addedOverrides) {
      if (!removedOverrides.has(code)) {
        merged.set(code, { ...row });
      }
    }

    return Array.from(merged.values()).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [serverPricingData.others, localOverrides, removedOverrides, addedOverrides]);

  // ── Available currencies ──
  const usedCurrencyCodes = useMemo(() => new Set(overrides.map((o) => o.currency)), [overrides]);
  const availableCurrencies = useMemo(
    () => SUPPORTED_CURRENCIES.filter((c) => c.code !== "USD" && !usedCurrencyCodes.has(c.code)),
    [usedCurrencyCodes]
  );

  // ─── Initialize features from server data (once per plan load) ───
  const [prevPlanId, setPrevPlanId] = useState(plan?.id);
  if (plan?.id !== prevPlanId) {
    setPrevPlanId(plan?.id);
    if (plan) {
      const map = new Map<string, { value: string; overrideLabel?: string }>();
      for (const f of plan.features || []) {
        map.set(f.featureDefinitionId, {
          value: f.value,
          overrideLabel: f.overrideLabel,
        });
      }
      setLocalFeatures(map);
    }
  }

  // ── Features Handlers ──
  const setFeatureValue = useCallback((defId: string, value: string) => {
    setLocalFeatures((prev) => {
      const next = new Map(prev);
      const existing = next.get(defId);
      next.set(defId, { value, overrideLabel: existing?.overrideLabel });
      return next;
    });
  }, []);

  const addFeature = useCallback((def: TenantFeatureDefinition) => {
    setLocalFeatures((prev) => {
      const next = new Map(prev);
      next.set(def.id, {
        value: def.defaultValue || (def.isBoolean ? "false" : "0"),
      });
      return next;
    });
  }, []);

  const removeFeature = useCallback((defId: string) => {
    setLocalFeatures((prev) => {
      const next = new Map(prev);
      next.delete(defId);
      return next;
    });
  }, []);

  const featuresHasChanges = useMemo(() => {
    if (!plan) return false;
    const originalMap = new Map<string, string>();
    for (const f of plan.features || []) {
      originalMap.set(f.featureDefinitionId, f.value);
    }
    if (localFeatures.size !== originalMap.size) return true;
    for (const [id, data] of localFeatures) {
      if (!originalMap.has(id) || originalMap.get(id) !== data.value) return true;
    }
    return false;
  }, [localFeatures, plan]);

  // ── Pricing Handlers (Hybrid Model — mirrors Edition) ──
  const addOverride = useCallback(
    (currencyCode: string) => {
      const rate = exchangeRates?.[currencyCode] ?? 1;
      const suggestedM = Math.round(usdMonthly * rate * 100) / 100;
      const suggestedY = Math.round(usdYearly * rate * 100) / 100;
      const suggestedL = Math.round(usdLifetime * rate * 100) / 100;

      setAddedOverrides((prev) => {
        const next = new Map(prev);
        next.set(currencyCode, {
          currency: currencyCode,
          monthlyAmount: suggestedM,
          yearlyAmount: suggestedY,
          lifetimeAmount: suggestedL,
        });
        return next;
      });

      setRemovedOverrides((prev) => {
        const next = new Set(prev);
        next.delete(currencyCode);
        return next;
      });
    },
    [exchangeRates, usdMonthly, usdYearly, usdLifetime]
  );

  const removeOverride = useCallback((currencyCode: string) => {
    setRemovedOverrides((prev) => new Set(prev).add(currencyCode));
    setAddedOverrides((prev) => {
      const next = new Map(prev);
      next.delete(currencyCode);
      return next;
    });
    setLocalOverrides((prev) => {
      if (!prev) return prev;
      const next = new Map(prev);
      next.delete(currencyCode);
      return next.size > 0 ? next : null;
    });
  }, []);

  const updateOverride = useCallback(
    (currency: string, field: "monthly" | "yearly" | "lifetime", amount: number) => {
      const fieldKey =
        field === "monthly"
          ? "monthlyAmount"
          : field === "yearly"
            ? "yearlyAmount"
            : "lifetimeAmount";

      if (addedOverrides.has(currency)) {
        setAddedOverrides((prev) => {
          const next = new Map(prev);
          const existing = next.get(currency)!;
          next.set(currency, { ...existing, [fieldKey]: amount });
          return next;
        });
      } else {
        setLocalOverrides((prev) => {
          const next = new Map(prev || new Map());
          const existing = next.get(currency) ||
            serverPricingData.others.find((o) => o.currency === currency) || {
              currency,
              monthlyAmount: 0,
              yearlyAmount: 0,
              lifetimeAmount: 0,
            };
          next.set(currency, { ...existing, [fieldKey]: amount });
          return next;
        });
      }
    },
    [addedOverrides, serverPricingData.others]
  );

  const applyDiscountToYearly = useCallback(() => {
    setLocalUsdYearly(suggestedYearly);
  }, [suggestedYearly]);

  // ── Live Preview (mirrors Edition) ──
  const preview = useMemo((): PreviewRow[] => {
    const rows: PreviewRow[] = [];

    rows.push({
      currency: "USD",
      monthlyAmount: usdMonthly,
      yearlyAmount: usdYearly,
      lifetimeAmount: usdLifetime,
      source: "explicit",
    });

    for (const curr of SUPPORTED_CURRENCIES) {
      if (curr.code === "USD") continue;

      const override = overrides.find((o) => o.currency === curr.code);
      if (override) {
        rows.push({
          currency: curr.code,
          monthlyAmount: override.monthlyAmount,
          yearlyAmount: override.yearlyAmount,
          lifetimeAmount: override.lifetimeAmount,
          source: "explicit",
        });
      } else if (exchangeRates?.[curr.code] && usdMonthly > 0) {
        const rate = exchangeRates[curr.code];
        rows.push({
          currency: curr.code,
          monthlyAmount: Math.round(usdMonthly * rate * 100) / 100,
          yearlyAmount: Math.round(usdYearly * rate * 100) / 100,
          lifetimeAmount: Math.round(usdLifetime * rate * 100) / 100,
          source: "auto",
          rate,
        });
      }
    }

    return rows;
  }, [usdMonthly, usdYearly, usdLifetime, overrides, exchangeRates]);

  // ── Yearly Savings ──
  const yearlySavingsPercent = useCallback(
    (currency: string): number => {
      let monthly: number, yearly: number;

      if (currency === "USD") {
        monthly = usdMonthly;
        yearly = usdYearly;
      } else {
        const row =
          overrides.find((o) => o.currency === currency) ||
          preview.find((p) => p.currency === currency);
        if (!row) return 0;
        monthly = row.monthlyAmount;
        yearly = row.yearlyAmount;
      }

      if (monthly <= 0 || yearly <= 0) return 0;
      const monthlyEquiv = monthly * 12;
      return Math.round(((monthlyEquiv - yearly) / monthlyEquiv) * 100);
    },
    [usdMonthly, usdYearly, overrides, preview]
  );

  // ── Dirty tracking (pricing) ──
  const pricesHasChanges = useMemo(() => {
    if (localUsdMonthly !== null && localUsdMonthly !== serverPricingData.usd.monthlyAmount)
      return true;
    if (localUsdYearly !== null && localUsdYearly !== serverPricingData.usd.yearlyAmount)
      return true;
    if (localUsdLifetime !== null && localUsdLifetime !== serverPricingData.usd.lifetimeAmount)
      return true;
    if (removedOverrides.size > 0) return true;
    if (addedOverrides.size > 0) return true;
    if (localOverrides && localOverrides.size > 0) return true;
    return false;
  }, [
    localUsdMonthly,
    localUsdYearly,
    localUsdLifetime,
    removedOverrides,
    addedOverrides,
    localOverrides,
    serverPricingData,
  ]);

  // ── Discard pricing changes ──
  const discardPricing = useCallback(() => {
    setLocalUsdMonthly(null);
    setLocalUsdYearly(null);
    setLocalUsdLifetime(null);
    setLocalOverrides(null);
    setRemovedOverrides(new Set());
    setAddedOverrides(new Map());
  }, []);

  // ── Build the common update payload from plan + overrides ──
  const buildUpdatePayload = useCallback(
    (overridesPayload?: {
      features?: UpsertTenantPlanFeatureRequest[];
      prices?: UpsertTenantPlanPriceRequest[];
    }): UpdateTenantPlanRequest => {
      if (!plan) throw new Error("No plan loaded");
      return {
        name: plan.name,
        isActive: plan.isActive,
        isPublic: plan.isPublic,
        maxUsers: plan.maxUsers,
        allowMonthly: plan.allowMonthly,
        allowYearly: plan.allowYearly,
        allowLifetime: plan.allowLifetime,
        allowTrial: plan.allowTrial,
        isSelfServiceEnabled: plan.isSelfServiceEnabled,
        isContactSalesOnly: plan.isContactSalesOnly,
        trialDays: plan.trialDays,
        gracePeriodDays: plan.gracePeriodDays,
        tierLevel: plan.tierLevel,
        sortOrder: plan.sortOrder,
        ...overridesPayload,
      };
    },
    [plan]
  );

  // ── Build flat price array from Hybrid Model ──
  const buildFlatPrices = useCallback((): UpsertTenantPlanPriceRequest[] => {
    const flatPrices: UpsertTenantPlanPriceRequest[] = [];

    // USD base prices
    if (usdMonthly > 0)
      flatPrices.push({ currency: "USD", billingCycle: "Monthly", amount: usdMonthly });
    if (usdYearly > 0)
      flatPrices.push({ currency: "USD", billingCycle: "Yearly", amount: usdYearly });
    if (usdLifetime > 0)
      flatPrices.push({ currency: "USD", billingCycle: "Lifetime", amount: usdLifetime });

    // Override prices
    for (const row of overrides) {
      if (row.monthlyAmount > 0)
        flatPrices.push({
          currency: row.currency,
          billingCycle: "Monthly",
          amount: row.monthlyAmount,
        });
      if (row.yearlyAmount > 0)
        flatPrices.push({
          currency: row.currency,
          billingCycle: "Yearly",
          amount: row.yearlyAmount,
        });
      if (row.lifetimeAmount > 0)
        flatPrices.push({
          currency: row.currency,
          billingCycle: "Lifetime",
          amount: row.lifetimeAmount,
        });
    }

    return flatPrices;
  }, [usdMonthly, usdYearly, usdLifetime, overrides]);

  // ── Update Plan ──
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTenantPlanRequest) => tenantPlanRepository.update(planId, data),
    onSuccess: () => {
      featuresInitRef.current = false;
      discardPricing();
      queryClient.invalidateQueries({ queryKey });
      success({
        title: t("entitlements.tenantPlans.updated") || "Plan Updated",
        description: t("entitlements.tenantPlans.updatedDesc") || "Plan details updated.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("common.updateFailed") || "Failed to update.",
      });
    },
  });

  // ── Save Features ──
  const saveFeatures = useCallback(() => {
    const features: UpsertTenantPlanFeatureRequest[] = [];
    for (const [defId, data] of localFeatures) {
      features.push({
        featureDefinitionId: defId,
        value: data.value,
        overrideLabel: data.overrideLabel,
      });
    }
    updateMutation.mutate(buildUpdatePayload({ features }));
  }, [localFeatures, buildUpdatePayload, updateMutation]);

  // ── Save Prices ──
  const savePrices = useCallback(() => {
    const prices = buildFlatPrices();
    updateMutation.mutate(buildUpdatePayload({ prices }));
  }, [buildFlatPrices, buildUpdatePayload, updateMutation]);

  // ── Lifecycle Mutations ──
  const publishMutation = useMutation({
    mutationFn: (changeNotes?: string) => tenantPlanRepository.publish(planId, changeNotes),
    onSuccess: () => {
      featuresInitRef.current = false;
      discardPricing();
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      success({
        title: t("entitlements.tenantPlans.published") || "Plan Published",
        description: t("entitlements.tenantPlans.publishedDesc") || "Plan is now live.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.tenantPlans.publishFailed") || "Failed to publish plan.",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => tenantPlanRepository.archive(planId),
    onSuccess: () => {
      featuresInitRef.current = false;
      discardPricing();
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-plans"] });
      success({
        title: t("entitlements.tenantPlans.archived") || "Plan Archived",
        description: t("entitlements.tenantPlans.archivedDesc") || "Plan has been archived.",
      });
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.tenantPlans.archiveFailed") || "Failed to archive plan.",
      });
    },
  });

  return {
    plan,
    isLoading,
    error,
    refetch,
    featureCatalog,

    // ── Backend-grouped features for the FeaturesTab (ZERO client-side groupBy) ──
    // groupedByCategory: assigned features, enriched with catalog data, grouped by category.
    // availableGrouped: unassigned active features grouped by category (for FeatureCatalogPicker).
    groupedByCategory: useMemo((): Array<{
      category: string;
      items: Array<{
        definition: TenantFeatureDefinition;
        value: string;
        overrideLabel?: string;
        isModified: boolean;
        isNew: boolean;
      }>;
    }> => {
      return activeFeatureGroups
        .map((group) => {
          const items = group.definitions
            .filter((def) => localFeatures.has(def.id))
            .map((def) => {
              const data = localFeatures.get(def.id)!;
              const originalFeature = (plan?.features ?? []).find(
                (f) => f.featureDefinitionId === def.id
              );
              return {
                definition: def,
                value: data.value,
                overrideLabel: data.overrideLabel,
                isModified: originalFeature ? originalFeature.value !== data.value : true,
                isNew: !originalFeature,
              };
            })
            .sort((a, b) => a.definition.sortOrder - b.definition.sortOrder);
          return { category: group.category, items };
        })
        .filter((g) => g.items.length > 0);
    }, [activeFeatureGroups, localFeatures, plan]),

    availableGrouped: useMemo((): TenantFeatureDefinitionCategoryGroup[] => {
      return activeFeatureGroups
        .map((group) => ({
          category: group.category,
          definitions: group.definitions.filter(
            (def) => def.isActive && !localFeatures.has(def.id)
          ),
        }))
        .filter((g) => g.definitions.length > 0);
    }, [activeFeatureGroups, localFeatures]),

    // Lifecycle
    publishPlan: publishMutation.mutate,
    archivePlan: archiveMutation.mutate,
    updatePlan: updateMutation.mutate,
    isPublishing: publishMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isUpdating: updateMutation.isPending,

    // Features (lifted state)
    localFeatures,
    setFeatureValue,
    addFeature,
    removeFeature,
    featuresHasChanges,
    saveFeatures,

    // Pricing (Hybrid Model — mirrors Edition)
    usdMonthly,
    usdYearly,
    usdLifetime,
    setUsdMonthly: (v: number) => setLocalUsdMonthly(v),
    setUsdYearly: (v: number) => setLocalUsdYearly(v),
    setUsdLifetime: (v: number) => setLocalUsdLifetime(v),
    suggestedYearly,
    yearlyDiscountPercent,
    setYearlyDiscountPercent,
    applyDiscountToYearly,
    overrides,
    addOverride,
    removeOverride,
    updateOverride,
    availableCurrencies,
    preview,
    yearlySavingsPercent,
    pricesHasChanges,
    discardPricing,
    savePrices,
    exchangeRates,
    ratesLoading,
  };
}
