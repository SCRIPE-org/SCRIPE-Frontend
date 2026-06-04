"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";

interface PaymentStepProps {
  vm: {
    wizardData: {
      editionId: string | null;
      billingCycle: string | null;
      promoCode: string;
    };
    isLoading: boolean;
    error: string;
    updateField: (field: string, value: unknown) => void;
    submitWorkspace: () => Promise<void>;
    goBack: () => void;
  };
  editionName?: string;
  trialDays?: number | null;
  isFree?: boolean;
}

/**
 * PaymentStep — Step 5 of the Signup Wizard
 *
 * Per tenant-signup.md §2 Step 5, three branches:
 * 1. Free tier: auto-advance (no payment needed)
 * 2. Trial-enabled: "Start your N-day free trial" — no card required
 * 3. Paid: Promo code input + Stripe Checkout redirect
 *
 * Per security-policy.md: rate limits on promo validation
 * Per copy.md §7: exact headings and CTAs
 */
export function PaymentStep({
  vm,
  editionName = "Professional",
  trialDays = 14,
  isFree = false,
}: PaymentStepProps) {
  const { t, direction } = useI18n();
  const [promoInput, setPromoInput] = useState(vm.wizardData.promoCode || "");
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // ── Apply promo code ──
  const handleApplyPromo = useCallback(async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");
    try {
      // TODO: Wire to promo validation API when available
      // For now: update field and show pending
      vm.updateField("promoCode", promoInput.trim());
      setPromoValid(true);
    } catch {
      setPromoError(t("signup.payment.promoInvalid") || "Invalid promo code.");
      setPromoValid(false);
    } finally {
      setIsApplyingPromo(false);
    }
  }, [promoInput, vm, t]);

  // ── Proceed (trial or skip) ──
  const handleProceed = useCallback(async () => {
    await vm.submitWorkspace();
  }, [vm]);

  // ── If free tier, auto-show a simple skip ──
  if (isFree) {
    return (
      <div className="space-y-6 text-center" dir={direction}>
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "rgba(245,242,255,0.95)" }}
          >
            {t("signup.payment.freeTitle") || "You're all set!"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "rgba(245,242,255,0.55)" }}>
            {t("signup.payment.freeSubtitle") || "No payment required for the Free plan."}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.15)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "#22D3EE" }}>
            {t("signup.payment.cardNotRequired") || "No credit card required"}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleProceed}
          disabled={vm.isLoading}
          className="w-full rounded-lg py-3 text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)",
            color: "#fff",
          }}
        >
          {vm.isLoading
            ? t("signup.payment.processing") || "Processing…"
            : t("signup.payment.continueFree") || "Continue →"}
        </Button>

        <Button
          variant="link"
          type="button"
          onClick={vm.goBack}
          className="text-sm font-medium underline underline-offset-2"
          style={{ color: "rgba(245,242,255,0.45)" }}
        >
          {t("signup.common.back") || "← Back"}
        </Button>
      </div>
    );
  }

  // ── Trial or Paid ──
  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "rgba(245,242,255,0.95)" }}
        >
          {trialDays
            ? t("signup.payment.trialTitle", { days: trialDays }) ||
              `Start your ${trialDays}-day trial`
            : t("signup.payment.paidTitle") || "Complete your purchase"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "rgba(245,242,255,0.55)" }}>
          {editionName} {t("signup.payment.plan") || "plan"}
        </p>
      </div>

      {/* Trial info badge */}
      {trialDays && (
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.15)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "#22D3EE" }}>
            {t("signup.payment.cardNotRequired") || "No credit card required"}
          </p>
          <p className="mt-1 text-xs" style={{ color: "rgba(245,242,255,0.45)" }}>
            {t("signup.payment.trialNote") ||
              "No charge today. You'll be billed after your trial ends."}
          </p>
        </div>
      )}

      {/* Promo code */}
      <div className="space-y-2">
        <Label
          htmlFor="promo-code"
          className="text-xs font-medium"
          style={{ color: "rgba(245,242,255,0.6)" }}
        >
          {t("signup.payment.promoCode") || "Promo code"}{" "}
          <span style={{ color: "rgba(245,242,255,0.3)" }}>
            ({t("signup.common.optional") || "optional"})
          </span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="promo-code"
            type="text"
            placeholder="SCRIPE20"
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value.toUpperCase());
              setPromoValid(null);
              setPromoError("");
            }}
            className="flex-1 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.03)",
              border:
                promoValid === true
                  ? "1px solid rgba(34,197,94,0.4)"
                  : promoValid === false
                    ? "1px solid rgba(239,68,68,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
              color: "rgba(245,242,255,0.9)",
            }}
            aria-describedby={promoError ? "promo-error" : undefined}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleApplyPromo}
            disabled={isApplyingPromo || !promoInput.trim()}
            className="rounded-lg px-4 text-xs font-medium"
            style={{
              borderColor: "rgba(168,85,247,0.3)",
              color: "rgba(245,242,255,0.8)",
            }}
          >
            {isApplyingPromo ? "…" : t("signup.payment.promoApply") || "Apply"}
          </Button>
        </div>
        {promoError && (
          <p id="promo-error" className="text-xs text-destructive">
            {promoError}
          </p>
        )}
        {promoValid && (
          <p className="text-xs text-emerald-500">
            ✓ {t("signup.payment.promoApplied") || "Promo code applied!"}
          </p>
        )}
      </div>

      {/* Error */}
      {vm.error && (
        <div
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {/* CTA */}
      <Button
        type="button"
        onClick={handleProceed}
        disabled={vm.isLoading}
        className="w-full rounded-lg py-3 text-sm font-semibold"
        style={{
          background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)",
          color: "#fff",
        }}
      >
        {vm.isLoading
          ? t("signup.payment.processing") || "Processing…"
          : trialDays
            ? t("signup.payment.trialCta") || "Start free trial →"
            : t("signup.payment.payCta") || "Complete purchase →"}
      </Button>

      {/* Back */}
      <div className="text-center">
        <Button
          variant="link"
          type="button"
          onClick={vm.goBack}
          className="text-sm font-medium underline underline-offset-2"
          style={{ color: "rgba(245,242,255,0.45)" }}
        >
          {t("signup.common.back") || "← Back"}
        </Button>
      </div>
    </div>
  );
}
