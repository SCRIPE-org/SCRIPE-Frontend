/**
 * Edition Comparison ViewModel
 *
 * Fetches all non-retired editions and prepares comparison data.
 * Follows architecture: View → ViewModel → Repository → Service → HTTP
 */
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { Edition } from "../../domain/entities/Edition";

export function useEditionComparisonViewModel() {
      const { editionRepository } = entitlementsContainer;

      const { data, isLoading } = useQuery({
            queryKey: ["entitlements", "editions", "comparison"],
            queryFn: () => editionRepository.getAll({ page: 1, pageSize: 50 }),
            staleTime: 5 * 60 * 1000,
      });

      const editions = useMemo(() => {
            if (!data?.items) return [];
            return data.items
                  .filter((e: Edition) => !e.isRetired)
                  .sort((a: Edition, b: Edition) => a.tierLevel - b.tierLevel);
      }, [data]);

      // Collect all unique feature names across all editions
      const allFeatureNames = useMemo(() => {
            const nameSet = new Set<string>();
            editions.forEach((ed: Edition) => {
                  ed.features.forEach((f) => nameSet.add(f.featureName));
            });
            return Array.from(nameSet).sort();
      }, [editions]);

      // Determine "recommended" — middle tier or tier 1 if exists
      const recommendedIdx = useMemo(() => {
            if (editions.length <= 1) return -1;
            if (editions.length === 2) return 1;
            return Math.floor(editions.length / 2);
      }, [editions]);

      return {
            editions,
            allFeatureNames,
            recommendedIdx,
            isLoading,
            isEmpty: editions.length === 0,
      };
}
