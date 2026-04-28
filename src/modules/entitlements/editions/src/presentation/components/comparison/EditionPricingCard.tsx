/**
 * EditionPricingCard — Single Vercel-style pricing card for the hero section.
 *
 * Displays:
 * - Recommendation badges (deterministic colors)
 * - Edition name + tagline
 * - Price (free / amount / custom)
 * - Progressive feature highlights ("All [prev] features, plus:")
 * - Admin-preview-only label (no subscribe action)
 */
"use client";

import { Check, Infinity as InfinityIcon } from "lucide-react";
import { RecommendationBadge } from "./RecommendationBadge";
import type { Edition } from "../../../domain/entities/Edition";

interface PricingCardHighlight {
  label: string;
  isUnlimited?: boolean;
}

interface EditionPricingCardProps {
  edition: Edition;
  language: string;
  previousEditionName?: string;
  highlights: PricingCardHighlight[];
  isRecommended: boolean;
  allHighlightsLabel: string;  // "All {prev} features, plus:"
  priceLabel: string;          // "/month"
  freeLabel: string;
  customLabel: string;
  previewLabel: string;        // "Admin Preview"
}

function formatPrice(price: number | undefined): { amount: string; suffix: string } {
  if (!price || price === 0) return { amount: "Free", suffix: "" };
  return {
    amount: `$${price.toFixed(0)}`,
    suffix: "/mo",
  };
}

export function EditionPricingCard({
  edition,
  language,
  previousEditionName,
  highlights,
  isRecommended,
  allHighlightsLabel,
  priceLabel,
  freeLabel,
  customLabel,
  previewLabel,
}: EditionPricingCardProps) {
  const displayName = edition.getDisplayName(language) || edition.name;
  const badges = edition.recommendationLabels;
  const { amount, suffix } = edition.isContactSalesOnly
    ? { amount: customLabel, suffix: "" }
    : formatPrice(edition.baseMonthlyPriceUsd);

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
          {edition.description && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {edition.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          <span className={`font-bold tracking-tight ${amount === freeLabel || amount === customLabel ? "text-2xl" : "text-3xl"}`}>
            {amount}
          </span>
          {suffix && (
            <span className="mb-1 text-sm text-muted-foreground">{suffix}</span>
          )}
        </div>

        {/* Billing badges */}
        <div className="flex flex-wrap gap-1">
          {edition.allowMonthly && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Monthly</span>
          )}
          {edition.allowYearly && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Yearly</span>
          )}
          {edition.allowLifetime && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Lifetime</span>
          )}
          {edition.allowTrial && (
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              {edition.trialIsFree ? "Free Trial" : `${edition.trialDiscountPercent}% Trial`}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-border/40" />

      {/* Feature highlights */}
      <div className="flex flex-col gap-2.5 p-6 flex-1">
        {previousEditionName && highlights.length > 0 && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {allHighlightsLabel.replace("{prev}", previousEditionName)}
          </p>
        )}
        {!previousEditionName && highlights.length > 0 && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Includes:
          </p>
        )}
        <ul className="space-y-2">
          {highlights.slice(0, 7).map((h, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-2.5 w-2.5 text-primary" />
              </span>
              <span className="text-sm text-foreground/80">
                {h.isUnlimited ? (
                  <span className="flex items-center gap-1">
                    {h.label}
                    <InfinityIcon className="h-3 w-3 text-primary" />
                  </span>
                ) : (
                  h.label
                )}
              </span>
            </li>
          ))}
          {highlights.length > 7 && (
            <li className="text-xs text-muted-foreground pl-6.5">
              +{highlights.length - 7} more features
            </li>
          )}
        </ul>
      </div>

      {/* Admin preview footer */}
      <div className="mx-6 mb-6 mt-auto">
        <div className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 py-2 px-4">
          <span className="text-xs text-muted-foreground/60 font-medium">{previewLabel}</span>
        </div>
      </div>
    </div>
  );
}
