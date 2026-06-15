"use client";

import { Fragment, useEffect } from "react";
import { ArrowLeft, Loader2, MailCheck, RotateCcw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";

// ═══════════════════════════════════════════════════════════════════════════
// VerificationStep — the email-OTP phase (F6). A large, paste-friendly
// 6-digit segmented input (numeric only, LTR even under RTL since the code is a
// number), resend with a visible cooldown, a change-email affordance, and full
// loading/error states. Auto-submits once six digits are entered.
//
// Product-register calm: solid-ink heading (no gradient text), token-styled
// segments (active = accent ring, filled = soft accent surface), accent reserved
// for the primary action only. Reduced-motion safe.
//
// Dumb UI: the OTP value + verify/resend + cooldown all come from the wizard
// (which composes the proven useSignupOtp hook). The auto-submit guard mirrors
// the legacy step: depend ONLY on otpCode so a re-render mid-verify can't refire.
// ═══════════════════════════════════════════════════════════════════════════

const OTP_LENGTH = 6;

interface VerificationStepProps {
  wizard: SignupWizardViewModel;
}

export function VerificationStep({ wizard }: VerificationStepProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const { otpCode, setOtpCode, isSubmitting, otpResendCooldown } = wizard;

  // Auto-submit when the code is complete. otpCode is the ONLY dependency on
  // purpose — verifyOtp also self-guards (isVerifyingOtpRef) so an already-
  // consumed code is never re-sent.
  useEffect(() => {
    if (otpCode.length === OTP_LENGTH && !isSubmitting) {
      wizard.verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

  // Mask the email for the "sent to" line — show first 2 chars + domain.
  const maskedEmail = wizard.wizardData.email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, start: string, mid: string, end: string) =>
      start + "•".repeat(Math.min(mid.length, 5)) + end
  );

  const slotBase =
    "relative flex h-14 w-12 items-center justify-center rounded-xl border text-[1.375rem] font-semibold transition-all duration-150 first:rounded-l-xl last:rounded-r-xl";

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-10 sm:px-8 sm:py-14" dir={direction}>
      {/* ── Heading ── */}
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
        >
          <MailCheck className="h-5 w-5" aria-hidden="true" style={{ color: tokens.accent }} />
        </span>
        <h1
          className="font-semibold"
          style={{
            color: tokens.ink,
            fontSize: "clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {t("signup.verification.title")}
        </h1>
        <p className="text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {t("signup.verification.sentCode")}{" "}
          <span className="font-medium" dir="ltr" style={{ color: tokens.ink }}>
            {maskedEmail}
          </span>
        </p>
      </header>

      {/* ── Segmented OTP input (numeric, paste-friendly, LTR) ── */}
      <div
        className="mb-6 flex justify-center"
        dir="ltr"
        role="group"
        aria-label={t("signup.verification.codeInputLabel")}
      >
        <InputOTP
          maxLength={OTP_LENGTH}
          value={otpCode}
          onChange={setOtpCode}
          pattern="[0-9]*"
          inputMode="numeric"
          autoFocus
          disabled={isSubmitting}
          id="signup-otp"
          containerClassName="justify-center"
        >
          <div className="flex items-center gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => {
              const filled = !!otpCode[i];
              return (
                <Fragment key={i}>
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={i}
                      className={`${slotBase} border data-[active=true]:z-10`}
                      style={{
                        background: filled ? `${tokens.accent}14` : tokens.surfaceRaised,
                        borderColor: filled ? tokens.accent : tokens.border,
                        color: tokens.ink,
                      }}
                    />
                  </InputOTPGroup>
                  {i === 2 && (
                    <span
                      aria-hidden="true"
                      className="select-none px-0.5 text-[1.25rem]"
                      style={{ color: tokens.inkGhost }}
                    >
                      –
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        </InputOTP>
      </div>

      {/* ── Error ── */}
      {wizard.error && (
        <div
          role="alert"
          className="mb-4 rounded-lg px-3 py-2.5 text-center text-[0.8125rem] font-medium"
          style={{
            background: `${tokens.error}1a`,
            border: `1px solid ${tokens.error}40`,
            color: tokens.error,
          }}
        >
          {wizard.error}
        </div>
      )}

      {/* ── Verify CTA — single accent moment ── */}
      <button
        type="button"
        onClick={wizard.verifyOtp}
        disabled={isSubmitting || otpCode.length < OTP_LENGTH}
        aria-busy={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transform-none"
        style={{
          background: tokens.gradientCta,
          color: tokens.accentContrast,
          boxShadow: tokens.shadowCard,
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span className="sr-only">{t("signup.common.loading")}</span>
          </>
        ) : (
          t("signup.verification.verifyAndContinue")
        )}
      </button>

      {/* ── Resend + change email ── */}
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={wizard.changeEmail}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
          style={{ color: tokens.inkMuted }}
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
          {t("signup.verification.changeEmail")}
        </button>

        <button
          type="button"
          onClick={wizard.resendOtp}
          disabled={otpResendCooldown > 0 || isSubmitting}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80 disabled:opacity-40"
          style={{ color: otpResendCooldown > 0 ? tokens.inkFaint : tokens.accent }}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {otpResendCooldown > 0
            ? t("signup.verification.resendIn", { seconds: String(otpResendCooldown) })
            : t("signup.verification.resendCode")}
        </button>
      </div>
    </div>
  );
}

export default VerificationStep;
