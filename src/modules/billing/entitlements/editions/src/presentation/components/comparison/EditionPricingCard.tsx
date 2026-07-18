// UI-EXCEPTION: compact studio layout
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import type { Edition } from "../../../domain/entities/Edition";
import type {
  BillingCycle,
  PricingHighlight,
} from "../../viewmodels/useEditionComparisonViewModel";
import { Check, Infinity, Star, PhoneCall, Zap } from "lucide-react";

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
  try {
    return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

function formatMessage(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template
  );
}

/**
 * Read-only public-pricing preview. The CTA-like blocks intentionally use non-interactive
 * semantics because this admin screen previews content and cannot perform checkout actions.
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
    labels[0] ??
    (isRecommended ? t("entitlements.editions.comparison.mostPopular") || "Most Popular" : null);
  const titleId = `edition-card-title-${edition.id}`;

  const cycleLabel =
    selectedCycle === "Monthly"
      ? t("entitlements.editions.comparison.perMonth") || "/ month"
      : selectedCycle === "Yearly"
        ? t("entitlements.editions.comparison.perYear") || "/ year"
        : t("entitlements.editions.comparison.oneTime") || "one-time";
  const cycleDescription =
    selectedCycle === "Monthly"
      ? t("entitlements.editions.comparison.billedMonthly") || "Billed monthly"
      : selectedCycle === "Yearly"
        ? t("entitlements.editions.comparison.billedAnnually") || "Billed annually"
        : t("entitlements.editions.comparison.payOnce") || "Pay once, use forever";

  const trialText = edition.trialIsFree
    ? formatMessage(
        t("entitlements.editions.comparison.freeTrialDays") || "{days}-day free trial",
        { days: edition.trialDurationDays }
      )
    : formatMessage(
        t("entitlements.editions.comparison.discountedTrialDays") ||
          "{days}-day trial at {discount}% off",
        { days: edition.trialDurationDays, discount: edition.trialDiscountPercent }
      );

  const previewCta = priceInfo.isContactSales
    ? t("entitlements.editions.comparison.contactSales") || "Contact Sales"
    : priceInfo.isFree || priceInfo.price === 0
      ? t("entitlements.editions.comparison.getStartedFree") || "Get Started Free"
      : edition.allowTrial && edition.trialDurationDays > 0
        ? formatMessage(
            t("entitlements.editions.comparison.startTrialDays") || "Start {days}-Day Trial",
            { days: edition.trialDurationDays }
          )
        : t("entitlements.editions.comparison.getStarted") || "Get Started";

  return (
    <article
      aria-labelledby={titleId}
      className={`relative flex h-full flex-col border bg-card transition-all duration-200 motion-reduce:transition-none ${
        isRecommended
          ? "scale-[1.02] border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
          : "border-border hover:border-primary/40 hover:shadow-md"
      } `}
    >
      {primaryLabel && (
        <div className="absolute -top-3.5 inset-x-0 flex justify-center">
          <span className="inline-flex items-center gap-1 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
            <Star aria-hidden="true" className="h-3 w-3" />
            {primaryLabel}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 pt-8">
        <div className="mb-4">
          <h3 id={titleId} className="text-lg font-bold uppercase tracking-tight text-foreground">
            {displayName}
          </h3>
          {edition.tagline && (
            <p className="mt-1 text-sm text-muted-foreground">{edition.tagline}</p>
          )}
        </div>

        <div className="mb-6" aria-live="polite">
          {priceInfo.isContactSales ? (
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {t("entitlements.editions.comparison.customPricing") || "Custom"}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("entitlements.editions.comparison.contactForPricing") ||
                  "Contact us for pricing"}
              </span>
            </div>
          ) : priceInfo.isFree || priceInfo.price === 0 ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-foreground">$0</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {t("entitlements.editions.comparison.perMonth") || "/ month"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("entitlements.editions.comparison.freeForever") || "Free forever"}
              </span>
            </div>
          ) : priceInfo.price !== undefined ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-foreground">
                  {formatAmount(priceInfo.price, language)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">{cycleLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{cycleDescription}</span>
                {selectedCycle === "Yearly" && savingsPercent > 0 && (
                  <span className="bg-green-50 px-1.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-300">
                    {formatMessage(
                      t("entitlements.editions.comparison.savePercent") || "Save {percent}%",
                      { percent: savingsPercent }
                    )}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black tracking-tight text-muted-foreground">—</span>
              <span className="text-xs text-muted-foreground">
                {formatMessage(
                  t("entitlements.editions.comparison.billingUnavailable") ||
                    "{cycle} billing not available",
                  { cycle: cycleLabel }
                )}
              </span>
            </div>
          )}
        </div>

        {edition.allowTrial && edition.trialDurationDays > 0 && (
          <div className="mb-5 flex items-center gap-2 border border-dashed border-primary/50 bg-primary/5 px-3 py-2">
            <Zap aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-xs font-medium text-primary">{trialText}</span>
          </div>
        )}

        <div className="mb-6">
          <div
            aria-label={`${t("entitlements.editions.comparison.adminPreview") || "Admin Preview Only"}: ${previewCta}`}
            className={`flex min-h-9 w-full items-center justify-center gap-2 border px-4 py-2 text-sm font-medium ${
              isRecommended && !priceInfo.isContactSales
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground"
            }`}
          >
            {priceInfo.isContactSales && <PhoneCall aria-hidden="true" className="h-4 w-4" />}
            {previewCta}
          </div>
        </div>

        <div className="mb-5 border-t border-border" />

        <div className="flex flex-1 flex-col gap-2.5">
          {highlights.slice(0, 10).map((highlight, index) => (
            <div key={`${highlight.label}-${index}`} className="flex items-start gap-2.5">
              {highlight.isUnlimited ? (
                <Infinity aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              ) : (
                <Check aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              )}
              <span className="text-sm leading-snug text-foreground">
                {highlight.value && highlight.value !== "Unlimited" ? (
                  <>
                    <span className="font-semibold">{highlight.value}</span>{" "}
                    <span className="text-muted-foreground">{highlight.label}</span>
                  </>
                ) : highlight.isUnlimited ? (
                  <>
                    <span className="font-semibold">
                      {t("entitlements.editions.comparison.unlimited") || "Unlimited"}
                    </span>{" "}
                    <span className="text-muted-foreground">{highlight.label}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{highlight.label}</span>
                )}
              </span>
            </div>
          ))}
          {highlights.length > 10 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatMessage(
                t("entitlements.editions.comparison.moreFeatures") || "+ {count} more features",
                { count: highlights.length - 10 }
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
