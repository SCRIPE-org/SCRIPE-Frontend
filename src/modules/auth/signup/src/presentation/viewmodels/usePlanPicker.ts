"use client";

// ═══════════════════════════════════════════════════════════════════════════
// usePlanPicker — the Elevate plans phase viewmodel (F4).
//
// Reuses the SOUND data logic from the legacy usePlanPickerViewModel (catalog
// fetch, billing cycle, annual-savings calc, comparison-matrix builder) but
// adapts it to the NEW model:
//   • Category = the chosen vertical (wizard.businessType). The picker fetches
//     ONE vertical's catalog at a time — there is NO "all categories" list and
//     NO tab row. `activeIndustry` + `setIndustry(slug)` switch verticals.
//   • Currency is server/geo-locked. We expose the resolved `currency` + a
//     formatting `locale` only — NEVER a currency picker.
//   • Recommendation match uses the AES-encrypted `recommendedEditionId`, which
//     equals the catalog edition id — a direct, locale-safe string compare.
//
// Architecture: this is the ONLY layer that touches the signup repository.
// Components consume the returned object and stay dumb (MVVM).
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import { buildComparisonCategories } from "../helpers/planHelpers";
import { CURRENCY_TO_COUNTRY } from "../helpers/currencyGeo";
import {
  computeAnnualSavingsPercent,
  isRecommendedEdition,
  derivePriorityKeys,
  deriveBusinessType,
} from "../helpers/planPickerLogic";
import type { PlanEdition, ComparisonCategory, PublicEdition } from "../../domain/entities";
import type { OnboardingRecommendation } from "../../domain/entities/OnboardingEntities";

// Currencies with hand-set native prices in the seeder; everything else is
// FX-converted from USD (shown approximate). Mirrors the legacy picker.
const SEEDED_CURRENCIES = new Set(["USD", "EUR", "SAR", "EGP"]);

// Map an app language to a sensible BCP-47 locale for Intl number formatting.
// Currency formatting is driven by the `currency` code; the locale only affects
// grouping/decimal glyphs and RTL digit shaping.
function resolveLocale(language: string, currency: string): string {
  if (language === "ar") return "ar";
  const country = CURRENCY_TO_COUNTRY[currency?.toUpperCase()];
  return country ? `en-${country}` : "en-US";
}

/** A plan edition enriched with the precomputed "is this the recommended one?" flag. */
export interface PlanPickerEdition extends PlanEdition {
  /** True when this edition matches the server recommendation (encrypted-id compare). */
  isRecommended: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for plan picker view model.
 */
export interface PlanPickerViewModel {
  // ── Load state ─────────────────────────────────────────────────────────────
  isLoading: boolean;
  isError: boolean;
  retry: () => void;

  // ── Industry (vertical) switch — replaces the old tab row ────────────────────
  /** The active vertical slug whose catalog is shown (general | erp | healthcare | …). */
  activeIndustry: string | null;
  /** Switch verticals — refetches that vertical's catalog. */
  setIndustry: (slug: string) => void;
  /** Available industries to switch between (slug + localized label), from the categories API. */
  industries: { slug: string; label: string }[];

  // ── Currency (server/geo-locked — display only) ──────────────────────────────
  /** Resolved ISO-4217 currency code (read-only; never user-switchable here). */
  currency: string;
  /** BCP-47 locale used for Intl.NumberFormat. */
  locale: string;
  /** Geo-detected country (ISO 3166-1 alpha-2), or null — for the quiet region line. */
  detectedCountry: string | null;
  /** True when prices are FX-converted from USD (shown approximate). */
  isFxConverted: boolean;

  // ── Billing cycle + savings ──────────────────────────────────────────────────
  billingCycle: "monthly" | "annual";
  setBillingCycle: (cycle: "monthly" | "annual") => void;
  /** Computed annual savings %, 0 when not applicable. */
  annualSavingsPercent: number;
  /** True when at least one edition is paid (so the toggle is meaningful). */
  hasPaidEditions: boolean;

  // ── Editions ──────────────────────────────────────────────────────────────────
  /** The vertical's editions in tier order, each flagged with isRecommended. */
  editions: PlanPickerEdition[];

