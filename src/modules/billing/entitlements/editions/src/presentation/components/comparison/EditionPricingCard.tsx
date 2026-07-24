"use client";

import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check, Infinity, PhoneCall, Zap } from "lucide-react";
import type { Edition } from "../../../domain/entities/Edition";
import type {
  BillingCycle,
  PricingHighlight,
} from "../../viewmodels/useEditionComparisonViewModel";
import { formatComparisonMessage } from "./comparisonFormatting";
import { RecommendationBadge } from "./RecommendationBadge";

/** How many highlights fit before the card starts counting the rest. */
const MAX_HIGHLIGHTS = 10;

interface EditionPricingCardProps {
  edition: Edition;
  selectedCycle: BillingCycle;
  priceInfo: { price: number | undefined; isFree: boolean; isContactSales: boolean };
  savingsPercent: number;
  highlights: PricingHighlight[];
  isRecommended?: boolean;
  language: string;
}

function formatAmount(amount: number, language: string, currency = "USD"): string {
  const locale = language === "ar" ? "ar-EG" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return amount.toLocaleString(locale);
  }
}

/**
 * Read-only public-pricing preview. The CTA-like block intentionally uses
 * non-interactive semantics because this admin screen previews content and
 * cannot perform checkout actions; its purpose is announced to screen readers
 * rather than hidden behind a `title`.
 *
 * The recommended card used to sit 2% larger than its neighbours behind a ring
 * and two coloured drop shadows — a card that floats and grows is furniture,
 * and the scale broke the grid's baseline on every viewport. The recommendation
 * now reads exactly where the user is already looking: the accent hairline plus
 * the one badge, which is the same badge the comparison column wears.
 */
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
  const primaryLabel =
    labels[0] ?? (isRecommended ? t("entitlements.editions.comparison.mostPopular") : null);
  const titleId = `edition-card-title-${edition.id}`;

  const cycleLabel =
    selectedCycle === "Monthly"
      ? t("entitlements.editions.comparison.perMonth")
      : selectedCycle === "Yearly"
        ? t("entitlements.editions.comparison.perYear")
        : t("entitlements.editions.comparison.oneTime");
  const cycleDescription =
    selectedCycle === "Monthly"
      ? t("entitlements.editions.comparison.billedMonthly")
      : selectedCycle === "Yearly"
        ? t("entitlements.editions.comparison.billedAnnually")
        : t("entitlements.editions.comparison.payOnce");

  const trialText = edition.trialIsFree
    ? formatComparisonMessage(t("entitlements.editions.comparison.freeTrialDays"), {
        days: edition.trialDurationDays,
      })
    : formatComparisonMessage(t("entitlements.editions.comparison.discountedTrialDays"), {
        days: edition.trialDurationDays,
        discount: edition.trialDiscountPercent,
      });

  const previewCta = priceInfo.isContactSales
    ? t("entitlements.editions.comparison.contactSales")
    : priceInfo.isFree || priceInfo.price === 0
      ? t("entitlements.editions.comparison.getStartedFree")
      : edition.allowTrial && edition.trialDurationDays > 0
        ? formatComparisonMessage(t("entitlements.editions.comparison.startTrialDays"), {
            days: edition.trialDurationDays,
          })
        : t("entitlements.editions.comparison.getStarted");

  const ctaIsPrimary = isRecommended && !priceInfo.isContactSales;

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className={cn("relative flex h-full flex-col", isRecommended && "border-nx-accent")}
    >
      {primaryLabel && (
        // The pill straddles the card's top edge, so it needs an opaque disc
        // behind it — the accent wash is translucent and would otherwise let
        // the hairline run straight through the label.
        <div className="absolute inset-x-0 -top-3 flex justify-center">
          <span className="rounded-full bg-nx-surface">
            <RecommendationBadge label={primaryLabel} />
          </span>
        </div>
      )}

      <CardHeader>
        <CardTitle id={titleId} className="uppercase">
          {displayName}
        </CardTitle>
        {edition.tagline && <CardDescription>{edition.tagline}</CardDescription>}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1" aria-live="polite">
          {priceInfo.isContactSales ? (
            <>
              <span className="text-3xl font-semibold leading-none tracking-tight text-nx-ink">
                {t("entitlements.editions.comparison.customPricing")}
              </span>
              <span className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.editions.comparison.contactForPricing")}
              </span>
            </>
          ) : priceInfo.isFree || priceInfo.price === 0 ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold leading-none tracking-tight tabular-nums text-nx-ink">
                  {formatAmount(0, language)}
                </span>
                <span className="text-sm font-medium text-nx-ink-2">
                  {t("entitlements.editions.comparison.perMonth")}
                </span>
              </div>
              <span className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.editions.comparison.freeForever")}
              </span>
            </>
          ) : priceInfo.price !== undefined ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold leading-none tracking-tight tabular-nums text-nx-ink">
                  {formatAmount(priceInfo.price, language)}
                </span>
                <span className="text-sm font-medium text-nx-ink-2">{cycleLabel}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs leading-relaxed text-nx-ink-3">{cycleDescription}</span>
                {selectedCycle === "Yearly" && savingsPercent > 0 && (
                  <Badge variant="success">
                    {formatComparisonMessage(
                      t("entitlements.editions.comparison.savePercent"),
                      { percent: savingsPercent }
                    )}
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl font-semibold leading-none tracking-tight text-nx-ink-3">
                —
              </span>
              <span className="text-xs leading-relaxed text-nx-ink-3">
                {formatComparisonMessage(
                  t("entitlements.editions.comparison.billingUnavailable"),
                  { cycle: cycleLabel }
                )}
              </span>
            </>
          )}
        </div>

        {edition.allowTrial && edition.trialDurationDays > 0 && (
          <div className="flex items-center gap-2 rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash px-3 py-2">
            <Zap aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-nx-accent" />
            <span className="text-xs font-medium text-nx-accent">{trialText}</span>
          </div>
        )}

        <div
          className={cn(
            "flex min-h-10 w-full items-center justify-center gap-2 rounded-nx-control border px-4 py-2 text-sm font-medium",
            ctaIsPrimary
              ? "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill"
              : "border-nx-line bg-nx-raised text-nx-ink"
          )}
        >
          {/* The block looks like a CTA but cannot be actioned here, so the
              preview framing is spoken rather than left to the visual context. */}
          <span className="sr-only">{t("entitlements.editions.comparison.adminPreview")}: </span>
          {priceInfo.isContactSales && <PhoneCall aria-hidden="true" className="h-4 w-4" />}
          {previewCta}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 border-t border-nx-line pt-5">
          {highlights.slice(0, MAX_HIGHLIGHTS).map((highlight, index) => (
            <div key={`${highlight.label}-${index}`} className="flex items-start gap-2.5">
              {highlight.isUnlimited ? (
                <Infinity aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nx-accent" />
              ) : (
                <Check aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nx-accent" />
              )}
              <span className="text-sm leading-snug text-nx-ink">
                {highlight.value && highlight.value !== "Unlimited" ? (
                  <>
                    <span className="font-semibold tabular-nums">{highlight.value}</span>{" "}
                    <span className="text-nx-ink-2">{highlight.label}</span>
                  </>
                ) : highlight.isUnlimited ? (
                  <>
                    <span className="font-semibold">
                      {t("entitlements.editions.comparison.unlimited")}
                    </span>{" "}
                    <span className="text-nx-ink-2">{highlight.label}</span>
                  </>
                ) : (
                  <span className="text-nx-ink-2">{highlight.label}</span>
                )}
              </span>
            </div>
          ))}
          {highlights.length > MAX_HIGHLIGHTS && (
            <p className="mt-1 text-xs leading-relaxed text-nx-ink-3">
              {formatComparisonMessage(t("entitlements.editions.comparison.moreFeatures"), {
                count: highlights.length - MAX_HIGHLIGHTS,
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
