"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { PublicEdition, PublicFeature } from "../../domain/entities";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Internal enriched edition type for card rendering */
export interface PlanEdition {
  id: string;
  name: string;
  tagline: string;
  tierLevel: number;
  category: string | null;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  trialDays: number | null;
  badge: string | null;
  topFeatures: PublicFeature[];
  allFeatures: PublicFeature[];
  checkoutMode: "self-service" | "contact-sales";
}

/** Feature category section for the comparison table */
export interface FeatureCategory {
  name: string;
  features: PublicFeature[];
}

export interface UsePlanPickerViewModelReturn {
  // State
  editions: PlanEdition[];
  isLoading: boolean;
  error: string;
  billingCycle: "monthly" | "annual";
  annualSavingsPercent: number;
  direction: string;

  // Category tab filtering
  activeCategory: string | null;
  categories: string[];
  filteredEditions: PlanEdition[];
  setActiveCategory: (cat: string | null) => void;

  // Comparison modal
  isCompareOpen: boolean;
  openCompare: () => void;
  closeCompare: () => void;
  comparisonCategories: FeatureCategory[];

  // Actions
  setBillingCycle: (cycle: "monthly" | "annual") => void;
  selectPlan: (edition: PlanEdition) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapEdition(e: PublicEdition): PlanEdition {
  return {
    id: e.id,
    name: e.name,
    tagline: e.tagline ?? "",
    tierLevel: e.tier,
    category: e.category ?? null,
    monthlyPrice: e.monthlyPrice ?? 0,
    annualPrice: e.annualPrice ?? 0,
    currency: e.currency,
    trialDays: e.trialDays > 0 ? e.trialDays : null,
    badge: e.badge ?? (e.isRecommended ? "Recommended" : null),
    topFeatures: e.topFeatures ?? [],
    allFeatures: e.allFeatures ?? [],
    checkoutMode: e.checkoutMode === "contact-sales" ? "contact-sales" : "self-service",
  };
}

/**
 * Groups all features across all editions into categories for the comparison table.
 * De-duplicates features by name, preserves sort order.
 */
function buildComparisonCategories(editions: PlanEdition[]): FeatureCategory[] {
  const seen = new Map<string, PublicFeature>();

  for (const edition of editions) {
    for (const feat of edition.allFeatures) {
      if (!seen.has(feat.name)) {
        seen.set(feat.name, feat);
      }
    }
  }

  // Group by category
  const grouped = new Map<string, PublicFeature[]>();
  for (const feat of seen.values()) {
    const cat = feat.category || "General";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(feat);
  }

  // Sort each category by sortOrder
  const result: FeatureCategory[] = [];
  for (const [name, features] of grouped) {
    result.push({
      name,
      features: features.sort((a, b) => a.sortOrder - b.sortOrder),
    });
  }

  // Sort categories alphabetically (General first)
  return result.sort((a, b) => {
    if (a.name === "General") return -1;
    if (b.name === "General") return 1;
    return a.name.localeCompare(b.name);
  });
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * usePlanPickerViewModel — Business logic for the Plan Picker signup step.
 *
 * Handles:
 * - Edition fetching with rich feature data
 * - Billing cycle toggle + annual savings
 * - Edition category tab filtering (General / ERP / Healthcare / etc.)
 * - Comparison modal state + categorized feature grouping
 */
export function usePlanPickerViewModel(
  onSelectPlan: (
    edition: { id: string; name: string; trialDays: number | null; checkoutMode: string },
    billingCycle: "monthly" | "annual"
  ) => void
): UsePlanPickerViewModelReturn {
  const { t, direction } = useI18n();
  const { signupRepository } = authContainer;

  const [editions, setEditions] = useState<PlanEdition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // ── Fetch editions ──
  useEffect(() => {
    let cancelled = false;
    const fetchEditions = async () => {
      setIsLoading(true);
      try {
        const result = await signupRepository.getEditions();
        if (!cancelled) {
          setEditions(result.map(mapEdition));
        }
      } catch {
        if (!cancelled) {
          // Fallback: show a minimal free plan so user can proceed
          setEditions([
            {
              id: "",
              name: "Free",
              tagline: t("signup.plan.freeTagline") || "Get started for free",
              tierLevel: 0,
              category: null,
              monthlyPrice: 0,
              annualPrice: 0,
              currency: "USD",
              trialDays: null,
              badge: null,
              topFeatures: [],
              allFeatures: [],
              checkoutMode: "self-service",
            },
          ]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchEditions();
    return () => { cancelled = true; };
  }, [signupRepository, t]);

  // ── Category tabs ──
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const e of editions) {
      if (e.category) cats.add(e.category);
    }
    return Array.from(cats).sort();
  }, [editions]);

  const filteredEditions = useMemo(() => {
    if (!activeCategory) return editions;
    return editions.filter((e) => e.category === activeCategory);
  }, [editions, activeCategory]);

  // ── Annual savings ──
  const annualSavingsPercent = useMemo(() => {
    const first = editions.find((e) => e.monthlyPrice > 0);
    if (!first) return 0;
    const monthlyTotal = first.monthlyPrice * 12;
    const annualTotal = first.annualPrice;
    if (monthlyTotal <= 0) return 0;
    return Math.round(((monthlyTotal - annualTotal) / monthlyTotal) * 100);
  }, [editions]);

  // ── Comparison table data ──
  const comparisonCategories = useMemo(
    () => buildComparisonCategories(filteredEditions),
    [filteredEditions]
  );

  // ── Actions ──
  const selectPlan = useCallback(
    (edition: PlanEdition) => { onSelectPlan(edition, billingCycle); },
    [billingCycle, onSelectPlan]
  );

  const openCompare  = useCallback(() => setIsCompareOpen(true), []);
  const closeCompare = useCallback(() => setIsCompareOpen(false), []);

  return {
    editions,
    isLoading,
    error,
    billingCycle,
    annualSavingsPercent,
    direction,
    activeCategory,
    categories,
    filteredEditions,
    setActiveCategory,
    isCompareOpen,
    openCompare,
    closeCompare,
    comparisonCategories,
    setBillingCycle,
    selectPlan,
  };
}
