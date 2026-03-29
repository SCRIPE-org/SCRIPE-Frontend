/**
 * VerifyEmailView — Public page for email verification
 *
 * Themed: consumes the same tenant branding tokens as the login page.
 * Uses per-page layout/headline/subtitle from LoginBrandingJson.pages["verify-email"].
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ArrowLeft, MailCheck, RefreshCw } from "lucide-react";
import { useLoginBrandingTokens } from "../signin/src/hooks/useLoginBrandingTokens";
import { resolveFileUrl } from "@core/common/utils";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "../hooks/useTenantResolution";

export function VerifyEmailView() {
  const { t, direction } = useI18n();
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Resolve tenant branding
  const { branding } = useTenantResolution();

  // Parse branding + inject CSS tokens
  const { layout: rawLayout } = useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  // Get per-page override
  const pageOverride = (() => {
    try {
      if (!branding?.loginBrandingJson) return null;
      const parsed = JSON.parse(branding.loginBrandingJson);
      return parsed.pages?.["verify-email"] ?? null;
    } catch { return null; }
  })();

  // Branding values
  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = pageOverride?.headline || t("auth.verifyEmail") || "Verify Your Email";
  const subtitle = pageOverride?.subtitle || t("auth.verifyEmailDesc") || "We've sent a verification code to your email. Enter it below to verify your account.";

  // Dynamic document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  const wrapperStyle: React.CSSProperties = {
    background: "var(--login-bg-image, none) center/cover no-repeat, var(--login-bg, hsl(var(--background)))",
    lineHeight: "var(--login-line-height, 1.5)",
    letterSpacing: "var(--login-letter-spacing, 0px)",
  };

  // Top actions bar
  const topActions = (
    <div className="absolute left-8 right-8 top-8 flex items-center justify-end gap-1 z-20">
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
  );

  // Logo
  const logo = (
    <div className="flex items-center gap-3 mb-2">
      <img src={logoSrc} alt={logoAlt} className="h-10 w-10 rounded-lg object-contain" />
      <span className="text-xl font-bold" style={{ color: "var(--login-heading-color, hsl(var(--foreground)))" }}>{companyName}</span>
    </div>
  );

  // Form card
  const formCard = (
    <div className="w-full max-w-md space-y-6 rounded-xl p-8 shadow-lg"
         style={{ background: "var(--login-card-bg, hsl(var(--card)))", borderRadius: "var(--login-btn-radius, 0.75rem)" }}>
      {logo}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--login-heading-color, hsl(var(--foreground)))" }}>{headline}</h1>
        <p className="text-sm" style={{ color: "var(--login-subtitle-color, hsl(var(--muted-foreground)))" }}>{subtitle}</p>
      </div>

      {!isVerified ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-10 w-10" style={{ color: "var(--login-link-color, hsl(var(--primary)))" }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">{t("auth.verificationCode") || "Verification Code"}</Label>
            <Input id="code" type="text" placeholder={t("auth.verificationCodePlaceholder") || "Enter 6-digit code"} value={code} onChange={(e) => setCode(e.target.value)} className="text-center text-lg tracking-widest" maxLength={6} required />
          </div>
          <Button type="button" className="w-full" style={{ background: "var(--login-btn-bg, hsl(var(--primary)))", color: "var(--login-btn-text, hsl(var(--primary-foreground)))" }} onClick={() => setIsVerified(true)}>
            {t("auth.verify") || "Verify Email"}
          </Button>
          <div className="text-center">
            <button type="button" className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: "var(--login-link-color, hsl(var(--primary)))" }}>
              <RefreshCw className="h-3.5 w-3.5" />
              {t("auth.resendCode") || "Resend Code"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <MailCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="font-medium">{t("auth.emailVerified") || "Your email has been verified!"}</p>
          <Link href="/login">
            <Button className="w-full" style={{ background: "var(--login-btn-bg, hsl(var(--primary)))", color: "var(--login-btn-text, hsl(var(--primary-foreground)))" }}>
              {t("auth.continueToLogin") || "Continue to Login"}
            </Button>
          </Link>
        </div>
      )}

      <div className="text-center text-sm" style={{ color: "var(--login-subtitle-color, hsl(var(--muted-foreground)))" }}>
        <Link href="/login" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: "var(--login-link-color, hsl(var(--primary)))" }}>
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.backToLogin") || "Back to Login"}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center" dir={direction} style={wrapperStyle}>
      {topActions}
      {formCard}
    </div>
  );
}
