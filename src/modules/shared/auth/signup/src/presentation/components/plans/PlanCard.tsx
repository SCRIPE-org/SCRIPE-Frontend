// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { PublicFeature } from "../../../domain/entities";
import type { PlanPickerEdition } from "../../viewmodels/usePlanPicker";
import { ctaKeyForCheckoutMode, formatCurrency } from "../../helpers/planPickerLogic";

// ═══════════════════════════════════════════════════════════════════════════
// PlanCard — one plan, Elevate-compliant. Structurally bug-proof:
//
//   • SINGLE badge slot in the header row. At most ONE badge renders, with
//     precedence Recommended > Most popular > Best value. The slot is a
//     RESERVED inline row (fixed height) so cards align even when no badge
//     shows — never absolute-positioned, never two overlapping badges.
//   • Price via Intl.NumberFormat(locale, { style:"currency", currency }) — no
//     hardcoded "$". Enterprise/contact-sales shows "Custom", never a price.
//   • The whole card body is a CSS subgrid row template owned by PlanGrid, so
//     header / price / divider / features / CTA align across all cards and the
//     CTAs sit on one baseline regardless of feature-list length.
//   • Accent (ring + faint tint) only for the recommended card — no glow.
//
// Pure UI — selection + formatting come from props / the viewmodel.
// ═══════════════════════════════════════════════════════════════════════════

const RECOMMENDED_BADGE = "recommended" as const;
const MOST_POPULAR_BADGE = "mostPopular" as const;
const BEST_VALUE_BADGE = "bestValue" as const;
type BadgeKind = typeof RECOMMENDED_BADGE | typeof MOST_POPULAR_BADGE | typeof BEST_VALUE_BADGE;

/** Normalize an admin-set edition badge string to one of our known kinds. */
function classifyEditionBadge(badge: string | null): BadgeKind | null {
  if (!badge) return null;
  const b = badge.toLowerCase();
  if (b.includes("popular")) return MOST_POPULAR_BADGE;
  if (b.includes("value") || b.includes("best")) return BEST_VALUE_BADGE;
  return null;
}

interface PlanCardProps {
  edition: PlanPickerEdition;
  billingCycle: "monthly" | "annual";
  /** Resolved currency code (server/geo-locked). */
  currency: string;
  /** BCP-47 locale for Intl formatting. */
  locale: string;
  /** True when the price is FX-converted from USD (shows an approximate marker). */
  isFxConverted: boolean;
  /** Recommendation reasons — the first is shown as a short line under a recommended card. */
  reasons: string[];
  /** Staggered entrance index. */
  index: number;
  onSelect: (edition: PlanPickerEdition, billingCycle: "monthly" | "annual") => void;
}

