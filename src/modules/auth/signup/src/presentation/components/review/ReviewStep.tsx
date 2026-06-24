// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import { useMemo } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Loader2,
  Lock,
  Pencil,
  ShieldCheck,
  TicketPercent,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { BRAND } from "@core/config/branding";
import { reviewCopyKeysForMode } from "../../viewmodels/helpers/reviewLogic";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";

// ═══════════════════════════════════════════════════════════════════════════
// ReviewStep — the review phase (F8). A calm product summary of the selected
// plan + billing cycle + workspace + email, with the CTA and copy MATCHING the
// server-decided checkoutMode:
//   • free     → ZERO payment language; CTA "Create workspace".
//   • trial    → trial schedule block (window, then-price, cancel-anytime,
//                reminder); CTA "Start trial".
//   • checkout → billed-today total; CTA "Subscribe — {price}".
// For trial/checkout under Arabic, a localized note flags that the Stripe page
// is in English. Edit affordances jump back to plan/account.
//
// Product-register calm: solid-ink heading (no gradient text), restrained
// surfaces, the single accent moment is the primary CTA. Reduced-motion safe;
// RTL-aware (the URL preview stays LTR). Dumb UI — register/branch lives in the
// wizard (submitRegister composes the reused provisioning hook).
// ═══════════════════════════════════════════════════════════════════════════

interface ReviewStepProps {
  wizard: SignupWizardViewModel;
}

