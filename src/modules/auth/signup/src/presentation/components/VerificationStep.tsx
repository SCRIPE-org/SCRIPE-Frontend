"use client";

import { useEffect } from "react";
import { Button } from "@core/ui/button";
import { ArrowLeft, Loader2, ShieldCheck, RotateCcw } from "lucide-react";
import { OtpInputField } from "@core/ui/otp-input-field";
import { useI18n } from "@core/providers/i18n-provider";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";

interface VerificationStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

export function VerificationStep({ vm }: VerificationStepProps) {
  const { t, direction } = useI18n();

  // Auto-submit when 6 digits are entered.
  // IMPORTANT: `vm` is intentionally NOT in the dependency array — the vm object
  // reference changes on every state update (wizardData, error, etc.), which
  // would cause this effect to re-fire after a successful verification while
  // otpCode is still 6 digits, triggering a second server call on an already-
  // consumed OTP. We only depend on the primitives we actually need.
  // A second guard lives in verifyOtp() itself (isVerifyingOtpRef).
  useEffect(() => {
    if (vm.otpCode.length === 6 && !vm.isLoading) {
      vm.verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.otpCode]);

  const maskedEmail = vm.wizardData.email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, start, mid, end) => start + "•".repeat(Math.min(mid.length, 5)) + end
  );

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-8 text-center">
        {/* Shield icon */}
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.1) 100%)",
            border: "1px solid rgba(168,85,247,0.2)",
            animation: "sxPop 0.5s ease-out 0.15s both",
          }}
        >
          <ShieldCheck className="h-6 w-6" aria-hidden="true" style={{ color: "#C4B5FD" }} />
        </div>

        <h1
          className="text-xl font-bold"
          style={{
            background: BRAND_TOKENS.gradient.heroText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("signup.verification.title") || "Verify your email"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
          {t("signup.verification.sentCode") || "We sent a 6-digit code to"}{" "}
          <span className="font-medium" style={{ color: BRAND_TOKENS.text.brand }}>
            {maskedEmail}
          </span>
        </p>
      </div>

      {/* Unified OTP Input Component */}
      <div className="mb-6" dir="ltr">
        <OtpInputField
          value={vm.otpCode}
          onChange={vm.setOtpCode}
          variant="glass"
          id="signup-otp"
        />
      </div>

      {/* Error — role=alert causes immediate announcement in screen readers */}
      {vm.error && (
        <div
          role="alert"
          className="mb-4 rounded-lg px-3 py-2 text-center text-xs font-medium"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
            animation: "sxRise 0.3s ease-out",
          }}
        >
          {vm.error}
        </div>
      )}

      {/* Verify Button */}
      <Button
        type="button"
        onClick={vm.verifyOtp}
        disabled={vm.isLoading || vm.otpCode.length < 6}
        aria-busy={vm.isLoading}
        className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60"
        style={{
          background: BRAND_TOKENS.gradient.cta,
          boxShadow: BRAND_TOKENS.shadow.cta,
        }}
      >
        {vm.isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">{t("signup.common.loading") || "Loading…"}</span>
          </>
        ) : (
          t("signup.verification.verifyAndContinue") || "Verify & Continue"
        )}
      </Button>

      {/* Resend + Back */}
      <div className="mt-5 flex items-center justify-between">
        <Button
          variant="ghost"
          type="button"
          onClick={vm.goBack}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: BRAND_TOKENS.text.secondary }}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t("signup.verification.back") || "Back"}
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={vm.resendOtp}
          disabled={vm.otpResendCooldown > 0 || vm.isLoading}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40"
          style={{ color: BRAND_TOKENS.text.brand }}
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          {vm.otpResendCooldown > 0
            ? t("signup.verification.resendIn", { seconds: String(vm.otpResendCooldown) }) ||
              `Resend in ${vm.otpResendCooldown}s`
            : t("signup.verification.resendCode") || "Resend code"}
        </Button>
      </div>
    </div>
  );
}
