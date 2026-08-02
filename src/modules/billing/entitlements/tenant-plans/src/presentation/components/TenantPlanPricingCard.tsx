/**
 * @file TenantPlanPricingCard.tsx
 * @description Renders a pricing card detailing TenantPlan features, cycle options, and recommendation badges.
 * Imports RecommendationBadge from entitlements core to comply with Clean Architecture rules.
 */

/**
 * TenantPlanPricingCard — Vercel-style pricing card for the Tenant Plan comparison.
 *
 * Purpose-built for TenantPlan entities — never reuse EditionPricingCard with `as any`.
 * TenantPlan is a class with private `data` + getters; spread won't copy getters.
 *
 * Displays:
 * - Badge text (optional — plan.badgeText)
 * - Plan display name (localized)
 * - Price (free / amount / contact-sales)
 * - Progressive feature highlights ("All {prev} features, plus:")
 * - Admin-preview-only label
 */
"use client";

import { cn, resolveBilingualLabel, resolveIntlLocale } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Check, Infinity as InfinityIcon } from "lucide-react";
import { RecommendationBadge } from "@modules/entitlements/core";
import type { TenantPlan } from "../../domain/entities/TenantPlan";

interface PricingCardHighlight {
  label: string;
  isUnlimited?: boolean;
}

interface TenantPlanPricingCardProps {
  plan: TenantPlan;
  language: string;
  previousPlanName?: string;
  highlights: PricingCardHighlight[];
  isRecommended: boolean;
  selectedCycle: "Monthly" | "Yearly" | "Lifetime";
  allHighlightsLabel: string;
  freeLabel: string;
  customLabel: string;
  previewLabel: string;
}

/**
 * Presentation UI component rendering the tenant plan pricing card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanPricingCard({
  plan,
  language,
  previousPlanName,
  highlights,
  isRecommended,
  selectedCycle,
  allHighlightsLabel,
  freeLabel,
  customLabel,
  previewLabel,
}: TenantPlanPricingCardProps) {
  const { t } = useI18n();
  const displayName =
    resolveBilingualLabel(plan.displayNameEn ?? "", plan.displayNameAr ?? "", language) ||
    plan.name;
  const badges = plan.badgeText ? [plan.badgeText] : [];
  const locale = resolveIntlLocale(language);

  let priceAmount: string;
  let priceSuffix = "";

  if (plan.isContactSalesOnly) {
    priceAmount = customLabel;
  } else if (!plan.hasPrices) {
    priceAmount = freeLabel;
  } else {
    const cyclePrices = plan.prices.filter((p) => p.billingCycle === selectedCycle);
    if (cyclePrices.length > 0) {
      const cheapest = cyclePrices.reduce(
        (min, p) => (p.amount < min.amount ? p : min),
        cyclePrices[0]
      );
      priceAmount = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: cheapest.currency || "USD",
        minimumFractionDigits: 0,
      }).format(cheapest.amount);

      if (selectedCycle === "Monthly")
        priceSuffix = t("entitlements.tenantPlans.comparison.monthShort");
      else if (selectedCycle === "Yearly")
        priceSuffix = t("entitlements.tenantPlans.comparison.yearShort");
      else if (selectedCycle === "Lifetime")
        priceSuffix = t("entitlements.tenantPlans.comparison.once");
    } else {
      // Fallback if the selected cycle is not supported by this specific plan
      priceAmount = "—";
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-nx-lg border bg-nx-surface",
        "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        // The recommended card wears the page's one sanctioned glow, at rest —
        // it does not need a hover cue on top of it. Every other card gets the
        // system's plain hairline-brighten hover; neither card lifts.
        isRecommended ? "border-nx-accent shadow-nx-glow" : "border-nx-line hover:border-nx-line-hi"
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <RecommendationBadge key={badge} label={badge} size="sm" />
            ))}
          </div>
        )}

        {/* Name + tagline */}
        <div>
          <h3 className="text-base font-bold text-nx-ink">{displayName}</h3>
          {plan.tagline && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-nx-ink-2">
              {plan.tagline}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "font-bold tabular-nums tracking-tight text-nx-ink",
              priceAmount === freeLabel || priceAmount === customLabel ? "text-2xl" : "text-3xl"
            )}
          >
            {priceAmount}
          </span>
          {priceSuffix && <span className="text-sm text-nx-ink-2">/{priceSuffix}</span>}
        </div>

        {/* Trial info */}
        {plan.hasTrial && (
          <p className="text-xs text-nx-ink-2">
            {t("entitlements.tenantPlans.comparison.trialDaysFree", { days: plan.trialDays })}
          </p>
        )}

        {/* Separator */}
        <div className="h-px bg-nx-line" />

        {/* Progressive highlights */}
        <div className="flex min-h-[120px] flex-col gap-2">
          {previousPlanName && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-nx-ink-3">
              {allHighlightsLabel.replace("{prev}", previousPlanName)}
            </p>
          )}
          {highlights.map((hl, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  hl.isUnlimited ? "bg-nx-accent-wash text-nx-accent" : "bg-success/10 text-success"
                )}
                aria-hidden="true"
              >
                {hl.isUnlimited ? (
                  <InfinityIcon className="h-2.5 w-2.5" />
                ) : (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm leading-tight text-nx-ink-2">{hl.label}</span>
            </div>
          ))}
          {highlights.length === 0 && !previousPlanName && (
            <p className="text-xs italic text-nx-ink-3">
              {t("entitlements.tenantPlans.comparison.corePlanLabel")}
            </p>
          )}
        </div>
      </div>

      {/* Admin Preview Label */}
      <div className="mt-auto border-t border-nx-line bg-nx-raised px-6 py-3">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-nx-ink-3">
          {previewLabel}
        </p>
      </div>
    </div>
  );
}
