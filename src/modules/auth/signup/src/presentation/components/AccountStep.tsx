"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { PasswordInput } from "@core/ui/password-input";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface AccountStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

export function AccountStep({ vm }: AccountStepProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const strengthLabels = [
    t("signup.account.passwordStrength.veryWeak") || "Very Weak",
    t("signup.account.passwordStrength.weak") || "Weak",
    t("signup.account.passwordStrength.fair") || "Fair",
    t("signup.account.passwordStrength.good") || "Good",
    t("signup.account.passwordStrength.strong") || "Strong",
  ];

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1
          className="text-2xl font-bold"
          style={{
            background: tokens.gradientCta,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("signup.createWorkspace") || "Create your workspace"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: tokens.inkMuted }}>
          {t("signup.getStarted") || "Get started with Scripe in under 2 minutes"}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          vm.submitAccount(vm.wizardData.email);
        }}
        className="space-y-4"
      >
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="signup-fullname"
            className="text-xs font-medium"
            style={{ color: tokens.inkMuted }}
          >
            {t("signup.account.fullName") || "Full name"}
          </Label>
          <Input
            id="signup-fullname"
            type="text"
            placeholder={t("signup.account.fullNamePlaceholder") || "John Doe"}
            value={vm.wizardData.fullName}
            onChange={(e) => vm.updateField("fullName", e.target.value)}
            autoComplete="name"
            autoFocus
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: tokens.ink,
            }}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="signup-email"
            className="text-xs font-medium"
            style={{ color: tokens.inkMuted }}
          >
            {t("signup.account.workEmail") || "Work email"}
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder={t("signup.account.emailPlaceholder") || "you@example.com"}
            value={vm.wizardData.email}
            onChange={(e) => vm.updateField("email", e.target.value)}
            autoComplete="email"
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: tokens.ink,
            }}
          />
        </div>

        {/* Password — using PasswordInput from @core/ui */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="signup-password"
            className="text-xs font-medium"
            style={{ color: tokens.inkMuted }}
          >
            {t("signup.account.password") || "Password"}
          </Label>
          <PasswordInput
            id="signup-password"
            // a11y: links the field to the strength indicator so screen readers read both
            aria-describedby={
              vm.wizardData.password.length > 0 ? "signup-password-strength" : undefined
            }
            placeholder={t("signup.account.passwordPlaceholder") || "Min. 12 characters"}
            value={vm.wizardData.password}
            onChange={(e) => vm.updatePassword(e.target.value)}
            autoComplete="new-password"
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: tokens.ink,
            }}
          />

          {/* Password Strength Meter */}
          {vm.wizardData.password.length > 0 && (
            // a11y: role=status + aria-live announces strength changes as the user types
            <div
              id="signup-password-strength"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="space-y-1"
              style={{ animation: "sxRise 0.3s ease-out" }}
            >
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i < vm.passwordStrength
                          ? STRENGTH_COLORS[vm.passwordStrength - 1]
                          : "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[10px] font-medium"
                style={{
                  color: STRENGTH_COLORS[vm.passwordStrength - 1] || "rgba(245,242,255,0.4)",
                }}
              >
                {vm.passwordStrength > 0 ? strengthLabels[vm.passwordStrength - 1] : ""}
              </p>
            </div>
          )}
        </div>

        {/* Terms — using Checkbox from @core/ui */}
        <div className="flex items-start gap-3 pt-1">
          <Checkbox
            id="signup-terms"
            checked={vm.wizardData.acceptTerms}
            onCheckedChange={(checked) =>
              !vm.isLoading && vm.updateField("acceptTerms", checked === true)
            }
            disabled={vm.isLoading}
            className="mt-0.5"
            style={{
              accentColor: BRAND_TOKENS.palette.violet,
            }}
          />
          <label
            htmlFor="signup-terms"
            className="cursor-pointer select-none text-xs leading-5"
            style={{ color: tokens.inkFaint }}
          >
            {t("signup.account.acceptTerms") || "I agree to the"}{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline transition-colors hover:no-underline"
              style={{ color: tokens.accent }}
              onClick={(e) => e.stopPropagation()}
            >
              {t("signup.account.termsOfService") || "Terms of Service"}
            </a>{" "}
            {t("signup.account.and") || "and"}{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline transition-colors hover:no-underline"
              style={{ color: tokens.accent }}
              onClick={(e) => e.stopPropagation()}
            >
              {t("signup.account.privacyPolicy") || "Privacy Policy"}
            </a>
          </label>
        </div>

        {/* Error */}
        {vm.error && (
          <div
            className="rounded-lg px-3 py-2 text-xs font-medium"
            role="alert"
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

        {/* Submit */}
        <Button
          type="submit"
          disabled={vm.isLoading || !vm.wizardData.acceptTerms}
          // a11y: aria-busy signals to screen readers that work is in progress
          aria-busy={vm.isLoading}
          className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60"
          style={{
            background: tokens.gradientCta,
            boxShadow: BRAND_TOKENS.shadow.cta,
          }}
        >
          {vm.isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {/* a11y: visually hidden text so screen readers announce the loading state */}
              <span className="sr-only">{t("signup.common.loading") || "Loading…"}</span>
            </>
          ) : (
            <>
              {t("signup.account.continue") || "Continue"}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </>
          )}
        </Button>

        {/* Trust cue */}
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" style={{ color: tokens.inkFaint }} />
          <p className="text-[10px]" style={{ color: tokens.inkFaint }}>
            {t("signup.account.trustCue") || "256-bit encrypted · No credit card required"}
          </p>
        </div>

        {/* Login link */}
        <p className="text-center text-xs" style={{ color: tokens.inkFaint }}>
          {t("signup.account.alreadyHaveAccount") || "Already have an account?"}{" "}
          <Button
            variant="link"
            type="button"
            onClick={vm.goToLogin}
            className="h-auto p-0 font-medium underline transition-colors hover:no-underline"
            style={{ color: tokens.accent }}
          >
            {t("signup.account.signIn") || "Sign in"}
          </Button>
        </p>
      </form>
    </div>
  );
}
