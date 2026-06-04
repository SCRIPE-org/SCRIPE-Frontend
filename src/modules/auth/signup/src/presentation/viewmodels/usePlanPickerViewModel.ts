"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { PublicEdition, PublicFeature } from "../../domain/entities";

// ─── Types ────────────────────────────────────────────────────────────────────

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

/** Shape consumed by ComparisonTable */
export interface ComparisonCategory {
  key: string;
  label: string;
  features: {
    featureName: string;
    label: string;
    values: Record<string, ComparisonCellData>;
  }[];
}

export interface ComparisonCellData {
  value: string;
  valueType: string;
  displayLabelEn: string | null;
  displayLabelAr: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_ORDER = ["General", "ERP", "Healthcare", "Education", "Finance"];

const FEATURE_CATEGORY_ORDER = [
  "Users & Access",
  "Modules",
  "Quotas",
  "Billing",
  "Security",
  "Performance",
  "Configuration",
  "Support",
  "General",
];

/** Convert raw feature names like "Identity.Admins.MaxPerTenant" to "Max Admins Per Tenant" */
export function formatFeatureName(raw: string): string {
  if (!raw) return raw;
  // Already readable (has spaces, starts with uppercase)
  if (raw.includes(" ") && raw[0] === raw[0].toUpperCase()) return raw;
  // MIME types
  if (raw.includes("/") && raw.includes("*")) return raw;

  // Dotted names like "Identity.Admins.MaxPerTenant" → take last meaningful segment
  if (raw.includes(".")) {
    const segments = raw.split(".");
    // If more than 2, take last 1–2 segments
    const lastTwo = segments.slice(-2);
    raw = lastTwo
      .filter((s) => !["Enabled", "Max", "Modules", "Marketing", "Identity"].includes(s))
      .join(" ");
    if (!raw) raw = segments[segments.length - 1];
  }

  // camelCase/PascalCase → spaces
  raw = raw.replace(/([a-z])([A-Z])/g, "$1 $2");
  // snake_case or kebab-case → spaces
  raw = raw.replace(/[_-]/g, " ");
  // Capitalize each word
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

/** Group a feature into a display category */
function getFeatureDisplayCategory(name: string): string {
  // Identity / Users
  if (name.startsWith("Identity.")) return "Users & Access";

  // Module quotas (CRM, HRMS, Inventory, Accounting, etc.)
  if (name.startsWith("Modules.")) return "Modules";

  // Security features
  if (
    name.startsWith("Marketing.SSO") ||
    name.startsWith("Identity.2FA") ||
    name.startsWith("Identity.Require2FA") ||
    name.startsWith("Identity.SecurityPage") ||
    name.startsWith("Compliance") ||
    name.includes("AuditLog") ||
    name.includes("Encryption")
  )
    return "Security";

  // Support & onboarding
  if (
    name.startsWith("Marketing.Support") ||
    name.startsWith("Marketing.Onboarding") ||
    name.startsWith("Marketing.Training") ||
    name.startsWith("Marketing.AccountManager") ||
    name.includes("SupportTickets") ||
    name.includes("SlackChannel")
  )
    return "Support";

  // Performance & reliability
  if (
    name.startsWith("Marketing.SLA") ||
    name.startsWith("Marketing.Backup") ||
    name.startsWith("Marketing.DataRetention") ||
    name.includes("CDN") ||
    name.includes("Uptime") ||
    name.includes("Caching")
  )
    return "Performance";

  // Billing & payments
  if (
    name.includes("Billing") ||
    name.includes("Invoice") ||
    name.includes("Payment") ||
    name.includes("Subscription")
  )
    return "Billing";

  // Quotas / limits
  if (
    name.includes("Storage") ||
    name.includes("ApiCalls") ||
    name.includes("Bandwidth") ||
    name.includes("FileSize") ||
    name.includes("Max") ||
    name.includes("Limit")
  )
    return "Quotas";

  // Anything else under Marketing namespace
  if (name.startsWith("Marketing.")) return "General";

  return "General";
}

function sortByPriority(a: string, b: string, order: string[]): number {
  const ai = order.indexOf(a);
  const bi = order.indexOf(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.localeCompare(b);
}

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
 * Build comparison categories from editions — produces a matrix of features × editions.
 * Each feature row contains values for every edition (checkmark, number, text, or missing).
 */
function buildComparisonCategories(
  editions: PlanEdition[],
  language: string
): ComparisonCategory[] {
  // 1. Collect all unique features across editions
  const featureMap = new Map<
    string,
    {
      name: string;
      category: string;
      sortOrder: number;
      displayCategory: string;
      values: Record<string, ComparisonCellData>;
    }
  >();

  for (const edition of editions) {
    for (const feat of edition.allFeatures) {
      if (!featureMap.has(feat.name)) {
        featureMap.set(feat.name, {
          name: feat.name,
          category: feat.category || "General",
          sortOrder: feat.sortOrder ?? 999,
          displayCategory: getFeatureDisplayCategory(feat.name),
          values: {},
        });
      }
      featureMap.get(feat.name)!.values[edition.id] = {
        value: feat.value,
        valueType: feat.valueType,
        displayLabelEn: feat.displayLabelEn ?? null,
        displayLabelAr: feat.displayLabelAr ?? null,
      };
    }
  }

  // 2. Group by display category
  const grouped = new Map<string, typeof featureMap extends Map<string, infer V> ? V[] : never>();

  for (const feat of featureMap.values()) {
    const cat = feat.displayCategory;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(feat);
  }

  // 3. Build result sorted by category order
  const result: ComparisonCategory[] = [];
  for (const [catName, features] of grouped) {
    features.sort((a, b) => a.sortOrder - b.sortOrder);
    result.push({
      key: catName,
      label: catName,
      features: features.map((f) => ({
        featureName: f.name,
        label: formatFeatureName(f.name),
        values: f.values,
      })),
    });
  }

  return result.sort((a, b) => sortByPriority(a.key, b.key, FEATURE_CATEGORY_ORDER));
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

export function usePlanPickerViewModel(
  onSelectPlan: (
    edition: { id: string; name: string; trialDays: number | null; checkoutMode: string },
    billingCycle: "monthly" | "annual"
  ) => void
) {
  const { t, direction, language } = useI18n();
  const { signupRepository } = authContainer;

  const [editions, setEditions] = useState<PlanEdition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // ── Fetch editions ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const result = await signupRepository.getEditions();
        if (!cancelled) setEditions(result.map(mapEdition));
      } catch {
        if (!cancelled) {
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
    })();
    return () => {
      cancelled = true;
    };
  }, [signupRepository, t]);

  // ── Category tabs ──
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const e of editions) {
      if (e.category) cats.add(e.category);
    }
    return Array.from(cats).sort((a, b) => sortByPriority(a, b, CATEGORY_ORDER));
  }, [editions]);

  const filteredEditions = useMemo(() => {
    const list = !activeCategory ? editions : editions.filter((e) => e.category === activeCategory);
    return [...list].sort((a, b) => a.tierLevel - b.tierLevel);
  }, [editions, activeCategory]);

  // ── Annual savings ──
  const annualSavingsPercent = useMemo(() => {
    const first = editions.find((e) => e.monthlyPrice > 0);
    if (!first || first.monthlyPrice * 12 <= 0) return 0;
    return Math.round(
      ((first.monthlyPrice * 12 - first.annualPrice) / (first.monthlyPrice * 12)) * 100
    );
  }, [editions]);

  // ── Comparison: per-category edition picker ──
  // The comparison table shows editions from ONE category at a time.
  // Defaults to the user's active card category, or the first available.
  const [comparisonActiveCategory, setComparisonActiveCategory] = useState<string | null>(null);

  // Resolve the effective comparison category
  const effectiveComparisonCategory = useMemo(() => {
    if (activeCategory) return activeCategory; // User picked a category tab
    if (comparisonActiveCategory && categories.includes(comparisonActiveCategory))
      return comparisonActiveCategory;
    return categories[0] ?? null; // Default to first category
  }, [activeCategory, comparisonActiveCategory, categories]);

  // Editions visible in the comparison table (single category only)
  const comparisonEditions = useMemo(() => {
    if (!effectiveComparisonCategory) return filteredEditions;
    return editions
      .filter((e) => (e.category || "General") === effectiveComparisonCategory)
      .sort((a, b) => a.tierLevel - b.tierLevel);
  }, [editions, filteredEditions, effectiveComparisonCategory]);

  // ── Comparison data (matrix format for ComparisonTable) ──
  const comparisonCategories = useMemo(
    () => buildComparisonCategories(comparisonEditions, language),
    [comparisonEditions, language]
  );

  // ── Actions ──
  const selectPlan = useCallback(
    (edition: PlanEdition) => {
      onSelectPlan(edition, billingCycle);
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
