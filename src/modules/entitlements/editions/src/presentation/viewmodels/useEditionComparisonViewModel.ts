/**
 * useEditionComparisonViewModel — Data logic for the dual-view comparison page.
 *
 * KEY DESIGN: The list endpoint returns basic metadata (prices via BaseMonthlyPriceUsd).
 * The detail endpoint now also returns the full Prices array (fixed in backend).
 * We fetch details for features AND prices.
 *
 * Flow:
 * 1. Fetch list → get IDs + billing metadata + allowMonthly/Yearly/Lifetime flags
 * 2. Fetch each edition detail in parallel → get features[] + prices[]
 * 3. User selects a billing cycle → prices update for all cards simultaneously
 * 4. Build progressive feature highlights with VALUES (e.g. "Up to 25 admins")
 *
 * Architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Edition, EditionFeatureDto } from "../../domain/entities/Edition";

export type BillingCycle = "Monthly" | "Yearly" | "Lifetime";

export interface FeatureRow {
  featureName: string;
  displayNameEn: string;
  displayNameAr: string;
  category: string;
  sortOrder: number;
  values: Record<string, string>; // editionId → value
  valueType: string;
}

export interface PricingHighlight {
  label: string;
  isUnlimited?: boolean;
  value?: string; // human-readable value e.g. "25", "Unlimited"
}

/** Format a feature value into a human-readable label */
function formatFeatureValue(value: string, valueType: string): string {
  if (value === "-1" || value === "unlimited") return "Unlimited";
  if (value === "false" || value === "0") return "";
  if (value === "true") return "";
  if (valueType === "Numeric") return value;
  return value;
}

/** Build a human-readable highlight label with value for numeric features */
function buildHighlightLabel(feature: EditionFeatureDto): PricingHighlight {
  const displayName = feature.displayNameEn || feature.featureName;
  const isUnlimited = feature.value === "-1" || feature.value === "unlimited";

  if (isUnlimited) {
    return { label: displayName, isUnlimited: true, value: "Unlimited" };
  }

  if (feature.valueType === "Numeric" && feature.value !== "0" && feature.value !== "false") {
    return { label: displayName, value: feature.value };
  }

  return { label: displayName };
}

/** Determine which billing cycles ALL editions together support */
function resolveAvailableCycles(editions: Edition[]): BillingCycle[] {
  const cycles = new Set<BillingCycle>();
  editions.forEach((ed) => {
    if (ed.allowMonthly) cycles.add("Monthly");
    if (ed.allowYearly) cycles.add("Yearly");
    if (ed.allowLifetime) cycles.add("Lifetime");
  });
  // Order: Monthly, Yearly, Lifetime
  const ordered: BillingCycle[] = [];
  if (cycles.has("Monthly")) ordered.push("Monthly");
  if (cycles.has("Yearly")) ordered.push("Yearly");
  if (cycles.has("Lifetime")) ordered.push("Lifetime");
  return ordered;
}

