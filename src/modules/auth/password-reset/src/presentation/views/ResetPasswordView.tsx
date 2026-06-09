/**
 * ResetPasswordView — New-password entry page (from email link).
 *
 * Uses the Vault surface token layer so it visually matches the login page.
 * Supports ?otp= (preferred) and legacy ?token= param. Also passes ?email= to
 * provide the correct email to the reset command.
 *
 * Security: The OTP is validated server-side. The UI shows the same generic error
 * regardless of whether the OTP is wrong vs. expired (enumeration-safe).
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import { ArrowLeft, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { useLoginBrandingTokens } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "@modules/auth/core/src/presentation/viewmodels/useTenantResolution";
import { VaultBackground } from "@modules/auth/signin/src/presentation/components/layouts/VaultBackground";
import { useResetPasswordViewModel } from "../viewmodels/useResetPasswordViewModel";

export function ResetPasswordView() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const otp = searchParams?.get("otp") || token;
  const email = searchParams?.get("email") || "";

  const { branding } = useTenantResolution("reset-password");

  useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = t("auth.resetPassword");

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    isSuccess,
    error,
    isValid,
    submit,
  } = useResetPasswordViewModel({
    email,
    otp,
    invalidLinkMessage: t("auth.resetNotAvailable"),
    fallbackErrorMessage: t("auth.resetFailed"),
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  const wrapperClass =
    "vault-stage relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden";

  const cardStyle: React.CSSProperties = {
    background: "var(--sx-card-bg)",
    border: "1px solid var(--sx-card-border)",
    boxShadow: "var(--sx-card-shadow)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
  };

  const topActions = (
    <div
      className="absolute right-6 top-6 z-20 flex items-center gap-1"
      style={direction === "rtl" ? { right: "auto", left: "1.5rem" } : {}}
    >
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
  );

  // ── No token — invalid link ─────────────────────────────
  if (!token) {
    return (
      <div
        className={wrapperClass}
        dir={direction}
        style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
      >
        <VaultBackground />
        {topActions}
        <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
          <div className="mb-5 w-full">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--sx-text-mute)" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("auth.backToLogin")}
            </Link>
          </div>
          <div className="sx-screen w-full rounded-[20px] p-8 text-center sm:p-9" style={cardStyle}>
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <AlertTriangle className="h-7 w-7 text-amber-500" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: "var(--sx-text)" }}
                >
                  {t("auth.invalidResetLink")}
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.invalidResetLinkDesc")}
                </p>
              </div>
              <Link href="/forgot-password" className="block w-full">
                <Button className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985]">
                  {t("auth.requestNewLink")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={wrapperClass}
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />
      {topActions}

      <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
        {/* Back link */}
        <div className="mb-5 w-full">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--sx-text-mute)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("auth.backToLogin")}
          </Link>
        </div>

        {/* Glass card */}
        <div className="sx-screen w-full rounded-[20px] p-8 sm:p-9" style={cardStyle}>
          {!isSuccess ? (
            <div className="flex flex-col gap-6">
              {/* Icon + heading */}
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: "var(--sx-accent-soft)",
                    border: "1px solid var(--sx-accent-soft-border)",
                  }}
                >
                  <Lock
                    className="h-6 w-6"
                    style={{ color: "var(--sx-accent-text)" }}
                    aria-hidden="true"
                  />
                </div>
                <h1
                  className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
                  style={{ color: "var(--sx-text)" }}
                >
                  {headline}
                </h1>
                <p
                  className="mt-1.5 text-[13px] leading-relaxed"
                  style={{ color: "var(--sx-text-mute)" }}
                >
                  {t("auth.resetPasswordDesc")}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="flex flex-col gap-4">
                {/* New password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="block text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--sx-text-mute)" }}
                  >
                    {t("auth.newPassword")}
                  </Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.newPasswordPlaceholder")}
                    required
                    autoFocus
                    minLength={8}
                    className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
                  />
                  <p className="text-[12px]" style={{ color: "var(--sx-text-faint)" }}>
                    {t("auth.passwordMinLength")}
                  </p>
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="block text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--sx-text-mute)" }}
                  >
                    {t("auth.confirmPassword")}
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    required
                    minLength={8}
                    className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[12px] text-destructive">{t("auth.passwordMismatch")}</p>
                  )}
                </div>

                {/* API error */}
                {error && (
                  <div
                    className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
                    role="alert"
                    aria-live="assertive"
                  >
                    <p className="text-[13px] font-medium text-destructive">
                      {error.startsWith("auth.") ? t(error as any) : error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!isValid}
                  loading={isSubmitting}
                  className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
                >
                  {t("auth.resetPasswordAction")}
                </Button>
              </form>
            </div>
          ) : (
            /* ── Success ─────────────────────────────── */
            <div className="sx-pop flex flex-col items-center gap-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle className="h-7 w-7 text-emerald-500" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: "var(--sx-text)" }}
                >
                  {t("auth.passwordResetSuccess")}
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.passwordResetSuccessDesc")}
                </p>
              </div>
              <Button
                className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985]"
                onClick={() => router.push("/login")}
              >
                {t("auth.goToLogin")}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-[11px]" style={{ color: "var(--sx-text-faint)" }}>
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </div>
  );
}
