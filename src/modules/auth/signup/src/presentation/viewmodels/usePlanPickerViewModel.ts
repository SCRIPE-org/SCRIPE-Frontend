"use client";

// ═══════════════════════════════════════════════════════════════════════════
// usePlanPickerViewModel
//
// Architecture fix: removed direct authContainer access.
// The repository is injected as a prop from the orchestrator ViewModel,
// so this hook has no DI dependency — fully testable.
//
// All types come from domain/entities.
// All helpers (mapEdition, formatFeatureName, buildComparisonCategories)
// come from data/helpers/planHelpers and data/mappers/SignupMapper.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { SignupMapper } from "../../data/mappers/SignupMapper";
import {
  buildComparisonCategories,
  sortByPriority,
  formatFeatureName,
} from "../../data/helpers/planHelpers";
import { CATEGORY_ORDER } from "../../domain/constants/signupConstants";
import type { ISignupRepository } from "../../domain/interfaces/ISignupRepository";
import type { PublicEdition, PlanEdition, ComparisonCategory } from "../../domain/entities";

// Re-export for backward compatibility with components that import from here
export { formatFeatureName };
export type { PlanEdition, ComparisonCategory };
export type { ComparisonCellData, ComparisonFeatureRow } from "../../domain/entities";

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function usePlanPickerViewModel(
  repository: ISignupRepository,
  onSelectPlan: (edition: PublicEdition, billingCycle: "monthly" | "annual") => void,
  initialCategory: string | null = null,
  currency: string = "USD"
) {
  const { t, direction, language } = useI18n();

  const [editions, setEditions] = useState<PlanEdition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);

  // ── Fetch editions (currency + language aware) ─────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await repository.getEditions(null, currency, language);
        if (!cancelled) {
          setEditions(result.map(SignupMapper.toPlanEditionFromEntity));
        }
      } catch {
        if (!cancelled) {
          setEditions([]);
          setError(t("signup.plan.loadFailed") || "Couldn't load plans. Please refresh.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repository, currency, language, t]);

  // ── Category tabs ────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    for (const e of editions) {
      if (e.category && !cats.has(e.category)) {
        cats.set(e.category, e.categoryDisplayName ?? e.category);
      }
    }
    return Array.from(cats.keys()).sort((a, b) => sortByPriority(a, b, CATEGORY_ORDER));
  }, [editions]);

  const categoryLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const e of editions) {
      if (e.category) labels[e.category] = e.categoryDisplayName ?? e.category;
    }
    return labels;
  }, [editions]);

  const filteredEditions = useMemo(() => {
    const list = !activeCategory ? editions : editions.filter((e) => e.category === activeCategory);
    return [...list].sort((a, b) => a.tierLevel - b.tierLevel);
  }, [editions, activeCategory]);

  // ── Annual savings ───────────────────────────────────────────────────────
  const annualSavingsPercent = useMemo(() => {
    const first = editions.find((e) => e.monthlyPrice > 0);
    if (!first || first.monthlyPrice * 12 <= 0) return 0;
    return Math.round(
      ((first.monthlyPrice * 12 - first.annualPrice) / (first.monthlyPrice * 12)) * 100
    );
  }, [editions]);

  // ── Comparison table: per-category ──────────────────────────────────────
  const [comparisonActiveCategory, setComparisonActiveCategory] = useState<string | null>(null);

  const effectiveComparisonCategory = useMemo(() => {
    if (activeCategory) return activeCategory;
    if (comparisonActiveCategory && categories.includes(comparisonActiveCategory))
      return comparisonActiveCategory;
    return categories[0] ?? null;
  }, [activeCategory, comparisonActiveCategory, categories]);

  const comparisonEditions = useMemo(() => {
    if (!effectiveComparisonCategory) return filteredEditions;
    return editions
      .filter((e) => (e.category || "general") === effectiveComparisonCategory)
      .sort((a, b) => a.tierLevel - b.tierLevel);
  }, [editions, filteredEditions, effectiveComparisonCategory]);

  const comparisonCategories: ComparisonCategory[] = useMemo(
    () => buildComparisonCategories(comparisonEditions, language),
    [comparisonEditions, language]
  );

  // ── Select plan ──────────────────────────────────────────────────────────
  const selectPlan = useCallback(
    (edition: PlanEdition) => {
      onSelectPlan(edition.raw, billingCycle);
    },
    [billingCycle, onSelectPlan]
  );

  return {
    editions,
    isLoading,
    error,
    billingCycle,
    annualSavingsPercent,
    direction,
    activeCategory,
    categories,
    categoryLabels,
    filteredEditions,
    setActiveCategory,
    comparisonCategories,
    comparisonEditions,
    comparisonActiveCategory: effectiveComparisonCategory,
    setComparisonActiveCategory,
    setBillingCycle,
    selectPlan,
  };
}
