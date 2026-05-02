/**
 * ForgotPasswordView — Public page for password reset request
 *
 * Now themed: consumes the same tenant branding tokens as the login page.
 * Uses per-page layout/headline/subtitle from LoginBrandingJson.pages["forgot-password"].
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
// ARCH-EXCEPTION: pre-auth view — cannot use DI container (no auth context yet).
import { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

export function ForgotPasswordView() {
  const { t, direction } = useI18n();
  const { email, setEmail, isSubmitted, submit, reset, canSubmit } = useForgotPasswordViewModel();

  // Resolve tenant branding
  const { branding } = useTenantResolution("forgot-password");

  // Parse branding + inject CSS tokens
  const {
    layout: rawLayout,
    slotConfig,
    a11y,
  } = useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  // Get per-page override (layout, headline, subtitle)
  const pageOverride = (() => {
    try {
      if (!branding?.loginBrandingJson) return null;
      const parsed = JSON.parse(branding.loginBrandingJson);
      return parsed.pages?.["forgot-password"] ?? null;
    } catch {
      return null;
    }
  })();

  const layout = pageOverride?.layout || "centered";

  // Branding values
  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = pageOverride?.headline || t("auth.forgotPassword") || "Forgot Password";
  const subtitle =
    pageOverride?.subtitle ||
    t("auth.forgotPasswordDesc") ||
    "Enter your email and we'll send you instructions to reset your password.";

  // Dynamic document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  const wrapperStyle: React.CSSProperties = {
    background:
      "var(--login-bg-image, none) center/cover no-repeat, var(--login-bg, hsl(var(--background)))",
    lineHeight: "var(--login-line-height, 1.5)",
    letterSpacing: "var(--login-letter-spacing, 0px)",
  };

  // Top actions bar
  const topActions = (
    <div className="absolute left-8 right-8 top-8 z-20 flex items-center justify-end gap-1">
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
  );

  // Core form content
  const formContent = (
    <div className="w-full" style={{ maxWidth: "var(--login-form-width, 440px)" }}>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] transition-colors hover:text-[var(--login-text,hsl(var(--foreground)))]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("auth.backToLogin") || "Back to login"}
      </Link>

      {!isSubmitted ? (
        <div
          className="space-y-6 border border-[var(--login-border,hsl(var(--border)))]"
          style={{
            borderRadius: "var(--login-radius-card, 16px)",
            padding: "var(--login-card-padding, 32px)",
            backgroundColor: "var(--login-surface, hsl(var(--card)))",
            boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.1))",
          }}
        >
          <div className="space-y-2 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--login-primary, hsl(var(--primary))) 10%, transparent)",
              }}
            >
              <Mail
                className="h-6 w-6"
                style={{ color: "var(--login-primary, hsl(var(--primary)))" }}
              />
            </div>
            <h1
              className="login-heading tracking-tight"
              style={{
                color: "var(--login-text, hsl(var(--foreground)))",
                fontSize: "var(--login-size-headline, 1.5rem)",
              }}
            >
              {headline}
            </h1>
            <p
              style={{
                color: "var(--login-text-muted, hsl(var(--muted-foreground)))",
                fontSize: "var(--login-size-subtitle, 0.875rem)",
              }}
            >
              {subtitle}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="login-label">
                {t("auth.email") || "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder") || "you@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                className="login-input"
              />
            </div>

            <Button type="submit" className="login-button w-full" disabled={!canSubmit}>
              {t("auth.sendResetLink") || "Send Reset Instructions"}
            </Button>
          </form>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p
              className="text-xs"
              style={{ color: "var(--login-text-muted, hsl(var(--muted-foreground)))" }}
            >
              {t("auth.adminResetNotice") ||
                "If self-service reset isn't available, contact your system administrator to reset your password."}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="space-y-6 border border-[var(--login-border,hsl(var(--border)))] text-center"
          style={{
            borderRadius: "var(--login-radius-card, 16px)",
            padding: "var(--login-card-padding, 32px)",
            backgroundColor: "var(--login-surface, hsl(var(--card)))",
            boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.1))",
          }}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2
              className="login-heading"
              style={{
                color: "var(--login-text, hsl(var(--foreground)))",
                fontSize: "var(--login-size-headline, 1.25rem)",
              }}
            >
              {t("auth.checkYourEmail") || "Check your email"}
            </h2>
            <p
              style={{
                color: "var(--login-text-muted, hsl(var(--muted-foreground)))",
                fontSize: "var(--login-size-subtitle, 0.875rem)",
              }}
            >
              {t("auth.resetLinkSent") ||
                "If an account exists with that email, we've sent password reset instructions."}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={reset}
            >
              {t("auth.tryAnotherEmail") || "Try another email"}
            </Button>
            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full text-muted-foreground">
                {t("auth.backToLogin") || "Back to login"}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="login-page flex min-h-screen w-full flex-col items-center justify-center selection:bg-primary/20"
      dir={direction}
      style={wrapperStyle}
    >
      {topActions}
      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24">
        {formContent}
        <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]/50 mt-12 text-[11px] font-medium">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </div>
  );
}
