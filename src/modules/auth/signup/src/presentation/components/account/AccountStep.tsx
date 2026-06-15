"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { PasswordInput } from "@core/ui/password-input";
import { accountSchema } from "../../schemas/signupSchemas";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

// ═══════════════════════════════════════════════════════════════════════════
// AccountStep — the account phase (F5). Three core fields (full name, work
// email, password) + a terms checkbox, labels above inputs, inline validation
// from the shared `accountSchema`. Product-register calm: solid-ink heading (no
// gradient text), restrained surfaces, accent reserved for the single primary
// action; full control states (default/hover/focus/disabled/loading/error).
//
// Dumb UI: validation runs the shared Zod schema on submit; field state lives in
// the wizard's wizardData (single registration model). On a valid submit it
// calls submitAccount (which sends the OTP and advances). CTA copy adapts to the
// selected plan's checkoutMode.
// ═══════════════════════════════════════════════════════════════════════════

type FieldKey = "fullName" | "email" | "password" | "acceptTerms";

interface AccountStepProps {
  wizard: SignupWizardViewModel;
}

export function AccountStep({ wizard }: AccountStepProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const { wizardData, updateField, updatePassword, passwordStrength, selectedPlan } = wizard;
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  // Per-field validation messages (i18n keys from the schema). Cleared on edit.
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const clearFieldError = (field: FieldKey) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  // CTA copy tailored to the plan. Free → "Create account"; everything else →
  // "Continue" (no charge is implied here — the card is collected later).
  const ctaLabel =
    selectedPlan?.checkoutMode === "free"
      ? t("signup.account.continueFree")
      : t("signup.account.continue");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = accountSchema.safeParse({
      fullName: wizardData.fullName,
      email: wizardData.email,
      password: wizardData.password,
      acceptTerms: wizardData.acceptTerms === true ? true : undefined,
      marketingOptIn: wizardData.marketingOptIn,
    });

    if (!result.success) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as FieldKey;
        if (key && !next[key]) next[key] = issue.message; // first message per field
      }
      setFieldErrors(next);
      return;
    }

    setFieldErrors({});
    // submitAccount sends the OTP and advances — enumeration-safe in the hook.
    wizard.submitAccount(result.data.email.trim().toLowerCase());
  };

  const inputStyle = {
    background: tokens.surfaceRaised,
    borderColor: tokens.border,
    color: tokens.ink,
  } as const;
  const errorTextStyle = { color: tokens.error } as const;

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-10 sm:px-8 sm:py-14" dir={direction}>
      {/* ── Heading (solid ink, no gradient text) ── */}
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
          {t("signup.account.title")}
        </h1>
        <p className="text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {t("signup.account.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* ── Full name ── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-fullname" className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
            {t("signup.account.fullName")}
          </Label>
          <Input
            id="signup-fullname"
            type="text"
            autoComplete="name"
            autoFocus
            placeholder={t("signup.account.fullNamePlaceholder")}
            value={wizardData.fullName}
            onChange={(e) => {
              updateField("fullName", e.target.value);
              clearFieldError("fullName");
            }}
            aria-invalid={!!fieldErrors.fullName}
            aria-describedby={fieldErrors.fullName ? "signup-fullname-error" : undefined}
            className="h-11"
            style={inputStyle}
          />
          {fieldErrors.fullName && (
            <p id="signup-fullname-error" role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {t(fieldErrors.fullName)}
            </p>
          )}
        </div>

        {/* ── Work email ── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-email" className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
            {t("signup.account.workEmail")}
          </Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder={t("signup.account.emailPlaceholder")}
            value={wizardData.email}
            onChange={(e) => {
              updateField("email", e.target.value);
              clearFieldError("email");
            }}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
            className="h-11"
            style={inputStyle}
          />
          {fieldErrors.email && (
            <p id="signup-email-error" role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {t(fieldErrors.email)}
            </p>
          )}
        </div>

        {/* ── Password ── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-password" className="text-[0.8125rem] font-medium" style={{ color: tokens.inkMuted }}>
            {t("signup.account.password")}
          </Label>
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            placeholder={t("signup.account.passwordPlaceholder")}
            value={wizardData.password}
            onChange={(e) => {
              updatePassword(e.target.value);
              clearFieldError("password");
            }}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password
                ? "signup-password-error"
                : wizardData.password.length > 0
                  ? "signup-password-strength"
                  : undefined
            }
            className="h-11"
            style={inputStyle}
          />
          {fieldErrors.password ? (
            <p id="signup-password-error" role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {t(fieldErrors.password)}
            </p>
          ) : (
            wizardData.password.length > 0 && (
              <PasswordStrengthMeter id="signup-password-strength" score={passwordStrength} />
            )
          )}
        </div>

        {/* ── Terms ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="signup-terms"
              checked={wizardData.acceptTerms === true}
              onCheckedChange={(checked) => {
                updateField("acceptTerms", checked === true);
                clearFieldError("acceptTerms");
              }}
              disabled={wizard.isSubmitting}
              className="mt-0.5"
              aria-invalid={!!fieldErrors.acceptTerms}
            />
            <label
              htmlFor="signup-terms"
              className="cursor-pointer select-none text-[0.8125rem] leading-5"
              style={{ color: tokens.inkMuted }}
            >
              {t("signup.account.acceptTerms")}{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: tokens.accent }}
              >
                {t("signup.account.termsOfService")}
              </a>{" "}
              {t("signup.account.and")}{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: tokens.accent }}
              >
                {t("signup.account.privacyPolicy")}
              </a>
            </label>
          </div>
          {fieldErrors.acceptTerms && (
            <p role="alert" className="text-[0.75rem] font-medium" style={errorTextStyle}>
              {t(fieldErrors.acceptTerms)}
            </p>
          )}
        </div>

        {/* ── Flow error (e.g. an unexpected failure) ── */}
        {wizard.error && (
          <div
            role="alert"
            className="rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium"
            style={{ background: `${tokens.error}1a`, border: `1px solid ${tokens.error}40`, color: tokens.error }}
          >
            {wizard.error}
          </div>
        )}

        {/* ── Primary CTA — the single accent moment ── */}
        <button
          type="submit"
          disabled={wizard.isSubmitting}
          aria-busy={wizard.isSubmitting}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.9375rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transform-none"
          style={{ background: tokens.gradientCta, color: tokens.accentContrast, boxShadow: tokens.shadowCard }}
        >
          {wizard.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              <span className="sr-only">{t("signup.common.loading")}</span>
            </>
          ) : (
            <>
              {ctaLabel}
              <ArrowIcon
                size={18}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
                style={{ transform: direction === "rtl" ? "scaleX(-1)" : undefined }}
              />
            </>
          )}
        </button>

        {/* ── Trust cue + back ── */}
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" style={{ color: tokens.inkFaint }} />
          <p className="text-[0.6875rem]" style={{ color: tokens.inkFaint }}>
            {t("signup.account.trustCue")}
          </p>
        </div>

        <button
          type="button"
          onClick={wizard.back}
          disabled={wizard.isSubmitting}
          className="mx-auto inline-flex items-center gap-1.5 text-[0.8125rem] font-medium transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
          style={{ color: tokens.inkMuted }}
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
          {t("signup.account.back")}
        </button>
      </form>
    </div>
  );
}

export default AccountStep;
