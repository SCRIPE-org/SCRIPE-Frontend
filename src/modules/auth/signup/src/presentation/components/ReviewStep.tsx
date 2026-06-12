"use client";

import { useCallback, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Loader2,
  CheckCircle,
  CalendarClock,
  BellRing,
  ShieldCheck,
  TicketPercent,
  Lock,
  Pencil,
} from "lucide-react";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { CheckoutMode, SelectedPlan } from "../../domain/entities";

interface ReviewStepProps {
  vm: {
    wizardData: {
      billingCycle: string | null;
      subdomain: string;
      email: string;
    };
    isLoading: boolean;
    error: string;
    checkoutCanceled: boolean;
    dismissCheckoutCanceled: () => void;
    startProvisioning: () => Promise<void>;
    goBack: () => void;
    editPlan: () => void;
    selectedPlan: SelectedPlan | null;
    selectedCheckoutMode: CheckoutMode;
  };
}

/**
 * ReviewStep — Step 5 of the Signup Wizard. Branches STRICTLY on the
 * server-decided checkoutMode:
 *
 *  - "free"     → plan summary + "Create your workspace". ZERO payment language.
 *  - "trial"    → card IS collected on Stripe's page: schedule block shows the trial
 *                 window, the exact post-trial price, "cancel anytime", and the
 *                 3-day reminder promise. CTA continues to secure checkout.
 *  - "checkout" → billed total + CTA to secure checkout.
 *
 *  Promo codes are entered ONLY on Stripe's checkout page (promo hint shown for
 *  trial/checkout). Arabic locale additionally notes the payment page language.
 */