/**
 * Presentation UI component rendering the review step.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ReviewStep({ wizard }: ReviewStepProps) {
  const { t, language, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const { wizardData, selectedPlan, checkoutMode } = wizard;
  const isFree = checkoutMode === "free";
  const isTrial = checkoutMode === "trial";
  const isCheckout = checkoutMode === "checkout";
  const trialDays = selectedPlan?.trialDays ?? 14;

  // ── Price (server already resolved the currency; we only format it) ──
  const cycleIsAnnual = wizardData.billingCycle === "Annual";
  const priceAmount = cycleIsAnnual ? selectedPlan?.annualPrice : selectedPlan?.monthlyPrice;
  const cycleLabel = cycleIsAnnual ? t("signup.plan.annual") : t("signup.plan.monthly");
  const perCycle = cycleIsAnnual ? t("signup.review.perYear") : t("signup.review.perMonth");
  const formattedPrice = useMemo(() => {
    if (priceAmount == null) return "";
    const num = priceAmount.toLocaleString(language === "ar" ? "ar-EG" : "en-US");
    return `${num} ${selectedPlan?.currency ?? ""}`.trim();
  }, [priceAmount, selectedPlan?.currency, language]);

  // ── Summary rows ──
  const summaryRows = [
    { key: "plan", label: t("signup.review.planLabel"), value: selectedPlan?.name || "—" },
    ...(isFree
      ? []
      : [
          {
            key: "billing",
            label: t("signup.review.billingLabel"),
            value: `${cycleLabel}${formattedPrice ? ` — ${formattedPrice}` : ""}`,
          },
        ]),
    {
      key: "workspace",
      label: t("signup.review.workspaceLabel"),
      value: `${wizardData.subdomain}.${BRAND.domain}`,
    },
    { key: "account", label: t("signup.review.accountLabel"), value: wizardData.email },
  ];

  // Copy keys come from the pure mapping (unit tested); the few keys that take
  // params (trial days, subscribe price) are interpolated here at render time.
  const copy = reviewCopyKeysForMode(checkoutMode);
  const ctaLabel =
    isCheckout && formattedPrice ? t(copy.ctaKey, { price: formattedPrice }) : t(copy.ctaKey);
  const title = isTrial ? t(copy.titleKey, { days: trialDays }) : t(copy.titleKey);
  const subtitle = t(copy.subtitleKey);

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-10 sm:px-8 sm:py-14" dir={direction}>
      {/* ── Checkout-canceled banner (Stripe cancel_url round-trip) ── */}
      {wizard.checkoutCanceled && (
        <div
          role="status"
          className="mb-6 flex items-start justify-between gap-3 rounded-xl px-4 py-3"
          style={{ background: `${tokens.cyan}14`, border: `1px solid ${tokens.cyan}33` }}
        >
          <p className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
            {t("signup.review.checkoutCanceled")}
          </p>
          <button
            type="button"
            onClick={wizard.dismissCheckoutCanceled}
            aria-label={t("signup.review.dismiss")}
            className="shrink-0 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: tokens.inkFaint }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Heading ── */}
      <header className="mb-7 flex flex-col gap-2">
        <h1
          className="font-semibold"
          style={{
            color: tokens.ink,
            fontSize: "clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p className="text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {subtitle}
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {/* ── Summary card ── */}
        <div
          className="overflow-hidden rounded-xl"
          style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
        >
          <dl>
            {summaryRows.map((row, i) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-4 px-4 py-3"
                style={i > 0 ? { borderTop: `1px solid ${tokens.border}` } : undefined}
              >
                <dt className="text-[0.75rem]" style={{ color: tokens.inkFaint }}>
                  {row.label}
                </dt>
                <dd
                  className="max-w-[60%] truncate text-end text-[0.8125rem] font-semibold"
                  style={{ color: tokens.ink }}
                  dir={row.key === "workspace" ? "ltr" : undefined}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          {/* Edit plan */}
          <div
            className="flex justify-end px-4 py-2.5"
            style={{ borderTop: `1px solid ${tokens.border}` }}
          >
            <button
              type="button"
              onClick={wizard.editPlan}
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold transition-opacity hover:opacity-80"
              style={{ color: tokens.accent }}
            >
              <Pencil className="h-3 w-3" aria-hidden="true" />
              {t("signup.review.editPlan")}
            </button>
          </div>
        </div>

        {/* ── TRIAL schedule block — full price/charge-date transparency ── */}
        {isTrial && (
          <div
            className="flex flex-col gap-3 rounded-xl p-4"
            style={{ background: tokens.surfaceRaised, border: `1px solid ${tokens.cyan}29` }}
          >
            <div className="flex items-start gap-3">
              <CalendarClock
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
                style={{ color: tokens.cyan }}
              />
              <div>
                <p className="text-[0.8125rem] font-semibold" style={{ color: tokens.ink }}>
                  {t("signup.review.trialStarts", { days: trialDays })}
                </p>
                {formattedPrice && (
                  <p
                    className="mt-0.5 text-[0.8125rem] font-semibold"
                    style={{ color: tokens.ink }}
                  >
                    {t("signup.review.thenPrice", { price: formattedPrice, cycle: perCycle })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
                style={{ color: tokens.success }}
              />
              <p className="text-[0.75rem] font-medium" style={{ color: tokens.inkMuted }}>
                {t("signup.review.cancelAnytime")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CalendarClock
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
                style={{ color: tokens.cyan }}
              />
              <p className="text-[0.75rem] font-medium" style={{ color: tokens.inkMuted }}>
                {t("signup.review.reminder")}
              </p>
            </div>
          </div>
        )}

        {/* ── CHECKOUT billed-today total ── */}
        {isCheckout && formattedPrice && (
          <div
            className="flex items-center justify-between rounded-xl p-4"
            style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
          >
            <span className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
              {t("signup.review.billedTotal")}
            </span>
            <span className="text-[0.9375rem] font-bold" style={{ color: tokens.ink }}>
              {formattedPrice}
              <span className="text-[0.75rem] font-medium" style={{ color: tokens.inkFaint }}>
                {" "}
                / {perCycle}
              </span>
            </span>
          </div>
        )}

        {/* ── Promo hint + Arabic payment-page note (trial/checkout only) ── */}
        {!isFree && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <TicketPercent
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
                style={{ color: tokens.inkFaint }}
              />
              <p className="text-[0.75rem]" style={{ color: tokens.inkFaint }}>
                {t("signup.review.promoHint")}
              </p>
            </div>
            {language === "ar" && (
              <div className="flex items-center gap-2.5">
                <Lock
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                  style={{ color: tokens.inkFaint }}
                />
                <p className="text-[0.75rem]" style={{ color: tokens.inkFaint }}>
                  {t("signup.review.paymentPageNote")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Flow error ── */}
        {wizard.error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium"
            style={{
              background: `${tokens.error}1a`,
              border: `1px solid ${tokens.error}40`,
              color: tokens.error,
            }}
          >
            {wizard.error}
          </div>
        )}

        {/* ── Primary CTA — the single accent moment, copy per checkoutMode ── */}
        <button
          type="button"
          onClick={wizard.submitRegister}
          disabled={wizard.isSubmitting}
          aria-busy={wizard.isSubmitting}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transform-none"
          style={{
            background: tokens.gradientCta,
            color: tokens.accentContrast,
            boxShadow: tokens.shadowCard,
          }}
        >
          {wizard.isSubmitting ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span className="sr-only">{t("signup.common.loading")}</span>
            </>
          ) : (
            <>
              {isFree && <Check className="h-4 w-4" aria-hidden="true" />}
              {ctaLabel}
            </>
          )}
        </button>

        {/* ── Back ── */}
        <button
          type="button"
          onClick={wizard.back}
          disabled={wizard.isSubmitting}
          className="mx-auto inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
          style={{ color: tokens.inkMuted }}
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
          {t("signup.common.back")}
        </button>
      </div>
    </div>
  );
}

export default ReviewStep;
