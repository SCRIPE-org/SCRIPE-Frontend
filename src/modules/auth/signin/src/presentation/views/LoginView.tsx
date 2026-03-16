/**
 * LoginView — Theme-Adaptive Enterprise Layout
 *
 * Left panel: Minimal branding area with custom grid, uses bg-muted.
 * Right panel: Clean solid form area, uses bg-background.
 * Ensures flawless rendering in both Light and Dark themes.
 *
 * Supports white-label tenant branding when accessed via a tenant subdomain.
 */
"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Button } from "@core/ui/button";
import { BookOpen } from "lucide-react";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import Link from "next/link";
import { BRAND } from "@core/config/branding";

import { useLoginViewModel } from "../viewmodels/use-login-viewmodel";
import { LoginBranding } from "../components/LoginBranding";
import { CredentialsForm } from "../components/CredentialsForm";
import { TwoFactorForm } from "../components/TwoFactorForm";
import { SsoProviderButtons } from "../components/SsoProviderButtons";
import { useSsoProviders } from "../../../../hooks/useSsoProviders";
import { useTenantResolution } from "../../../../hooks/useTenantResolution";

export function LoginView() {
  const vm = useLoginViewModel();
  const { t, language, direction } = useI18n();
  const isRTL = language === "ar";
  const hasCheckedAuth = useRef(false);

  // Pre-auth domain resolution for white-label branding
  const { tenantId, branding, isResolved, isLoading: isTenantLoading } = useTenantResolution();

  // Pass resolved tenant context to SSO providers
  const sso = useSsoProviders({
    tenantId,
    mode: branding?.identityProviderMode ?? "inherit",
  });

  // Derive branding values
  const logoSrc = branding?.logoUrl || "/app-logo.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;

  useEffect(() => {
    if (hasCheckedAuth.current || !vm.hasHydrated) return;
    hasCheckedAuth.current = true;
    vm.checkAndRedirect();
  }, [vm.hasHydrated, vm.checkAndRedirect]);

  // Dynamic document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = isResolved
        ? `Login — ${companyName}`
        : `Login — ${BRAND.name}`;
    }
  }, [isResolved, companyName]);

  // Dynamic favicon swap
  useEffect(() => {
    if (typeof document === "undefined" || !branding?.faviconUrl) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }, [branding?.faviconUrl]);

  if (!vm.hasHydrated || vm.isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="md" showText={false} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/20" dir={direction}>
      {/* ── Left Branded Panel ── */}
      <LoginBranding t={t} branding={branding} />

      {/* ── Right Form Panel ── */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]">

        {/* Top Actions */}
        <div className="absolute left-8 right-8 top-8 flex items-center justify-between lg:justify-end gap-5">
          <Button variant="ghost" size="sm" className="hidden lg:flex gap-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors" asChild>
            <Link href="/docs">
              <BookOpen className="h-4 w-4" />
              {t("auth.branding.docs")}
            </Link>
          </Button>
          <div className="hidden lg:block h-4 w-px bg-border" />
          <div className="flex w-full lg:w-auto items-center justify-between lg:justify-start gap-1">
            <Button variant="ghost" size="sm" className="flex lg:hidden gap-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors" asChild>
              <Link href="/docs"><BookOpen className="h-4 w-4" />{t("auth.branding.docs")}</Link>
            </Button>
            <div className="flex gap-1">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[380px]">

          {/* Mobile Logo (hidden on large screens) — uses tenant logo when available */}
          <div className="mb-12 flex lg:hidden flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-background border border-border shadow-sm">
              <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
          </div>

          {/* Desktop Heading (hidden on mobile, branding handles it) */}
          {vm.loginStep === "credentials" && (
            <div className="mb-10 text-center lg:text-start hidden lg:block">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                {t("auth.welcome")}
              </h2>
              <p className="mt-2 text-[15px] text-muted-foreground">
                {t("auth.pleaseLogin")}
              </p>
            </div>
          )}

          {/* Active Form */}
          {vm.loginStep === "credentials" ? (
            <>
              <CredentialsForm
                formData={vm.formData}
                showPassword={vm.showPassword}
                isLoading={vm.isLoading}
                isFormValid={vm.isFormValid}
                error={vm.error}
                isRTL={isRTL}
                updateField={vm.updateField}
                togglePasswordVisibility={vm.togglePasswordVisibility}
                handleLogin={vm.handleLogin}
                t={t}
              />

              {/* SSO Provider Buttons */}
              <SsoProviderButtons
                providers={sso.providers}
                isLoading={sso.isLoading}
                error={sso.error}
                onProviderClick={sso.initiateSsoLogin}
                t={t}
              />
            </>
          ) : (
            <TwoFactorForm
              twoFactorCode={vm.twoFactorCode}
              setTwoFactorCode={vm.setTwoFactorCode}
              useBackupCode={vm.useBackupCode}
              isVerifying2FA={vm.isVerifying2FA}
              error={vm.error}
              isRTL={isRTL}
              handleVerify2FA={vm.handleVerify2FA}
              toggleBackupCode={vm.toggleBackupCode}
              goBackToCredentials={vm.goBackToCredentials}
              t={t}
            />
          )}

          {/* Mobile Footer (hidden on desktop, branding handles it) */}
          <div className="mt-12 text-center lg:hidden">
            <p className="text-[11px] font-medium text-muted-foreground/50">
              © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginView;
