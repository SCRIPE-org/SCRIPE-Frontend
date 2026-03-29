/**
 * RegisterView — Public page for user registration
 *
 * Themed: consumes the same tenant branding tokens as the login page.
 * Uses per-page layout/headline/subtitle from LoginBrandingJson.pages["register"].
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useLoginBrandingTokens } from "../signin/src/hooks/useLoginBrandingTokens";
import { resolveFileUrl } from "@core/common/utils";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useTenantResolution } from "../hooks/useTenantResolution";

export function RegisterView() {
  const { t, direction } = useI18n();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Resolve tenant branding
  const { branding } = useTenantResolution();

  // Parse branding + inject CSS tokens
  const { layout: rawLayout, slotConfig, a11y } = useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  // Get per-page override
  const pageOverride = (() => {
    try {
      if (!branding?.loginBrandingJson) return null;
      const parsed = JSON.parse(branding.loginBrandingJson);
      return parsed.pages?.["register"] ?? null;
    } catch { return null; }
  })();

  const layout = pageOverride?.layout || "centered";

  // Branding values
  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const headline = pageOverride?.headline || t("auth.register") || "Create Account";
  const subtitle = pageOverride?.subtitle || t("auth.registerDesc") || "Fill in the details below to create your account.";

  // Dynamic document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headline} — ${companyName}`;
    }
  }, [headline, companyName]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic to be implemented
  }, [formData]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t("auth.fullName") || "Full Name"}</Label>
          <Input id="fullName" type="text" placeholder={t("auth.fullNamePlaceholder") || "Enter your full name"} value={formData.fullName} onChange={handleChange("fullName")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email") || "Email"}</Label>
          <Input id="email" type="email" placeholder={t("auth.emailPlaceholder") || "Enter your email"} value={formData.email} onChange={handleChange("email")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password") || "Password"}</Label>
          <Input id="password" type="password" placeholder={t("auth.passwordPlaceholder") || "Create a password"} value={formData.password} onChange={handleChange("password")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("auth.confirmPassword") || "Confirm Password"}</Label>
          <Input id="confirmPassword" type="password" placeholder={t("auth.confirmPasswordPlaceholder") || "Confirm your password"} value={formData.confirmPassword} onChange={handleChange("confirmPassword")} required />
        </div>
        <Button type="submit" className="w-full" style={{ background: "var(--login-btn-bg, hsl(var(--primary)))", color: "var(--login-btn-text, hsl(var(--primary-foreground)))" }}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("auth.createAccount") || "Create Account"}
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