  // ── Comparison matrix ─────────────────────────────────────────────────────────
  comparisonCategories: ComparisonCategory[];
  /** Q3 priority values (lowercased) — used to highlight matching comparison rows. */
  priorityKeys: string[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for use plan picker args.
 */
export interface UsePlanPickerArgs {
  /** The chosen vertical from discovery (wizard.businessType). Defaults the industry. */
  businessType: string | null;
  /** The collected discovery answers — Q3 priorities drive comparison-row highlighting. */
  discoveryAnswers: Record<string, string[]>;
  /** The server recommendation (lands asynchronously; undefined while loading/absent). */
  recommendation: OnboardingRecommendation | undefined;
  initialCurrency?: string;
  initialCountry?: string | null;
}

/**
 * React hook/ViewModel orchestrating state and data flows for plan picker.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function usePlanPicker({
  businessType,
  discoveryAnswers,
  recommendation,
  initialCurrency,
  initialCountry,
}: UsePlanPickerArgs): PlanPickerViewModel {
  const { language } = useI18n();

  // ── Active vertical — defaults to the discovery choice, switchable. ──────────
  // We hold ONLY the user's explicit override (null until they switch). The
  // effective industry is the override ?? the discovery-derived vertical, so a
  // late-arriving discovery answer flows in WITHOUT a setState-in-effect — and
  // an explicit switch always wins. Pure derivation; no effect needed.
  const [industryOverride, setIndustryOverride] = useState<string | null>(null);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // ── Pricing context — geo-detected currency + supported list (server-locked). ──
  const { data: pricingContext, isFetched: isPricingContextFetched } = useQuery({
    queryKey: ["signup-pricing-context"],
    queryFn: () => authContainer.signupRepository.getPricingContext(),
    staleTime: 30 * 60 * 1000, // currency is country-locked per session
    retry: 1,
  });

  // Dev-only: append ?__currency=EGP (or SAR, EUR, USD) to override geo-detected currency.
  // This is stripped by the NODE_ENV guard and has zero production impact.
  const devCurrencyOverride =
    process.env.NODE_ENV === "development" && typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("__currency")?.toUpperCase() ?? null)
      : null;

  const currency =
    devCurrencyOverride ?? pricingContext?.recommendedCurrency ?? initialCurrency ?? "USD";
  const detectedCountry = initialCountry ?? pricingContext?.detectedCountry ?? null;
  const isFxConverted = !SEEDED_CURRENCIES.has(currency.toUpperCase());
  const locale = useMemo(() => resolveLocale(language, currency), [language, currency]);

  // ── Industries — for the elegant switch (slug + localized label). ────────────
  const { data: categories } = useQuery({
    queryKey: ["signup-categories", currency, language],
    queryFn: () =>
      authContainer.signupRepository.getCategories(
        devCurrencyOverride ? currency : undefined,
        language
      ),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: !!initialCurrency || isPricingContextFetched,
  });

  const industries = useMemo(
    () =>
      (categories ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({ slug: c.key, label: c.displayName })),
    [categories]
  );

  const activeIndustry = useMemo(() => {
    if (industryOverride) return industryOverride;
    const derived = businessType ?? deriveBusinessType(discoveryAnswers);
    if (derived) return derived;
    return industries[0]?.slug ?? null;
  }, [industryOverride, businessType, discoveryAnswers, industries]);

  // ── Catalog — fetch the ACTIVE vertical's editions (currency + lang aware). ──
  const {
    data: rawEditions,
    isLoading: isEditionsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["signup-editions", activeIndustry, currency, language],
    queryFn: () =>
      authContainer.signupRepository.getEditions(
        activeIndustry,
        devCurrencyOverride ? currency : undefined,
        language
      ),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!initialCurrency || isPricingContextFetched,
  });

  // ── Map → tier-sorted PlanEditions, flag the recommended one. ────────────────
  const recommendedEditionId = recommendation?.recommendedEditionId ?? null;

  const editions: PlanPickerEdition[] = useMemo(() => {
    const mapped = (rawEditions ?? [])
      .map(
        (entity: PublicEdition): PlanEdition => ({
          id: entity.id,
          name: entity.name,
          tagline: entity.tagline ?? "",
          tierLevel: entity.tier,
          category: entity.categoryKey,
          categoryDisplayName: entity.categoryDisplayName,
          monthlyPrice: entity.monthlyPrice ?? 0,
          annualPrice: entity.annualPrice ?? 0,
          currency: entity.currency,
          priceDisplay: entity.priceDisplay,
          trialDays: (entity.trialDays ?? 0) > 0 ? entity.trialDays : null,
          badge: entity.badge ?? (entity.isRecommended ? "Recommended" : null),
          topFeatures: entity.topFeatures,
          allFeatures: entity.allFeatures,
          checkoutMode: entity.checkoutMode,
          raw: entity,
        })
      )
      .sort((a, b) => a.tierLevel - b.tierLevel);
    return mapped.map((e) => ({
      // Direct compare: recommendedEditionId is the SAME encrypted id as the catalog id.
      ...e,
      isRecommended: isRecommendedEdition(
        e.id,
        recommendedEditionId,
        e.name,
        recommendation?.recommendedEditionName
      ),
    }));
  }, [rawEditions, recommendedEditionId, recommendation]);

  const hasPaidEditions = useMemo(() => editions.some((e) => e.monthlyPrice > 0), [editions]);

  // ── Annual savings % — from the first paid edition (reused legacy logic). ────
  const annualSavingsPercent = useMemo(() => computeAnnualSavingsPercent(editions), [editions]);

  // ── Comparison matrix — built from the active vertical's editions. ───────────
  const comparisonCategories = useMemo(
    () => buildComparisonCategories(editions, language),
    [editions, language]
  );

  // ── Q3 priorities — the first multi-select answer that isn't business_type. ──
  const priorityKeys = useMemo(() => derivePriorityKeys(discoveryAnswers), [discoveryAnswers]);

  const setIndustry = useCallback((slug: string) => setIndustryOverride(slug), []);
  const retry = useCallback(() => void refetch(), [refetch]);
  return useMemo(
    () => ({
      isLoading: (!initialCurrency && !isPricingContextFetched) || isEditionsLoading,
      isError,
      retry,
      activeIndustry,
      setIndustry,
      industries,
      currency,
      locale,
      detectedCountry,
      isFxConverted,
      billingCycle,
      setBillingCycle,
      annualSavingsPercent,
      hasPaidEditions,
      editions,
      comparisonCategories,
      priorityKeys,
    }),
    [
      initialCurrency,
      isPricingContextFetched,
      isEditionsLoading,
      isError,
      retry,
      activeIndustry,
      setIndustry,
      industries,
      currency,
      locale,
      detectedCountry,
      isFxConverted,
      billingCycle,
      annualSavingsPercent,
      hasPaidEditions,
      editions,
      comparisonCategories,
      priorityKeys,
    ]
  );
}