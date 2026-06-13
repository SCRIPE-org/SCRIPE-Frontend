"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Shield, Users, Zap, Globe, Headphones, Package, Star } from "lucide-react";
import type { PublicFeature } from "../../domain/entities";
import type { PlanEdition } from "../viewmodels/usePlanPickerViewModel";
import { formatFeatureName } from "../viewmodels/usePlanPickerViewModel";

// ─── Feature icon by category (like Vercel) ──────────────────────────────────

function getFeatureIcon(featureName: string) {
  if (featureName.startsWith("Identity.")) return Users;
  if (
    featureName.startsWith("Marketing.SSO") ||
    featureName.includes("2FA") ||
    featureName.includes("Security")
  )
    return Shield;
  if (
    featureName.startsWith("Marketing.Support") ||
    featureName.includes("Onboarding") ||
    featureName.includes("Training")
  )
    return Headphones;
  if (featureName.startsWith("Modules.")) return Package;
  if (featureName.startsWith("Marketing.SLA") || featureName.includes("Backup")) return Zap;
  return Globe;
}

// ─── Feature Row ──────────────────────────────────────────────────────────────

function FeatureRow({ feature }: { feature: PublicFeature }) {
  const { t, language } = useI18n();
  const { value, valueType } = feature;

  const displayLabel =
    language === "ar" && feature.displayLabelAr
      ? feature.displayLabelAr
      : (feature.displayLabelEn ?? null);

  const label = displayLabel || formatFeatureName(feature.name);
  const iconComponent = getFeatureIcon(feature.name);

  // Boolean → show only if true
  if (valueType === "Boolean") {
    if (value !== "true" && value !== "1") return null;
    return (
      <li className="flex items-start gap-3 py-1.5">
        {React.createElement(iconComponent, { className: "mt-0.5 h-4 w-4 shrink-0 text-white/30" })}
        <span className="text-[13px] leading-relaxed text-white/65">{label}</span>
      </li>
    );
  }

  // Numeric → hide 0 values
  if (valueType === "Numeric") {
    const num = parseInt(value, 10);
    if (num === 0 || isNaN(num)) return null;

    if (displayLabel) {
      return (
        <li className="flex items-start gap-3 py-1.5">
          {React.createElement(iconComponent, {
            className: "mt-0.5 h-4 w-4 shrink-0 text-white/30",
          })}
          <span className="text-[13px] leading-relaxed text-white/65">{displayLabel}</span>
        </li>
      );
    }

    return (
      <li className="flex items-center gap-3 py-1.5">
        {React.createElement(iconComponent, { className: "h-4 w-4 shrink-0 text-white/30" })}
        <span className="text-[13px] leading-relaxed text-white/55">
          {label}:&nbsp;
          {num === -1 ? (
            <span className="font-semibold text-cyan-400">
              {t("signup.plan.unlimited") || "Unlimited"}
            </span>
          ) : (
            <span className="font-semibold text-white/85">{num.toLocaleString()}</span>
          )}
        </span>
      </li>
    );
  }

  // Text — skip empty
  if (!value?.trim()) return null;

  return (
    <li className="flex items-start gap-3 py-1.5">
      {React.createElement(iconComponent, { className: "mt-0.5 h-4 w-4 shrink-0 text-white/30" })}
      <span className="text-[13px] leading-relaxed text-white/65">{displayLabel || value}</span>
    </li>
  );
}

// ─── Currency formatting ───────────────────────────────────────────────────────

/**
 * Formats a price using Intl.NumberFormat with the edition's real currency code.
 * If the price is FX-converted (not a hand-set price), prepends ≈ to indicate
 * it is approximate and will be billed in the base currency.
 */
function formatPrice(amount: number, currencyCode: string, isApproximate: boolean): string {
  try {
    const formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return isApproximate ? `≈\u202F${formatted}` : formatted;
  } catch {
    // Graceful fallback if currency code is invalid
    return `${amount.toLocaleString()} ${currencyCode}`;
  }
}

// ─── Plan Card (Vercel-style) ─────────────────────────────────────────────────

interface PlanCardProps {
  edition: PlanEdition;
  index: number;
  prevEditionName?: string | null;
  billingCycle: "monthly" | "annual";
  onSelect: (edition: PlanEdition) => void;
  /** Recommended tier from Discovery engine (e.g. "pro", "business", "enterprise") */
  recommendedTier?: string | null;
  /** Active currency code (e.g. "USD", "EGP", "SAR"). Drives Intl.NumberFormat. */
  currencyCode?: string;
  /** True if the price is FX-converted (not hand-set). Shows ≈ prefix. */
  isFxConverted?: boolean;
}

