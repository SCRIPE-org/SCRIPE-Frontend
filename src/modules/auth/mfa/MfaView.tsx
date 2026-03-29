/**
 * MfaView — Public page for multi-factor authentication
 *
 * Themed: consumes the same tenant branding tokens as the login page.
 * Uses per-page layout/headline/subtitle from LoginBrandingJson.pages["mfa"].
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ArrowLeft, ShieldCheck, Smartphone } from "lucide-react";
import { useLoginBrandingTokens } from "../signin/src/hooks/useLoginBrandingTokens";
import { resolveFileUrl } from "@core/common/utils";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "../hooks/useTenantResolution";

export function MfaView() {
  const { t, direction } = useI18n();
  const [code, setCode] = useState("");
  const [method, setMethod] = useState<"totp" | "sms">("totp");

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
      return parsed.pages?.["mfa"] ?? null;
    } catch { return null; }
  })();

  // Branding values
  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = pageOverride?.headline || t("auth.mfa") || "Two-Factor Authentication";
  const subtitle = pageOverride?.subtitle || t("auth.mfaDesc") || "Enter the verification code from your authenticator app to continue.";

  // Dynamic document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // MFA verification logic to be implemented
  }, [code]);

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

  // Method selection tabs
  const methodTabs = (
    <div className="flex gap-2 rounded-lg bg-muted/50 p-1">
      <button
        type="button"
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${method === "totp" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
        onClick={() => setMethod("totp")}
      >
        <ShieldCheck className="inline mr-1.5 h-4 w-4" />
        {t("auth.mfaTotp") || "Authenticator App"}
      </button>
      <button
        type="button"
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${method === "sms" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
        onClick={() => setMethod("sms")}
      >
        <Smartphone className="inline mr-1.5 h-4 w-4" />
        {t("auth.mfaSms") || "SMS Code"}
      </button>
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
      {methodTabs}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {method === "totp"
              ? <ShieldCheck className="h-8 w-8" style={{ color: "var(--login-link-color, hsl(var(--primary)))" }} />
              : <Smartphone className="h-8 w-8" style={{ color: "var(--login-link-color, hsl(var(--primary)))" }} />}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mfa-code">
            {method === "totp"
              ? (t("auth.mfaTotpLabel") || "6-Digit Code from your app")
              : (t("auth.mfaSmsLabel") || "Code sent to your phone")}
          </Label>
          <Input
            id="mfa-code"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />
        </div>
        <Button type="submit" className="w-full" style={{ background: "var(--login-btn-bg, hsl(var(--primary)))", color: "var(--login-btn-text, hsl(var(--primary-foreground)))" }}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          {t("auth.verifyCode") || "Verify & Continue"}
        </Button>
      </form>
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
