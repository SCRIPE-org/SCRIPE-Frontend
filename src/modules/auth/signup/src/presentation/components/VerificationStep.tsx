"use client";

import { useEffect } from "react";
import { Button } from "@core/ui/button";
import { ArrowLeft, Loader2, ShieldCheck, RotateCcw } from "lucide-react";
import { OtpInputField } from "@core/ui/otp-input-field";
import { useI18n } from "@core/providers/i18n-provider";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface VerificationStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

export function VerificationStep({ vm }: VerificationStepProps) {
  const { t } = useI18n();

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (vm.otpCode.length === 6) {
      vm.verifyOtp();
    }
  }, [vm.otpCode, vm]);

  const maskedEmail = vm.wizardData.email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, start, mid, end) => start + "•".repeat(Math.min(mid.length, 5)) + end
  );

  return (
    <div style={{ animation: "sxScreenIn 0.4s ease-out" }}>
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
          <ShieldCheck className="h-6 w-6" style={{ color: "#C4B5FD" }} />
        </div>

        <h1
          className="text-xl font-bold"
          style={{
            background: "linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("signup.verification.title") || "Verify your email"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgba(245,242,255,0.62)" }}>
          {t("signup.verification.sentCode") || "We sent a 6-digit code to"}{" "}
          <span className="font-medium" style={{ color: "#C4B5FD" }}>
            {maskedEmail}
          </span>
        </p>
      </div>

      {/* Unified OTP Input Component */}
      <div className="mb-6">
        <OtpInputField
          value={vm.otpCode}
          onChange={vm.setOtpCode}
          variant="glass"
          id="signup-otp"
        />
      </div>

      {/* Error */}
      {vm.error && (
        <div
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
        onClick={vm.verifyOtp}
        disabled={vm.isLoading || vm.otpCode.length < 6}
        className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60"
        style={{
          background: "linear-gradient(180deg, #A855F7 0%, #7C3AED 40%, #4F46E5 75%, #3B82F6 100%)",
          boxShadow: "0 4px 15px -3px rgba(124,58,237,0.4)",
        }}
      >
        {vm.isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          style={{ color: "rgba(245,242,255,0.55)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("signup.verification.back") || "Back"}
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={vm.resendOtp}
          disabled={vm.otpResendCooldown > 0 || vm.isLoading}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40"
          style={{ color: "#C4B5FD" }}
        >
          <RotateCcw className="h-3 w-3" />
          {vm.otpResendCooldown > 0
            ? t("signup.verification.resendIn", { seconds: String(vm.otpResendCooldown) }) ||
              `Resend in ${vm.otpResendCooldown}s`
            : t("signup.verification.resendCode") || "Resend code"}
        </Button>
      </div>
    </div>
  );
}
