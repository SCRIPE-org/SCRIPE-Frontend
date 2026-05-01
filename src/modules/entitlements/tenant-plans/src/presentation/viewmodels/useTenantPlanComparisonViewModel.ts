/**
 * useTenantPlanComparisonViewModel — Data logic for the dual-view comparison page.
 *
 * KEY DESIGN: The list endpoint returns TenantPlanListResponse which may NOT
 * include the features array. To build the feature comparison matrix, we fetch
 * each plan individually via getById().
 *
 * Flow:
 * 1. Fetch paginated list → get IDs + billing metadata
 * 2. Fetch each plan detail in parallel → get features[]
 * 3. Build categorized feature matrix from the detail responses
 *
 * Architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { TenantPlan, TenantPlanFeatureData } from "../../domain/entities/TenantPlan";

export interface FeatureRow {
  featureKey: string;
  displayNameEn: string;
  displayNameAr: string;
  category: string;
  sortOrder: number;
  values: Record<string, string>; // planId → value
  valueType: string;
}

export interface PricingHighlight {
  label: string;
  isUnlimited?: boolean;
}

export function useTenantPlanComparisonViewModel() {
  const { tenantPlanRepository } = entitlementsContainer;
  const [selectedCycle, setSelectedCycle] = useState<"Monthly" | "Yearly" | "Lifetime">("Monthly");

  // Step 1: Fetch the list to get plan IDs
  const {
    data: listData,
    isLoading: isListLoading,
    error,
  } = useQuery({
    queryKey: ["entitlements", "tenant-plans", "comparison-list"],
    queryFn: () => tenantPlanRepository.getAll({ page: 1, pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  // Filter and sort plans from the list
  const planSummaries = useMemo(() => {
    if (!listData?.items) return [];
    return listData.items
      .filter((p: TenantPlan) => p.isActive && !p.isArchived)
      .sort((a: TenantPlan, b: TenantPlan) => a.tierLevel - b.tierLevel);
  }, [listData]);

  // Step 2: Fetch each plan's full detail (with features) in parallel
  const detailQueries = useQueries({
    queries: planSummaries.map((plan: TenantPlan) => ({
      queryKey: ["entitlements", "tenant-plans", "detail", plan.id],
      queryFn: () => tenantPlanRepository.getById(plan.id),
      staleTime: 5 * 60 * 1000,
      enabled: planSummaries.length > 0,
    })),
  });

  const isDetailLoading = detailQueries.some((q) => q.isLoading);
  const isLoading = isListLoading || isDetailLoading;

  // The full plan objects with features populated
  const plans = useMemo(() => {
    if (isDetailLoading) return [];
    return detailQueries
      .filter((q) => q.data)
      .map((q) => q.data!)
      .sort((a: TenantPlan, b: TenantPlan) => a.tierLevel - b.tierLevel);
  }, [detailQueries, isDetailLoading]);

  /**
   * Collect all unique features across plans, grouped by category.
   * Category is parsed from featureKey (e.g. "Category.FeatureName")
   */
  const categorizedFeatures = useMemo(() => {
    const featureMap = new Map<string, FeatureRow>();

    plans.forEach((plan: TenantPlan) => {
      plan.features.forEach((f: TenantPlanFeatureData) => {
        // featureKey is usually "Category.FeatureName" — guard against undefined/null
        const rawKey = f.featureKey ?? f.featureDefinitionId ?? "unknown";
        const parts = rawKey.split(".");
        const category = parts.length > 1 ? parts[0] : "General";
        const key = rawKey;

        if (!featureMap.has(key)) {
          featureMap.set(key, {
            featureKey: key,
            displayNameEn: f.featureDisplayNameEn || f.featureKey,
            displayNameAr: f.featureDisplayNameAr || f.featureKey,
            category,
            sortOrder: 999,
            values: {},
            valueType: f.featureValueType,
          });
        }

        const row = featureMap.get(key)!;
        row.values[plan.id] = f.value;
      });
    });

    // Group by category
    const grouped = new Map<string, FeatureRow[]>();
    featureMap.forEach((row) => {
      const cat = row.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(row);
    });

    // Sort rows alphabetically
    grouped.forEach((rows) => rows.sort((a, b) => a.displayNameEn.localeCompare(b.displayNameEn)));

    // Sort categories
    const CATEGORY_ORDER = [
      "Billing",
      "Modules",
      "Quotas",
      "Security",
      "Users",
      "Performance",
      "Configuration",
      "General",
    ];
    return new Map(
      [...grouped.entries()].sort(([a], [b]) => {
        const ai = CATEGORY_ORDER.indexOf(a);
        const bi = CATEGORY_ORDER.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      })
    );
  }, [plans]);

  /**
   * Compute Progressive Highlights.
   */
  const progressiveHighlights = useMemo(() => {
    if (plans.length === 0) return [];

    const highlights: PricingHighlight[][] = [];

    // Plan 0: Base plan highlights
    const baseHighlights: PricingHighlight[] = [];
    if (plans[0].maxUsers > 0) baseHighlights.push({ label: `Up to ${plans[0].maxUsers} Users` });
    else if (plans[0].maxUsers === -1)
      baseHighlights.push({ label: "Unlimited Users", isUnlimited: true });

    const baseFeatures = plans[0].features
      .filter((f) => f.featureValueType === "Boolean" && f.value === "true")
      .slice(0, 3);
    baseFeatures.forEach((f) =>
      baseHighlights.push({ label: f.featureDisplayNameEn || f.featureKey })
    );
    highlights.push(baseHighlights);

    // Subsequent plans: calculate deltas
    for (let i = 1; i < plans.length; i++) {
      const prevPlan = plans[i - 1];
      const currPlan = plans[i];
      const currentHighlights: PricingHighlight[] = [];

      // Check users upgrade
      if (currPlan.maxUsers === -1 && prevPlan.maxUsers !== -1) {
        currentHighlights.push({ label: "Unlimited Users", isUnlimited: true });
      } else if (currPlan.maxUsers > prevPlan.maxUsers) {
        currentHighlights.push({ label: `Up to ${currPlan.maxUsers} Users` });
      }

      // Check features upgrade
      currPlan.features.forEach((currFeat) => {
        const prevFeat = prevPlan.features.find((f) => f.featureKey === currFeat.featureKey);

        if (currFeat.featureValueType === "Boolean" && currFeat.value === "true") {
          if (!prevFeat || prevFeat.value !== "true") {
            currentHighlights.push({ label: currFeat.featureDisplayNameEn || currFeat.featureKey });
          }
        } else if (currFeat.featureValueType === "Numeric") {
          const currNum = parseInt(currFeat.value, 10);
          const prevNum = prevFeat ? parseInt(prevFeat.value, 10) : 0;
          if (currNum === -1 && prevNum !== -1) {
            currentHighlights.push({
              label: `Unlimited ${currFeat.featureDisplayNameEn || currFeat.featureKey}`,
              isUnlimited: true,
            });
          } else if (currNum > prevNum) {
            currentHighlights.push({
              label: `${currFeat.featureDisplayNameEn || currFeat.featureKey} (${currNum})`,
            });
          }
        }
      });

      highlights.push(currentHighlights.slice(0, 5));
    }

    return highlights;
  }, [plans]);

  // Total feature count for the "show all" toggle
  const totalFeatureCount = useMemo(() => {
    const keySet = new Set<string>();
    plans.forEach((plan: TenantPlan) => {
      plan.features.forEach((f) => keySet.add(f.featureKey));
    });
    return keySet.size;
  }, [plans]);

  // Compute available cycles across all public plans
  const availableCycles = useMemo(() => {
    const cycles = new Set<"Monthly" | "Yearly" | "Lifetime">();
    plans.forEach((plan) => {
      if (plan.allowMonthly) cycles.add("Monthly");
      if (plan.allowYearly) cycles.add("Yearly");
      if (plan.allowLifetime) cycles.add("Lifetime");
    });

    // Ensure "Monthly" is default if available and nothing is explicitly selected
    const sortedCycles = Array.from(cycles);
    if (!cycles.has(selectedCycle) && sortedCycles.length > 0) {
      if (cycles.has("Monthly")) {
        setSelectedCycle("Monthly");
      } else {
        setSelectedCycle(sortedCycles[0]);
      }
    }

    return sortedCycles;
  }, [plans, selectedCycle]);

  return {
    plans,
    categorizedFeatures,
    progressiveHighlights,
    totalFeatureCount,
    isLoading,
    isEmpty: !isLoading && plans.length === 0,
    selectedCycle,
    setSelectedCycle,
    availableCycles,
    error,
  };
}
