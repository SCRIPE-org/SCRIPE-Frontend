/**
 * useEditionComparisonViewModel — Data logic for the dual-view comparison page.
 *
 * KEY DESIGN: The list endpoint (GetEditions) returns EditionListResponse which
 * does NOT include the features array — only featureCount. To build the feature
 * comparison matrix, we must fetch each edition individually via getById().
 *
 * Flow:
 * 1. Fetch paginated list → get IDs + billing metadata
 * 2. Fetch each edition detail in parallel → get features[]
 * 3. Build categorized feature matrix from the detail responses
 *
 * Architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Edition, EditionFeatureDto } from "../../domain/entities/Edition";

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
}

export function useEditionComparisonViewModel() {
  const { editionRepository } = entitlementsContainer;

  // Step 1: Fetch the list to get edition IDs and basic metadata
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ["entitlements", "editions", "comparison-list"],
    queryFn: () => editionRepository.getAll({ page: 1, pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  // Filter and sort editions from the list
  const editionSummaries = useMemo(() => {
    if (!listData?.items) return [];
    return listData.items
      .filter((e: Edition) => !e.isRetired)
      .sort((a: Edition, b: Edition) => a.tierLevel - b.tierLevel);
  }, [listData]);

  // Step 2: Fetch each edition's full detail (with features) in parallel
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

  // The full edition objects with features populated
  const editions = useMemo(() => {
    if (isDetailLoading) return [];
    return detailQueries
      .filter((q) => q.data)
      .map((q) => q.data!)
      .sort((a: Edition, b: Edition) => a.tierLevel - b.tierLevel);
  }, [detailQueries, isDetailLoading]);

  /**
   * Collect all unique features across editions, grouped by category.
   * Category "General" is used as fallback for uncategorized features.
   */
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

    // Group by category, sort within each category
    const grouped = new Map<string, FeatureRow[]>();
    featureMap.forEach((row) => {
      const cat = row.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(row);
    });

    // Sort rows within each category by sortOrder
    grouped.forEach((rows) => rows.sort((a, b) => a.sortOrder - b.sortOrder));

    // Sort categories (Billing first, then alpha)
    const CATEGORY_ORDER = ["Billing", "Modules", "Quotas", "Security", "Users", "Performance", "Configuration", "General"];
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
   * For each edition, compute "progressive" feature highlights:
   * - Tier 0 (lowest): show top positive features
   * - Higher tiers: show features that are BETTER than the previous tier
   */
  const progressiveHighlights = useMemo(() => {
    return editions.map((ed: Edition, idx: number) => {
      const prev = idx > 0 ? editions[idx - 1] : null;
      const highlights: PricingHighlight[] = [];

      if (!prev) {
        // Lowest tier: show first ~8 enabled features
        ed.features
          .filter((f) => f.value !== "false" && f.value !== "0" && f.value.trim() !== "")
          .slice(0, 8)
          .forEach((f) => {
            const label = f.displayNameEn || f.featureName;
            const isUnlimited = f.value === "-1" || f.value === "unlimited";
            highlights.push({ label, isUnlimited });
          });
      } else {
        // Higher tiers: features that are better than previous tier
        ed.features.forEach((f) => {
          const prevFeature = prev.features.find((pf) => pf.featureName === f.featureName);
          const prevVal = prevFeature?.value ?? "false";

          // Skip if same value
          if (f.value === prevVal) return;

          // Skip if this tier is disabled while prev was enabled
          if (f.value === "false" || f.value === "0") return;

          const label = f.displayNameEn || f.featureName;
          const isUnlimited = f.value === "-1" || f.value === "unlimited";
          highlights.push({ label, isUnlimited });
        });

        // If no diffs found, show top enabled features
        if (highlights.length === 0) {
          ed.features
            .filter((f) => f.value !== "false" && f.value !== "0")
            .slice(0, 5)
            .forEach((f) => {
              highlights.push({ label: f.displayNameEn || f.featureName });
            });
        }
      }

      return highlights;
    });
  }, [editions]);

  // Total feature count for the "show all" toggle
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
  };
}
