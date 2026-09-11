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
import {
  computeAnnualSavingsPercent,
  isRecommendedEdition,
  derivePriorityKeys,
  deriveBusinessType,
} from "../helpers/planPickerLogic";
import type { PlanEdition, PublicEdition } from "../../domain/entities";
import {
  resolveLocale,
  SEEDED_CURRENCIES,
  type PlanPickerEdition,
  type PlanPickerViewModel,
  type UsePlanPickerArgs,
} from "./planPickerTypes";

export type { PlanPickerEdition, PlanPickerViewModel, UsePlanPickerArgs };

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
