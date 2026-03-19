/**
 * LoginView — 5-Layout Customizable Login Page
 *
 * Renders tenant-branded login using the Login Rendering Engine (Phase 5).
 * Supports 5 layouts: split-right, split-left, centered, branded-full, minimal.
 * CSS tokens injected from LoginBrandingJson. Safe mode bypasses all customization.
 *
 * Architecture decisions grounded in:
 * - §11 Slot-based composition (6 v1 login slots)
 * - §16 Unified runtime fallback
 * - §19 Security (no dangerouslySetInnerHTML, CTA URL validation)
 * - §20 Server-authoritative login rendering
 * - §27 Accessibility (WCAG AA, 44px touch targets, RTL)
 */
"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { BookOpen, AlertTriangle } from "lucide-react";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import Link from "next/link";
import { BRAND } from "@core/config/branding";
import { resolveFileUrl } from "@core/common/utils";

import { useLoginViewModel } from "../viewmodels/use-login-viewmodel";
import { LoginBranding } from "../components/LoginBranding";
import { CredentialsForm } from "../components/CredentialsForm";
import { TwoFactorForm } from "../components/TwoFactorForm";
import { SsoProviderButtons } from "../components/SsoProviderButtons";
import { SlotRenderer } from "../components/SlotRenderer";
import { useSsoProviders } from "../../../../hooks/useSsoProviders";
import { useTenantResolution } from "../../../../hooks/useTenantResolution";
import { TenantSuspendedView, TenantNotFoundView } from "./TenantStatusView";
import { useLoginBrandingTokens } from "../../hooks/useLoginBrandingTokens";