export function PlanCard({
  edition,
  index,
  prevEditionName,
  billingCycle,
  onSelect,
  recommendedTier,
  currencyCode = "USD",
  isFxConverted = false,
}: PlanCardProps) {
  const { t } = useI18n();
  const price = billingCycle === "monthly" ? edition.monthlyPrice : edition.annualPrice;
  const monthlyEquiv = billingCycle === "annual" && price ? Math.round(price / 12) : price;
  const isFree = edition.monthlyPrice === 0 && edition.tierLevel === 0;
  const isContactSales = edition.checkoutMode === "contact-sales";
  const isHighlighted = !!edition.badge;

  // ── Recommendation badge ──────────────────────────────────────────────────
  // Map the Discovery engine's tier key to the edition's numeric tierLevel.
  // Tier-level matching is deterministic and locale-safe — immune to
  // display-name changes and the earlier substring-match operator-precedence bugs.
  const RECOMMENDED_TIER_LEVEL: Record<string, number> = {
    free: 0,
    pro: 1,
    ultra: 2,
    enterprise: 3,
  };
  const isRecommended =
    !!recommendedTier &&
    edition.tierLevel === (RECOMMENDED_TIER_LEVEL[recommendedTier.toLowerCase()] ?? -1);

  // Compute "Everything in X, plus:" text (Vercel pattern)
  const inheritanceText = prevEditionName
    ? t("signup.plan.inheritanceText", { prevEditionName }) ||
      `All ${prevEditionName} features, plus:`
    : null;

  return (
    <div
      className="relative flex w-full flex-col rounded-2xl transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: isHighlighted
          ? "linear-gradient(180deg, rgba(30,16,60,0.7), rgba(14,10,32,0.8))"
          : "rgba(255,255,255,0.02)",
        border: isHighlighted
          ? "1.5px solid rgba(168,85,247,0.35)"
          : isRecommended
            ? "1.5px solid rgba(34,211,238,0.35)"
            : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isHighlighted
          ? "0 0 40px rgba(168,85,247,0.08)"
          : isRecommended
            ? "0 0 32px rgba(34,211,238,0.07)"
            : "none",
        animation: `sxRise 500ms cubic-bezier(.22,.61,.36,1) ${index * 80}ms both`,
      }}
    >
      {/* Recommendation badge — shown when Discovery recommends this tier */}
      {isRecommended && (
        <div className="absolute inset-x-0 -top-3.5 z-20 flex justify-center">
          <span
            className="flex items-center gap-1.5 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(99,102,241,0.18))",
              border: "1px solid rgba(34,211,238,0.4)",
              color: "#22D3EE",
              backdropFilter: "blur(12px)",
            }}
          >
            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            {t("signup.plan.recommended") || "Recommended for you"}
          </span>
        </div>
      )}

      {/* Edition badge (admin-set, e.g. "Most Popular") */}
      {edition.badge && (
        <div className="absolute -top-3 start-5 z-10">
          <Badge
            variant="default"
            className="rounded-full border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg, #A855F7, #7C3AED)", color: "#fff" }}
          >
            {edition.badge}
          </Badge>
        </div>
      )}

      {/* Top section: name, tagline, price */}
      <div className="p-6 pb-0 sm:p-7 sm:pb-0">
        <h3 className="text-lg font-bold text-white/95 sm:text-xl">{edition.name}</h3>

        {edition.tagline && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/40">
            {edition.tagline}
          </p>
        )}

        {/* Price */}
        <div className="mt-5 flex items-baseline gap-1.5">
          {isFree ? (
            <>
              <span className="text-3xl font-extrabold text-white/95">
                {t("signup.plan.free") || "Free"}
              </span>
              <span className="text-sm text-white/30">{t("signup.plan.forever") || "forever"}</span>
            </>
          ) : isContactSales ? (
            <span className="text-xl font-bold text-white/95">
              {t("signup.plan.custom") || "Custom pricing"}
            </span>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-white/95">
                {monthlyEquiv != null
                  ? formatPrice(monthlyEquiv, currencyCode, isFxConverted)
                  : "—"}
              </span>
              <span className="text-sm text-white/35">/{t("signup.plan.mo") || "mo"}</span>
              {billingCycle === "annual" && price ? (
                <span className="ms-1 text-xs text-white/25">
                  ({formatPrice(price, currencyCode, isFxConverted)}/{t("signup.plan.yr") || "yr"})
                </span>
              ) : null}
              {isFxConverted && (
                <span
                  className="ms-2 text-[10px] text-white/30"
                  title={
                    t("signup.plan.fxConvertedTooltip") || "Approximate. Billed in USD at checkout."
                  }
                >
                  {t("signup.plan.approximateNote") || "Approx."}
                </span>
              )}
            </>
          )}
        </div>

        {/* Trial */}
        {edition.trialDays && !isFree && !isContactSales && (
          <p className="mt-1.5 text-xs font-semibold text-cyan-400">
            {t("signup.plan.trialDays", { days: edition.trialDays }) ||
              `${edition.trialDays}-day free trial`}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 my-5 border-t border-white/[0.06] sm:mx-7" />

      {/* "Everything in X, plus:" — Vercel inheritance pattern */}
      {inheritanceText && (
        <p className="px-6 pb-3 text-[13px] font-medium text-white/45 sm:px-7">{inheritanceText}</p>
      )}

      {/* Features — scrolls naturally with the page */}
      <ul className="flex-1 space-y-0.5 px-6 pb-6 sm:px-7 sm:pb-7">
        {edition.topFeatures.map((feat, i) => (
          <FeatureRow key={`${edition.id}-f-${i}`} feature={feat} />
        ))}
      </ul>

      {/* CTA — at the BOTTOM like Vercel */}
      <div className="p-6 pt-0 sm:p-7 sm:pt-0">
        <Button
          type="button"
          className="w-full rounded-lg py-3 text-sm font-semibold transition-all duration-200"
          onClick={() => onSelect(edition)}
          style={{
            background: isHighlighted
              ? "linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)"
              : "rgba(255,255,255,0.06)",
            color: isHighlighted ? "#fff" : "rgba(245,242,255,0.8)",
            border: isHighlighted ? "none" : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {isContactSales
            ? t("signup.plan.contactSales") || "Get a demo"
            : isFree
              ? t("signup.plan.startFree") || "Start Deploying"
              : t("signup.plan.choosePlan", { plan: edition.name }) || `Start a free trial`}
          <span className="ms-1.5">→</span>
        </Button>
      </div>
    </div>
  );
}
