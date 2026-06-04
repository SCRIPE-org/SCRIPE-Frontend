"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { usePhoneOtpViewModel } from "../viewmodels/usePhoneOtpViewModel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhoneOtpFormProps {
  onSuccess: (result: { accessToken: string; refreshToken: string }) => void;
  onBack: () => void;
  isRTL: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PhoneOtpForm — Phone/SMS OTP login (pure render)
 *
 * Per auth-methods.md §3 Phone OTP:
 * 1. User enters phone number (E.164 format)
 * 2. Backend sends SMS OTP via configured provider
 * 3. User enters 6-digit code to complete login
 *
 * All business logic is in usePhoneOtpViewModel.
 * This component is a pure render — no DI imports, no HTTP calls.
 *
 * Design: Vault aesthetic, sxScreenIn transitions, error shake
 */
export function PhoneOtpForm({ onSuccess, onBack, isRTL }: PhoneOtpFormProps) {
  const { t } = useI18n();
  const vm = usePhoneOtpViewModel(onSuccess);

  // ── Phone input step ──
  if (vm.step === "phone") {
    return (
      <div className="sx-screen space-y-5" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--sx-text, rgba(245,242,255,0.95))" }}
          >
            {t("auth.phoneOtp.title") || "Sign in with phone"}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--sx-text-mute)" }}>
            {t("auth.phoneOtp.subtitle") || "We'll send you a verification code via SMS"}
          </p>
        </div>

        {/* Error */}
        {vm.error && (
          <div
            key={vm.shakeKey}
            className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
          </div>
        )}

        {/* Phone number */}
        <div className="space-y-2">
          <Label
            htmlFor="phone-number"
            className="text-sm font-medium"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.phoneOtp.phoneLabel") || "Phone number"}
          </Label>
          <Input
            id="phone-number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={vm.phone}
            onChange={(e) => vm.setPhone(e.target.value)}
            autoComplete="tel"
            className="h-11 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--sx-text)",
            }}
          />
          <p className="text-[11px]" style={{ color: "var(--sx-text-faint)" }}>
            {t("auth.phoneOtp.e164Hint") || "Include country code (e.g., +1 for US)"}
          </p>
        </div>

        {/* Submit */}
        <Button
          type="button"
          onClick={vm.requestOtp}
          disabled={vm.isLoading || !vm.phone.trim()}
          className="relative w-full overflow-hidden rounded-lg py-3 text-sm font-semibold"
          style={{
            background: "var(--sx-cta-gradient)",
            color: "#fff",
            boxShadow: "var(--sx-cta-shadow)",
          }}
        >
          {vm.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="sx-spin1 inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
              {t("common.loading") || "Sending…"}
            </span>
          ) : (
            t("auth.phoneOtp.sendCode") || "Send verification code"
          )}
        </Button>

        {/* Back */}
        <Button
          variant="link"
          onClick={onBack}
          className="mx-auto block text-sm font-medium underline underline-offset-2"
          style={{ color: "var(--sx-accent-text)" }}
        >
          {t("signup.common.back") || "← Back"}
        </Button>
      </div>
    );
  }

  // ── Code verification step ──
  return (
    <div className="sx-screen space-y-5" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center">
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--sx-text, rgba(245,242,255,0.95))" }}
        >
          {t("auth.phoneOtp.verifyTitle") || "Enter verification code"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.phoneOtp.codeSent") || "We sent a 6-digit code to"}{" "}
          <span className="font-semibold" style={{ color: "var(--sx-text)" }}>
            {vm.phone}
          </span>
        </p>
      </div>

      {/* Error */}
      {vm.error && (
        <div
          key={vm.shakeKey}
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {/* OTP Input */}
      <div className="space-y-2">
        <Label
          htmlFor="phone-otp-code"
          className="text-sm font-medium"
          style={{ color: "var(--sx-text-mute)" }}
        >
          {t("auth.phoneOtp.codeLabel") || "Verification code"}
        </Label>
        <Input
          id="phone-otp-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={vm.code}
          onChange={(e) => vm.setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoComplete="one-time-code"
          className="h-12 rounded-lg text-center font-mono text-xl tracking-[0.4em]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--sx-text)",
          }}
        />
      </div>

      {/* Verify */}
      <Button
        type="button"
        onClick={vm.verifyOtp}
        disabled={vm.isLoading || vm.code.length !== 6}
        className="relative w-full overflow-hidden rounded-lg py-3 text-sm font-semibold"
        style={{
          background: "var(--sx-cta-gradient)",
          color: "#fff",
          boxShadow: "var(--sx-cta-shadow)",
        }}
      >
        {vm.isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="sx-spin1 inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
            {t("common.loading") || "Verifying…"}
          </span>
        ) : (
          t("auth.phoneOtp.verify") || "Verify & Sign In"
        )}
      </Button>

      {/* Resend */}
      <div className="text-center">
        <Button
          variant="link"
          disabled={vm.cooldown > 0}
          onClick={vm.resendOtp}
          className="text-sm font-medium transition-colors duration-150"
          style={{
            color: vm.cooldown > 0 ? "var(--sx-text-faint)" : "var(--sx-accent-text)",
          }}
        >
          {vm.cooldown > 0
            ? t("signup.verification.resendIn", { seconds: vm.cooldown }) ||
              `Resend in ${vm.cooldown}s`
            : t("signup.verification.resendCode") || "Resend code"}
        </Button>
      </div>

      {/* Back */}
      <Button
        variant="link"
        onClick={vm.changeNumber}
        className="mx-auto block text-sm font-medium underline underline-offset-2"
        style={{ color: "var(--sx-accent-text)" }}
      >
        {t("auth.phoneOtp.changeNumber") || "Use a different number"}
      </Button>
    </div>
  );
}