export function useEditionComparisonViewModel() {
  const { editionRepository } = entitlementsContainer;

  // ── Billing cycle toggle state (default: Yearly — industry standard) ──
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("Yearly");

  // Step 1: Fetch list for IDs and billing metadata
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ["entitlements", "editions", "comparison-list"],
    queryFn: () => editionRepository.getAll({ page: 1, pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  // Filter and sort by tierLevel
  const editionSummaries = useMemo(() => {
    if (!listData?.items) return [];
    return listData.items
      .filter((e: Edition) => !e.isRetired)
      .sort((a: Edition, b: Edition) => a.tierLevel - b.tierLevel);
  }, [listData]);

  // Step 2: Fetch each edition's full detail (with features + prices) in parallel
  const detailQueries = useQueries({
    queries: editionSummaries.map((ed: Edition) => ({
      queryKey: ["entitlements", "editions", "detail", ed.id],
      queryFn: () => editionRepository.getById(ed.id),
      staleTime: 5 * 60 * 1000,
      enabled: editionSummaries.length > 0,
    })),
  });

  const isDetailLoading = detailQueries.some((q) => q.isLoading);
  const isLoading = isListLoading || isDetailLoading;

  // Editions with full features + prices, sorted by tierLevel
  const editions = useMemo(() => {
    if (isDetailLoading) return [];
    return detailQueries
      .filter((q) => q.data)
      .map((q) => q.data!)
      .sort((a: Edition, b: Edition) => a.tierLevel - b.tierLevel);
  }, [detailQueries, isDetailLoading]);

  // ── Determine which billing cycles are available across all editions ──
  const availableCycles = useMemo(() => resolveAvailableCycles(editions), [editions]);

  // ── Build categorized feature matrix ──
  const categorizedFeatures = useMemo(() => {
    const featureMap = new Map<string, FeatureRow>();

    editions.forEach((ed: Edition) => {
      ed.features.forEach((f: EditionFeatureDto) => {
        const category = f.category || "General";
        const key = f.featureName;

        if (!featureMap.has(key)) {
          featureMap.set(key, {
            featureName: f.featureName,
            displayNameEn: f.displayNameEn || f.featureName,
            displayNameAr: f.displayNameAr || f.featureName,
            category,
            sortOrder: f.sortOrder ?? 999,
            values: {},
            valueType: f.valueType,
          });
        }

        const row = featureMap.get(key)!;
        row.values[ed.id] = f.value;
      });
    });

    // Group by category
    const grouped = new Map<string, FeatureRow[]>();
    featureMap.forEach((row) => {
      const cat = row.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(row);
    });

    // Sort within categories
    grouped.forEach((rows) => rows.sort((a, b) => a.sortOrder - b.sortOrder));

    const CATEGORY_ORDER = [
      "Billing", "Modules", "Quotas", "Security",
      "Users", "Performance", "Configuration", "General",
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
  }, [editions]);

  /**
   * Progressive feature highlights per edition WITH human-readable values.
   * - Tier 0: Show top enabled features (with their values)
   * - Higher tiers: Show features that are BETTER than the previous tier, with delta values
   */
  const progressiveHighlights = useMemo(() => {
    return editions.map((ed: Edition, idx: number) => {
      const prev = idx > 0 ? editions[idx - 1] : null;
      const highlights: PricingHighlight[] = [];

      if (!prev) {
        // Lowest tier: show top enabled features with values
        ed.features
          .filter((f) => {
            if (f.value === "false" || f.value === "0" || f.value.trim() === "") return false;
            return true;
          })
          .slice(0, 8)
          .forEach((f) => highlights.push(buildHighlightLabel(f)));
      } else {
        // Higher tiers: show features with BETTER values than previous tier
        ed.features.forEach((f) => {
          const prevFeature = prev.features.find((pf) => pf.featureName === f.featureName);
          const prevVal = prevFeature?.value ?? "false";

          if (f.value === prevVal) return; // unchanged
          if (f.value === "false" || f.value === "0") return; // not enabled

          // For numeric, only show if current > previous
          if (f.valueType === "Numeric") {
            const curr = parseFloat(f.value);
            const prev_ = parseFloat(prevVal);
            // -1 = unlimited (always better)
            if (curr !== -1 && !isNaN(curr) && !isNaN(prev_) && curr <= prev_) return;
          }

          highlights.push(buildHighlightLabel(f));
        });

        // Fallback: if no diffs, show top features of this tier
        if (highlights.length === 0) {
          ed.features
            .filter((f) => f.value !== "false" && f.value !== "0" && f.value.trim() !== "")
            .slice(0, 5)
            .forEach((f) => highlights.push(buildHighlightLabel(f)));
        }
      }

      return highlights;
    });
  }, [editions]);

  /**
   * For the selected billing cycle, compute the price each edition shows.
   * Returns { price: number | undefined, isFree: boolean, isContactSales: boolean }
   */
  const cyclePrices = useMemo(() => {
    return editions.map((ed: Edition) => {
      if (ed.isFreeEdition) {
        return { price: 0, isFree: true, isContactSales: false };
      }
      if (ed.isContactSalesOnly) {
        return { price: undefined, isFree: false, isContactSales: true };
      }

      const price = ed.getPriceForCycle(selectedCycle);
      return { price, isFree: price === undefined, isContactSales: false };
    });
  }, [editions, selectedCycle]);

  /** Savings % for each edition when comparing Monthly → Yearly (shown on Yearly toggle) */
  const savingsPercents = useMemo(() => {
    return editions.map((ed: Edition) => ed.getSavingsPercent());
  }, [editions]);

  const totalFeatureCount = useMemo(() => {
    const nameSet = new Set<string>();
    editions.forEach((ed: Edition) => {
      ed.features.forEach((f) => nameSet.add(f.featureName));
    });
    return nameSet.size;
  }, [editions]);

  return {
    editions,
    categorizedFeatures,
    progressiveHighlights,
    totalFeatureCount,
    isLoading,
    isEmpty: !isLoading && editions.length === 0,
    // Billing cycle toggle
    selectedCycle,
    setSelectedCycle,
    availableCycles,
    cyclePrices,
    savingsPercents,
  };
}