export function LoginView() {
  const vm = useLoginViewModel();
  const { t, language, direction } = useI18n();
  const isRTL = language === "ar";
  const hasCheckedAuth = useRef(false);

  // Pre-auth domain resolution for white-label branding
  const { tenantId, branding, isResolved, isLoading: isTenantLoading } = useTenantResolution();

  // Login rendering engine — CSS token injection + layout
  const { layout, slotConfig } = useLoginBrandingTokens({
    loginBrandingJson: branding?.loginBrandingJson ?? null,
    slotConfigJson: branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  // Pass resolved tenant context to SSO providers
  const sso = useSsoProviders({
    tenantId,
    mode: branding?.identityProviderMode ?? "inherit",
  });

  // Derive branding values
  const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;

  useEffect(() => {
    if (hasCheckedAuth.current || !vm.hasHydrated) return;
    hasCheckedAuth.current = true;
    vm.checkAndRedirect();
  }, [vm.hasHydrated, vm.checkAndRedirect]);

  // Wire resolved tenant ID into the login viewmodel for tenant-scoped login
  useEffect(() => {
    if (tenantId) {
      vm.setTenantId(tenantId);
    }
  }, [tenantId, vm.setTenantId]);

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

  // ── Determine if we expect a tenant domain ──
  const isTenantExpected = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("_tenant") !== null ||
    (!window.location.hostname.startsWith("localhost") &&
     !window.location.hostname.startsWith("127.") &&
     !window.location.hostname.startsWith("0.0.0.0") &&
     window.location.hostname !== "[::1]")
  );

  // ── Premium loading gate ──
  if (!vm.hasHydrated || vm.isRedirecting || (isTenantExpected && isTenantLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Tenant status routing ──
  if (branding?.status === "suspended" || branding?.status === "canceled") {
    return <TenantSuspendedView branding={branding} />;
  }

  // Non-existent tenant domain
  if (!isTenantLoading && !isResolved && typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const devCode = new URLSearchParams(window.location.search).get("_tenant");
    const isTenantExpectedCheck = devCode !== null || (!hostname.startsWith("localhost") && !hostname.startsWith("127."));
    if (isTenantExpectedCheck) {
      return <TenantNotFoundView />;
    }
  }

  // ── Safe Mode Banner ──
  const safeModeActive = branding?.isSafeMode === true;

  // ── Form content (shared across all layouts) ──
  const formContent = (
    <div className="w-full max-w-[380px]">
      {/* Safe Mode Banner */}
      {safeModeActive && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {t("auth.branding.safeModeActive")}
        </div>
      )}

      {/* Slot: form.above */}
      <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-6" />

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

      {/* Slot: form.below */}
      <SlotRenderer slotId="login.form.below" slotConfig={slotConfig} className="mt-6" />
    </div>
  );

  // ── Top Actions Bar (shared) ──
  const topActions = (
    <div className="absolute left-8 right-8 top-8 flex items-center justify-between lg:justify-end gap-5 z-20">
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
  );

  // ── Footer (shared) ──
  const footer = (
    <div className="text-center lg:hidden mt-12">
      <p className="text-[11px] font-medium text-muted-foreground/50">
        © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
      </p>
    </div>
  );

  // ── Slot: footer ──
  const footerSlot = <SlotRenderer slotId="login.footer" slotConfig={slotConfig} className="mt-6" />;

  // ═══════════════════════════════════════════════════
  // 5 LAYOUT VARIANTS
  // ═══════════════════════════════════════════════════

  switch (layout) {
    // ── SPLIT-LEFT: Branding right, form left ──────
    case "split-left":
      return (
        <div className="flex min-h-screen w-full bg-[var(--login-bg,hsl(var(--background)))] font-sans selection:bg-primary/20" dir={direction}>
          {/* Form Panel (left) */}
          <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]">
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && (
              <DesktopHeading companyName={companyName} t={t} />
            )}
            {formContent}
            {footer}
            {footerSlot}
          </div>
          {/* Branding Panel (right) */}
          <LoginBranding t={t} branding={branding} slotConfig={slotConfig} position="right" />
        </div>
      );

    // ── CENTERED: Full-width, branding above form ──
    case "centered":
      return (
        <div className="flex min-h-screen w-full flex-col items-center bg-[var(--login-bg,hsl(var(--background)))] font-sans selection:bg-primary/20" dir={direction}>
          {topActions}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 w-full max-w-lg">
            {/* Centered Logo + Branding */}
            <div className="mb-10 flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{companyName}</h1>
              <p className="text-sm text-muted-foreground">{t("auth.pleaseLogin")}</p>
            </div>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mb-8 w-full" />
            {formContent}
            {footerSlot}
            <p className="mt-12 text-[11px] font-medium text-muted-foreground/50">
              © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
            </p>
          </div>
        </div>
      );

    // ── BRANDED-FULL: Full-screen bg, form card overlay ──
    case "branded-full":
      return (
        <div
          className="relative flex min-h-screen w-full items-center justify-center bg-[var(--login-bg,hsl(var(--background)))] font-sans selection:bg-primary/20"
          dir={direction}
          style={{
            backgroundImage: "var(--login-bg-image, none)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for readability (min 0.4 per §27) */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: "var(--login-overlay-opacity, 0.5)" }}
          />

          {topActions}

          {/* Floating card */}
          <div className="relative z-10 w-full max-w-[480px] rounded-2xl border border-border/50 bg-[var(--login-surface,hsl(var(--background)))]/95 p-8 shadow-2xl backdrop-blur-xl mx-4">
            {/* Logo + Name */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{companyName}</h1>
            </div>
            <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── MINIMAL: No branding panel, clean form ─────
    case "minimal":
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--login-bg,hsl(var(--background)))] font-sans selection:bg-primary/20" dir={direction}>
          {topActions}
          <div className="w-full max-w-[380px] px-6">
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{companyName}</h1>
              <p className="text-sm text-muted-foreground">{t("auth.pleaseLogin")}</p>
            </div>
            {formContent}
            {footerSlot}
            <p className="mt-12 text-center text-[11px] font-medium text-muted-foreground/50">
              © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
            </p>
          </div>
        </div>
      );

    // ── SPLIT-RIGHT (default): Branding left, form right ──
    case "split-right":
    default:
      return (
        <div className="flex min-h-screen w-full bg-[var(--login-bg,hsl(var(--background)))] font-sans selection:bg-primary/20" dir={direction}>
          {/* Branding Panel (left) */}
          <LoginBranding t={t} branding={branding} slotConfig={slotConfig} position="left" />

          {/* Form Panel (right) */}
          <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]">
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && (
              <DesktopHeading companyName={companyName} t={t} />
            )}
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );
  }
}

// ── Reusable sub-components ────────────────────────
function MobileLogo({ logoSrc, logoAlt, companyName }: { logoSrc: string; logoAlt: string; companyName: string }) {
  return (
    <div className="mb-12 flex lg:hidden flex-col items-center gap-4">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-background border border-border shadow-sm">
        <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{companyName}</h1>
    </div>
  );
}

function DesktopHeading({ companyName, t }: { companyName: string; t: (key: string) => string }) {
  return (
    <div className="mb-10 text-center lg:text-start hidden lg:block w-full max-w-[380px]">
      <h2 className="text-3xl font-semibold tracking-tight text-foreground">{companyName}</h2>
      <p className="mt-2 text-[15px] text-muted-foreground">{t("auth.pleaseLogin")}</p>
    </div>
  );
}

export default LoginView;
