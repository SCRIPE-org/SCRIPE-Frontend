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

import { Check, Infinity as InfinityIcon } from "lucide-react";
import { RecommendationBadge } from "@modules/entitlements/editions/src/presentation/components/comparison/RecommendationBadge";
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
  allHighlightsLabel: string;
  priceLabel: string;
  freeLabel: string;
  customLabel: string;
  previewLabel: string;
}

export function TenantPlanPricingCard({
  plan,
  language,
  previousPlanName,
  highlights,
  isRecommended,
  allHighlightsLabel,
  priceLabel,
  freeLabel,
  customLabel,
  previewLabel,
}: TenantPlanPricingCardProps) {
  const displayName =
    (language === "ar" ? plan.displayNameAr : plan.displayNameEn) || plan.name;
  const badges = plan.badgeText ? [plan.badgeText] : [];

  // Price display
  let priceAmount: string;
  let priceSuffix = "";
  if (plan.isContactSalesOnly) {
    priceAmount = customLabel;
  } else if (!plan.hasPrices) {
    priceAmount = freeLabel;
  } else {
    priceAmount = `$${plan.startingPrice.toFixed(0)}`;
    priceSuffix = "/mo";
  }

  return (
    <div
      className={`relative flex flex-col rounded-xl border transition-all duration-300 overflow-hidden
        ${
          isRecommended
            ? "border-primary/50 shadow-[0_0_0_1px_rgba(var(--primary),0.3),0_8px_40px_rgba(var(--primary),0.15)] bg-card"
            : "border-border/60 bg-card/80 hover:border-border hover:shadow-lg"
        }
      `}
    >
      {/* Top accent line for recommended */}
      {isRecommended && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      )}

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
          <h3 className="text-base font-bold text-foreground">{displayName}</h3>
          {plan.tagline && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {plan.tagline}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          <span
            className={`font-bold tracking-tight ${
              priceAmount === freeLabel || priceAmount === customLabel
                ? "text-2xl"
                : "text-3xl"
            }`}
          >
            {priceAmount}
          </span>
          {priceSuffix && (
            <span className="text-sm text-muted-foreground mb-1">
              {priceSuffix}
            </span>
          )}
        </div>

        {/* Trial info */}
        {plan.hasTrial && (
          <p className="text-xs text-muted-foreground">
            {plan.trialDays}-day free trial
          </p>
        )}

        {/* Separator */}
        <div className="h-px bg-border/50" />

        {/* Progressive highlights */}
        <div className="flex flex-col gap-2 min-h-[120px]">
          {previousPlanName && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {allHighlightsLabel.replace("{prev}", previousPlanName)}
            </p>
          )}
          {highlights.map((hl, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full
                  ${
                    hl.isUnlimited
                      ? "bg-primary/15 text-primary"
                      : "bg-emerald-500/15 text-emerald-500"
                  }`}
              >
                {hl.isUnlimited ? (
                  <InfinityIcon className="h-2.5 w-2.5" />
                ) : (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm text-foreground/80 leading-tight">
                {hl.label}
              </span>
            </div>
          ))}
          {highlights.length === 0 && !previousPlanName && (
            <p className="text-xs text-muted-foreground/60 italic">
              Core plan
            </p>
          )}
        </div>
      </div>

      {/* Admin Preview Label */}
      <div className="mt-auto border-t border-border/40 bg-muted/30 px-6 py-3">
        <p className="text-center text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">
          {previewLabel}
        </p>
      </div>
    </div>
  );
}
