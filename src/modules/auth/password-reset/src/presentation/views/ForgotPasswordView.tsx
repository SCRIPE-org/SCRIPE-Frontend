/**
 * ForgotPasswordView — Password reset request page.
 *
 * Uses the Vault surface token layer (--sx-*) for its background and card so it
 * visually matches the login page. Also consumes tenant branding tokens via
 * useLoginBrandingTokens for white-label support.
 *
 * Enumeration-safe: always shows the same success message regardless of whether
 * the email exists (spec: auth-flow.md §1.4 + security-policy.md §3).
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ArrowLeft, Mail, CheckCircle, ShieldAlert } from "lucide-react";
import { useLoginBrandingTokens } from "@modules/auth/core/src/presentation/viewmodels/useLoginBrandingTokens";
import { resolveFileUrl } from "@core/common/utils";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "@modules/auth/core/src/presentation/viewmodels/useTenantResolution";
import { VaultBackground } from "@modules/auth/signin/src/presentation/components/layouts/VaultBackground";
// ARCH-EXCEPTION: pre-auth view — cannot use DI container (no auth context yet).
import { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

export function ForgotPasswordView() {
  const { t, direction } = useI18n();
  const { email, setEmail, isSubmitted, submit, reset, canSubmit } = useForgotPasswordViewModel();

  const { branding } = useTenantResolution("forgot-password");

  const { slotConfig, a11y } = useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = t("auth.forgotPassword");
  const subtitle = t("auth.forgotPasswordDesc");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  return (
    <div
      className="vault-stage relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      {/* Ambient background (same as VaultLayout) */}
      <VaultBackground />

      {/* Top actions */}
      <div
        className="absolute right-6 top-6 z-20 flex items-center gap-1"
        style={direction === "rtl" ? { right: "auto", left: "1.5rem" } : {}}
      >
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* Centered content */}
      <div className="relative z-[1] flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-5 py-24">
        {/* Back to login */}
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
        <div
          className="sx-screen w-full rounded-[20px] p-8 sm:p-9"
          style={{
            background: "var(--sx-card-bg)",
            border: "1px solid var(--sx-card-border)",
            boxShadow: "var(--sx-card-shadow)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {!isSubmitted ? (
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
                  <Mail
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
                  {subtitle}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="block text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--sx-text-mute)" }}
                  >
                    {t("auth.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
                >
                  {t("auth.sendResetLink")}
                </Button>
              </form>

              {/* Admin reset notice */}
              <div
                className="flex items-start gap-2.5 rounded-xl border px-4 py-3"
                style={{
                  background: "rgba(245,158,11,.06)",
                  borderColor: "rgba(245,158,11,.2)",
                }}
              >
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                  aria-hidden="true"
                />
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.adminResetNotice")}
                </p>
              </div>
            </div>
          ) : (
            /* ── Success state ─────────────────────────────── */
            <div className="sx-pop flex flex-col items-center gap-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle className="h-7 w-7 text-emerald-500" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: "var(--sx-text)" }}
                >
                  {t("auth.checkYourEmail")}
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.resetLinkSent")}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xl border text-[14px]"
                  style={{
                    background: "var(--sx-chip-bg)",
                    borderColor: "var(--sx-chip-border)",
                    color: "var(--sx-text)",
                  }}
                  onClick={reset}
                >
                  {t("auth.tryAnotherEmail")}
                </Button>
                <Link href="/login" className="block">
                  <Button
                    variant="ghost"
                    className="h-11 w-full rounded-xl text-[13px]"
                    style={{ color: "var(--sx-text-mute)" }}
                  >
                    {t("auth.backToLogin")}
                  </Button>
                </Link>
              </div>
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