export function ReviewStep({ vm }: ReviewStepProps) {
  const { t, language, direction } = useI18n();
  const mode = vm.selectedCheckoutMode;
  const plan = vm.selectedPlan;

  const isFree = mode === "free";
  const isTrial = mode === "trial";
  const isCheckout = mode === "checkout";
  const trialDays = plan?.trialDays ?? 14;

  const handleProceed = useCallback(async () => {
    await vm.startProvisioning();
  }, [vm]);

  // ── Price formatting (server already resolved the currency) ──
  const cycleIsAnnual = vm.wizardData.billingCycle === "Annual";
  const priceAmount = cycleIsAnnual ? plan?.annualPrice : plan?.monthlyPrice;
  const cycleLabel = cycleIsAnnual
    ? t("signup.plan.annual") || "Annual"
    : t("signup.plan.monthly") || "Monthly";
  const formattedPrice = useMemo(() => {
    if (priceAmount == null) return "";
    const num = priceAmount.toLocaleString(language === "ar" ? "ar-EG" : "en-US");
    return `${num} ${plan?.currency ?? ""}`;
  }, [priceAmount, plan?.currency, language]);
  const perCycle = cycleIsAnnual
    ? t("signup.review.perYear") || "year"
    : t("signup.review.perMonth") || "month";

  // ── Summary rows ──
  const summaryRows = [
    {
      label: t("signup.review.planLabel") || "Plan",
      value: plan?.name || "—",
    },
    ...(isFree
      ? []
      : [
          {
            label: t("signup.review.billingLabel") || "Billing",
            value: `${cycleLabel}${formattedPrice ? ` — ${formattedPrice}` : ""}`,
          },
        ]),
    {
      label: t("signup.review.workspaceLabel") || "Workspace",
      value: `${vm.wizardData.subdomain}.admin.scripe.org`,
    },
    {
      label: t("signup.review.accountLabel") || "Account",
      value: vm.wizardData.email,
    },
  ];

  return (
    <div className="space-y-6" dir={direction}>
      {/* ═══ Checkout-canceled banner (?canceled=1 from Stripe cancel_url) ═══ */}
      {vm.checkoutCanceled && (
        <div
          className="flex items-start justify-between gap-3 rounded-xl p-4"
          role="status"
          style={{
            background: "rgba(234,179,8,0.07)",
            border: "1px solid rgba(234,179,8,0.25)",
          }}
        >
          <p className="text-[13px] font-medium" style={{ color: "#eab308" }}>
            {t("signup.review.checkoutCanceled") ||
              "Checkout canceled — you can try again or change your plan."}
          </p>
          <button
            type="button"
            onClick={vm.dismissCheckoutCanceled}
            className="shrink-0 text-xs font-semibold"
            style={{ color: BRAND_TOKENS.text.tertiary }}
            aria-label={t("common.dismiss") || "Dismiss"}
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══ Header ═══ */}
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
          {isFree
            ? t("signup.review.freeTitle") || "You're all set!"
            : isTrial
              ? t("signup.review.trialTitle", { days: trialDays }) ||
                `Start your ${trialDays}-day free trial`
              : t("signup.review.checkoutTitle") || "Review your plan"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
          {isFree
            ? t("signup.review.freeSubtitle") || "Review your details and create your workspace."
            : isTrial
              ? t("signup.review.trialSubtitle") ||
                "Add a card on the secure checkout page — you won't be charged during the trial."
              : t("signup.review.checkoutSubtitle") ||
                "Please confirm your details before continuing to secure checkout."}
        </p>
      </div>

      {/* ═══ Plan summary card ═══ */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {summaryRows.map(({ label, value }, i) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom:
                i < summaryRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <span className="text-xs" style={{ color: BRAND_TOKENS.text.tertiary }}>
              {label}
            </span>
            <span
              className="max-w-[55%] truncate text-end text-xs font-medium"
              style={{ color: BRAND_TOKENS.text.primary }}
            >
              {value}
            </span>
          </div>
        ))}
        {/* Edit plan (U5) */}
        <div
          className="flex justify-end px-4 py-2.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <button
            type="button"
            onClick={vm.editPlan}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-white"
            style={{ color: BRAND_TOKENS.text.brand }}
          >
            <Pencil className="h-3 w-3" />
            {t("signup.review.editPlan") || "Edit plan"}
          </button>
        </div>
      </div>

      {/* ═══ TRIAL: schedule block — full price/charge-date transparency (U3) ═══ */}
      {isTrial && (
        <div
          className="space-y-3 rounded-xl p-4"
          style={{
            background: "rgba(34,211,238,0.05)",
            border: "1px solid rgba(34,211,238,0.18)",
          }}
        >
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_TOKENS.text.cyan }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: BRAND_TOKENS.text.cyan }}>
                {t("signup.review.trialStarts", { days: trialDays }) ||
                  `${trialDays}-day free trial — starts when you complete checkout`}
              </p>
              {formattedPrice && (
                <p className="mt-1 text-sm font-semibold" style={{ color: BRAND_TOKENS.text.primary }}>
                  {t("signup.review.thenPrice", { price: formattedPrice, cycle: perCycle }) ||
                    `Then ${formattedPrice}/${perCycle}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: BRAND_TOKENS.text.success }} />
            <p className="text-xs font-medium" style={{ color: BRAND_TOKENS.text.secondary }}>
              {t("signup.review.cancelAnytime") || "Cancel anytime"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BellRing className="h-4 w-4 shrink-0" style={{ color: BRAND_TOKENS.text.cyan }} />
            <p className="text-xs font-medium" style={{ color: BRAND_TOKENS.text.secondary }}>
              {t("signup.review.reminder") || "We'll remind you 3 days before any charge"}
            </p>
          </div>
        </div>
      )}

      {/* ═══ CHECKOUT: billed total ═══ */}
      {isCheckout && formattedPrice && (
        <div
          className="flex items-center justify-between rounded-xl p-4"
          style={{
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.18)",
          }}
        >
          <span className="text-sm font-medium" style={{ color: BRAND_TOKENS.text.secondary }}>
            {t("signup.review.billedTotal") || "Billed today"}
          </span>
          <span className="text-base font-bold" style={{ color: BRAND_TOKENS.text.primary }}>
            {formattedPrice}
            <span className="text-xs font-medium" style={{ color: BRAND_TOKENS.text.tertiary }}>
              {" "}/ {perCycle}
            </span>
          </span>
        </div>
      )}

      {/* ═══ Promo hint + secure note (trial/checkout only — never on free) ═══ */}
      {!isFree && (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <TicketPercent className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND_TOKENS.text.tertiary }} />
            <p className="text-xs" style={{ color: BRAND_TOKENS.text.tertiary }}>
              {t("signup.review.promoHint") ||
                "Have a promo code? Apply it on the secure checkout page."}
            </p>
          </div>
          {language === "ar" && (
            <div className="flex items-center gap-2.5">
              <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND_TOKENS.text.tertiary }} />
              <p className="text-xs" style={{ color: BRAND_TOKENS.text.tertiary }}>
                {t("signup.review.paymentPageNote") ||
                  "ستتم إعادة توجيهك إلى صفحة دفع آمنة (باللغة الإنجليزية)"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Error ═══ */}
      {vm.error && (
        <div
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {/* ═══ CTA — exact copy contract per checkoutMode ═══ */}
      <Button
        type="button"
        onClick={handleProceed}
        disabled={vm.isLoading}
        className="h-12 w-full rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
        style={{
          background: BRAND_TOKENS.gradient.cta,
          boxShadow: BRAND_TOKENS.shadow.cta,
        }}
      >
        {vm.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFree ? (
          <>
            <CheckCircle className="me-2 h-4 w-4" />
            {t("signup.review.createWorkspace") || "Create your workspace"}
          </>
        ) : isTrial ? (
          t("signup.review.startTrialCta") || "Start free trial — continue to secure checkout"
        ) : (
          t("signup.review.checkoutCta") || "Continue to secure checkout"
        )}
      </Button>

      {/* ═══ Back ═══ */}
      <div className="text-center">
        <Button
          variant="link"
          type="button"
          onClick={vm.goBack}
          className="text-sm font-medium underline underline-offset-2"
          style={{ color: BRAND_TOKENS.text.tertiary }}
        >
          {t("signup.common.back") || "← Back"}
        </Button>
      </div>
    </div>
  );
}
