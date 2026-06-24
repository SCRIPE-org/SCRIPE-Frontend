// UI-EXCEPTION: compact studio layout
"use client";
/**
 * EditionPricingCard — Industry-standard pricing card for the comparison page.
 *
 * Follows patterns from Vercel, Linear, Notion:
 * - Price updates based on selected billing cycle (passed from parent toggle)
 * - Shows savings badge ("Save 17%") on yearly
 * - Shows trial badge with duration
 * - Progressive feature highlights with human-readable values
 * - "Most Popular" / "Best Value" badges from recommendationLabels
 * - Contact Sales CTA for enterprise-only editions
 */

import type { Edition } from "../../../domain/entities/Edition";
import type {
  BillingCycle,
  PricingHighlight,
} from "../../viewmodels/useEditionComparisonViewModel";
import { Check, Infinity, Star, PhoneCall, Zap } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

interface EditionPricingCardProps {
  edition: Edition;
  selectedCycle: BillingCycle;
  priceInfo: { price: number | undefined; isFree: boolean; isContactSales: boolean };
  savingsPercent: number;
  highlights: PricingHighlight[];
  isRecommended?: boolean;
  language: string;
}

/** Format a price amount to locale string */
function formatAmount(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

/** Human-readable billing cycle label */
function cycleLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case "Monthly":
      return "/ month";
    case "Yearly":
      return "/ year";
    case "Lifetime":
      return "one-time";
  }
}

/** Small cycle description shown below price */
function cycleSub(cycle: BillingCycle): string {
  switch (cycle) {
    case "Monthly":
      return "Billed monthly";
    case "Yearly":
      return "Billed annually";
    case "Lifetime":
      return "Pay once, use forever";
  }
}

export function EditionPricingCard({
  edition,
  selectedCycle,
  priceInfo,
  savingsPercent,
  highlights,
  isRecommended,
  language,
}: EditionPricingCardProps) {
  const { t } = useI18n();
  const displayName = edition.getDisplayName(language);
  const labels = edition.recommendationLabels;
  const primaryLabel = labels[0] ?? (isRecommended ? "Most Popular" : null);

  return (
    <div
      className={`relative flex h-full flex-col border bg-card transition-all duration-200 ${
        isRecommended
          ? "scale-[1.02] border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
          : "border-border hover:border-primary/40 hover:shadow-md"
      } `}
    >
      {/* ─── Recommendation Badge ─── */}
      {primaryLabel && (
        <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
          <span className="inline-flex items-center gap-1 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
            <Star className="h-3 w-3" />
            {primaryLabel}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 pt-8">
        {/* ─── Header ─── */}
        <div className="mb-4">
          <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
            {displayName}
          </h3>
          {edition.tagline && (
            <p className="mt-1 text-sm text-muted-foreground">{edition.tagline}</p>
          )}
        </div>

        {/* ─── Price Block ─── */}
        <div className="mb-6">
          {priceInfo.isContactSales ? (
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black tracking-tight text-foreground">Custom</span>
              <span className="text-xs text-muted-foreground">Contact us for pricing</span>
            </div>
          ) : priceInfo.isFree || priceInfo.price === 0 ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-foreground">$0</span>
                <span className="text-sm font-medium text-muted-foreground">/ month</span>
              </div>
              <span className="text-xs text-muted-foreground">Free forever</span>
            </div>
          ) : priceInfo.price !== undefined ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-foreground">
                  {formatAmount(priceInfo.price)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {cycleLabel(selectedCycle)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{cycleSub(selectedCycle)}</span>
                {selectedCycle === "Yearly" && savingsPercent > 0 && (
                  <span className="bg-green-50 px-1.5 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-950/30 dark:text-green-400">
                    Save {savingsPercent}%
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black tracking-tight text-muted-foreground">—</span>
              <span className="text-xs text-muted-foreground">
                {selectedCycle} billing not available
              </span>
            </div>
          )}
        </div>

        {/* ─── Trial Badge ─── */}
        {edition.allowTrial && edition.trialDurationDays > 0 && (
          <div className="mb-5 flex items-center gap-2 border border-dashed border-primary/50 bg-primary/5 px-3 py-2">
            <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-xs font-medium text-primary">
              {edition.trialIsFree
                ? `${edition.trialDurationDays}-day free trial`
                : `${edition.trialDurationDays}-day trial at ${edition.trialDiscountPercent}% off`}
            </span>
          </div>
        )}

        {/* ─── CTA ─── */}
        <div className="mb-6">
          {priceInfo.isContactSales ? (
            <button className="flex w-full items-center justify-center gap-2 border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
              <PhoneCall className="h-4 w-4" />
              Contact Sales
            </button>
          ) : priceInfo.isFree || priceInfo.price === 0 ? (
            <button className="flex w-full items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
              Get Started Free
            </button>
          ) : (
            <button
              className={`flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                isRecommended
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border text-foreground hover:bg-accent"
              }`}
            >
              {edition.allowTrial && edition.trialDurationDays > 0
                ? `Start ${edition.trialDurationDays}-Day Trial`
                : "Get Started"}
            </button>
          )}
        </div>

        {/* ─── Divider ─── */}
        <div className="mb-5 border-t border-border" />

        {/* ─── Feature Highlights ─── */}
        <div className="flex flex-1 flex-col gap-2.5">
          {highlights.slice(0, 10).map((h, i) => (
            <div key={i} className="flex items-start gap-2.5">
              {h.isUnlimited ? (
                <Infinity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              ) : (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              )}
              <span className="text-sm leading-snug text-foreground">
                {h.value && h.value !== "Unlimited" ? (
                  <>
                    <span className="font-semibold">{h.value}</span>{" "}
                    <span className="text-muted-foreground">{h.label}</span>
                  </>
                ) : h.isUnlimited ? (
                  <>
                    <span className="font-semibold">Unlimited</span>{" "}
                    <span className="text-muted-foreground">{h.label}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{h.label}</span>
                )}
              </span>
            </div>
          ))}
          {highlights.length > 10 && (
            <p className="mt-1 text-xs text-muted-foreground">
              + {highlights.length - 10} more features
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