/**
 * Presentation UI component rendering the plan card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PlanCard({
  edition,
  billingCycle,
  currency,
  locale,
  isFxConverted,
  reasons,
  index,
  onSelect,
}: PlanCardProps) {
  const { t } = useI18n();
  const { tokens } = useSignupTheme();
  const reduceMotion = useReducedMotion();

  // ── Single badge slot — precedence: recommended > mostPopular > bestValue. ──
  const badge: BadgeKind | null = edition.isRecommended
    ? RECOMMENDED_BADGE
    : classifyEditionBadge(edition.badge);

  const isFree = edition.priceDisplay === "free";
  const isCustom = edition.priceDisplay === "custom" || edition.checkoutMode === "contact-sales";

  const monthlyPrice = edition.monthlyPrice;
  const annualPrice = edition.annualPrice;
  const checkoutMode = edition.checkoutMode;
  const trialDays = edition.trialDays;

  // ── Price (Intl-formatted; "Custom" for contact-sales, "Free" for free). ────
  const priceText = useMemo(() => {
    if (isFree || isCustom) return null;
    const amount = billingCycle === "monthly" ? monthlyPrice : annualPrice;
    const monthly = billingCycle === "annual" && amount ? Math.round(amount / 12) : amount;
    return formatCurrency(monthly, currency, locale, isFxConverted);
  }, [
    isFree,
    isCustom,
    billingCycle,
    monthlyPrice,
    annualPrice,
    currency,
    locale,
    isFxConverted,
  ]);

  const annualText = useMemo(() => {
    if (isFree || isCustom || billingCycle !== "annual" || !annualPrice) return null;
    return formatCurrency(annualPrice, currency, locale, isFxConverted);
  }, [isFree, isCustom, billingCycle, annualPrice, currency, locale, isFxConverted]);

  // ── CTA label by checkoutMode (key mapping is a shared pure helper). ─────────
  const ctaLabel = useMemo(
    () =>
      t(ctaKeyForCheckoutMode(checkoutMode), {
        days: trialDays ?? 14,
        price: priceText ?? "",
      }),
    [checkoutMode, trialDays, priceText, t]
  );

  const badgeLabel = badge ? t(`signup.plans.badge.${badge}`) : null;
  const reason = badge === RECOMMENDED_BADGE ? (reasons[0] ?? null) : null;
  const isAccent = badge === RECOMMENDED_BADGE;

  const entrance = reduceMotion
    ? undefined
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const, delay: index * 0.05 },
      };

  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      {...entrance}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.015 }}
      // The card spans the grid's shared 5-row template (subgrid) so every
      // section aligns across cards and CTAs sit on one baseline.
      className="grid grid-rows-subgrid rounded-2xl p-6 transition-all duration-300 ease-out [grid-row:span_5] sm:p-8"
      style={{
        background: isAccent
          ? hovered
            ? `${tokens.accent}14`
            : `${tokens.accent}0d`
          : hovered
            ? tokens.surfaceRaised
            : tokens.surfaceCard,
        border: isAccent
          ? hovered
            ? `1px solid ${tokens.accent}`
            : tokens.borderActive
          : hovered
            ? `1px solid ${tokens.accent}40`
            : tokens.borderCard,
        // No resting-state glow, per the "accent only via ring + faint tint,
        // never glow" rule above — the recommended card reads from its tinted
        // background and border alone until it's actually hovered.
        boxShadow: hovered ? tokens.shadowCard : "none",
      }}
    >
      {/* ── Row 1: reserved badge slot (fixed line; renders ≤ 1 badge) ── */}
      <div className="mb-2.5 flex min-h-[1.75rem] items-start">
        {badgeLabel && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wide"
            style={
              badge === RECOMMENDED_BADGE
                ? {
                    background: `${tokens.accent}1f`,
                    color: tokens.accent,
                    border: `1px solid ${tokens.accent}40`,
                  }
                : badge === MOST_POPULAR_BADGE
                  ? {
                      background: `${tokens.accent}12`,
                      color: tokens.accent,
                      border: `1px solid ${tokens.accent}28`,
                    }
                  : /* bestValue */ {
                      background: `${tokens.cyan}18`,
                      color: tokens.cyan,
                      border: `1px solid ${tokens.cyan}35`,
                    }
            }
          >
            {badge === RECOMMENDED_BADGE && <Sparkles size={11} aria-hidden />}
            {badgeLabel}
          </span>
        )}
      </div>

      {/* ── Row 2: name + tagline + price ── */}
      <div className="flex flex-col gap-1">
        <h3
          className="text-[1rem] font-semibold leading-tight sm:text-[1.125rem]"
          style={{ color: tokens.ink }}
        >
          {edition.name}
        </h3>
        {edition.tagline && (
          <p
            className="line-clamp-2 text-[0.8125rem] leading-snug"
            style={{ color: tokens.inkFaint }}
          >
            {edition.tagline}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
          {isFree ? (
            <>
              <span
                className="text-[1.625rem] font-bold leading-none xl:text-[2rem]"
                style={{ color: tokens.ink }}
              >
                {t("signup.plans.price.free")}
              </span>
              <span className="text-[0.8125rem]" style={{ color: tokens.inkFaint }}>
                {t("signup.plans.price.forever")}
              </span>
            </>
          ) : isCustom ? (
            <span
              className="text-[1.375rem] font-bold leading-none xl:text-[1.5rem]"
              style={{ color: tokens.ink }}
            >
              {t("signup.plans.price.custom")}
            </span>
          ) : (
            <>
              <span
                className="text-[1.625rem] font-bold leading-none xl:text-[2rem]"
                style={{ color: tokens.ink }}
              >
                {priceText}
              </span>
              <span className="text-[0.8125rem]" style={{ color: tokens.inkFaint }}>
                /{t("signup.plans.price.perMonth")}
              </span>
            </>
          )}
        </div>

        {/* Annual sub-line + approximate marker — fixed presence avoids jitter */}
        <div
          className="mt-1 flex min-h-[1.25rem] flex-wrap items-center gap-x-2 text-[0.75rem]"
          style={{ color: tokens.inkFaint }}
        >
          {annualText && <span>{t("signup.plans.price.perYear", { price: annualText })}</span>}
          {!isFree && !isCustom && isFxConverted && (
            <span title={t("signup.plans.price.approxTooltip")}>
              {t("signup.plans.price.approx")}
            </span>
          )}
        </div>

        {/* Why recommended — a single short reason line for the recommended card */}
        {reason && (
          <p
            className="mt-2 inline-flex items-start gap-1.5 text-[0.75rem] leading-snug"
            style={{ color: tokens.accent }}
          >
            <Check size={13} className="mt-0.5 shrink-0" aria-hidden />
            <span>{reason}</span>
          </p>
        )}
      </div>

      {/* ── Row 3: divider ── */}
      <div className="my-5 h-px w-full" style={{ background: tokens.border }} />

      {/* ── Row 4: feature list (this is the only flexible-height row) ── */}
      <ul className="space-y-2.5">
        {edition.topFeatures.map((feat, i) => (
          <FeatureRow
            key={`${edition.id}-f-${i}`}
            feature={feat}
            accent={tokens.accent}
            ink={tokens.inkMuted}
            faint={tokens.inkFaint}
          />
        ))}
      </ul>

      {/* ── Row 5: CTA (bottom-aligned across all cards by the subgrid) ── */}
      <div className="mt-6 flex items-end">
        <button
          type="button"
          onClick={() => onSelect(edition, billingCycle)}
          className="w-full rounded-xl px-4 py-3 text-[0.875rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none"
          style={
            {
              ...(isAccent
                ? {
                    background: tokens.gradientCta,
                    color: tokens.accentContrast,
                    boxShadow: tokens.shadowCard,
                  }
                : {
                    background: tokens.surfaceRaised,
                    color: tokens.ink,
                    border: tokens.borderCard,
                  }),
              // CSS custom props for the Tailwind focus ring (cast covers the index signature).
              "--tw-ring-color": tokens.accent,
              "--tw-ring-offset-color": "transparent",
            } as unknown as CSSProperties
          }
        >
          {ctaLabel}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
// Localized labels arrive from the backend (displayLabelEn/Ar); we fall back to
// the feature name. Numeric -1 = unlimited; numeric 0 / boolean false skip.

function FeatureRow({
  feature,
  accent,
  ink,
  faint,
}: {
  feature: PublicFeature;
  accent: string;
  ink: string;
  faint: string;
}) {
  const { t, language } = useI18n();
  const displayLabel =
    (language === "ar" ? feature.displayLabelAr : feature.displayLabelEn) ??
    feature.displayLabelEn ??
    null;

  let text: string | null = displayLabel ?? feature.name;

  if (feature.valueType === "Boolean") {
    if (feature.value !== "true" && feature.value !== "1") return null;
    text = displayLabel ?? feature.name;
  } else if (feature.valueType === "Numeric" && !displayLabel) {
    const num = parseInt(feature.value, 10);
    if (Number.isNaN(num) || num === 0) return null;
    text = `${feature.name}: ${num === -1 ? t("signup.plans.feature.unlimited") : num.toLocaleString()}`;
  } else if (feature.valueType === "Text" && !displayLabel && !feature.value?.trim()) {
    return null;
  } else if (feature.valueType === "Text" && !displayLabel) {
    text = feature.value;
  }

  if (!text) return null;

  return (
    <li className="flex items-start gap-2.5">
      <Check size={15} className="mt-0.5 shrink-0" style={{ color: accent }} aria-hidden />
      <span className="text-[0.8125rem] leading-snug" style={{ color: ink }}>
        {text}
        {feature.isMarketingOnly && <span className="ms-1" style={{ color: faint }} />}
      </span>
    </li>
  );
}
