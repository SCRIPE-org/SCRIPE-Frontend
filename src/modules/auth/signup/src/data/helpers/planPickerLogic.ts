// ═══════════════════════════════════════════════════════════════════════════
// planPickerLogic — pure functions for the Elevate plans phase (F4).
//
// No React, no side-effects — fully unit-testable. Used by usePlanPicker (the
// viewmodel) and the plan components so the same rules are exercised by tests.
// ═══════════════════════════════════════════════════════════════════════════

import type { CheckoutMode } from "../../domain/entities";

/** Q1 industry/vertical answer key — mirrors useDiscovery.BUSINESS_TYPE_KEY. */
export const BUSINESS_TYPE_KEY = "business_type";

/**
 * Annual savings %, derived from the cheapest paid edition's monthly vs annual
 * price. Returns 0 when there is no paid edition or no positive monthly price.
 */
export function computeAnnualSavingsPercent(
  editions: { monthlyPrice: number; annualPrice: number }[],
): number {
  const first = editions.find((e) => e.monthlyPrice > 0);
  if (!first || first.monthlyPrice * 12 <= 0) return 0;
  return Math.round(((first.monthlyPrice * 12 - first.annualPrice) / (first.monthlyPrice * 12)) * 100);
}

/**
 * True when an edition matches the server recommendation. The recommended id is
 * the SAME AES-encrypted id as the catalog edition id, so a direct string
 * compare is correct and locale-safe. Null/empty recommendation ⇒ never matches.
 */
export function isRecommendedEdition(
  editionId: string,
  recommendedEditionId: string | null | undefined,
): boolean {
  return !!recommendedEditionId && editionId === recommendedEditionId;
}

/** The i18n key for the per-card CTA, keyed by the server-decided checkout mode. */
export function ctaKeyForCheckoutMode(mode: CheckoutMode): string {
  switch (mode) {
    case "free":
      return "signup.plans.cta.free";
    case "trial":
      return "signup.plans.cta.trial";
    case "contact-sales":
      return "signup.plans.cta.contactSales";
    case "checkout":
    default:
      return "signup.plans.cta.subscribe";
  }
}

/**
 * Q3 priority values: every selected value across answer keys that are NOT the
 * business-type question, lowercased for case-safe matching. Data-driven — the
 * priorities question key is never hardcoded.
 */
export function derivePriorityKeys(answers: Record<string, string[]>): string[] {
  const out: string[] = [];
  for (const [key, values] of Object.entries(answers)) {
    if (key === BUSINESS_TYPE_KEY) continue;
    for (const v of values) out.push(v.toLowerCase());
  }
  return out;
}

/** Derive the vertical slug from the discovery answer map (Q1), or null. */
export function deriveBusinessType(answers: Record<string, string[]>): string | null {
  return answers[BUSINESS_TYPE_KEY]?.[0] ?? null;
}

/**
 * Format a money amount with Intl, no hardcoded currency symbol. `approximate`
 * prepends a ≈ marker for FX-converted prices. Falls back gracefully on an
 * invalid currency code.
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
  approximate = false,
): string {
  try {
    const formatted = new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return approximate ? `≈ ${formatted}` : formatted;
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}
