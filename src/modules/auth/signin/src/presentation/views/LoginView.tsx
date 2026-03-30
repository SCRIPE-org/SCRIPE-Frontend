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

import { useEffect, useRef, useState } from "react";
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
import { useSsoProviders } from "../viewmodels/useSsoProviders";
import { useTenantResolution } from "../viewmodels/useTenantResolution";
import { TenantSuspendedView, TenantNotFoundView } from "./TenantStatusView";
import { useLoginBrandingTokens } from "../viewmodels/useLoginBrandingTokens";

export function LoginView() {
  const vm = useLoginViewModel();
  const { t, language, direction, setLanguage } = useI18n();
  const isRTL = language === "ar";
  const hasCheckedAuth = useRef(false);

  // Pre-auth domain resolution for white-label branding
  const { tenantId, branding, isResolved, isLoading: isTenantLoading } = useTenantResolution();

  // ── One-time sync: apply resolved preferences only on initial load ──
  // After this initial sync, user's manual language/theme switches take precedence.
  const hasAppliedInitialPrefs = useRef(false);
  useEffect(() => {
    if (hasAppliedInitialPrefs.current) return; // Already applied — respect manual changes
    if (!branding?.dashboardThemeJson) return;
    try {
      const prefs = JSON.parse(branding.dashboardThemeJson);
      if (prefs.language && (prefs.language === "ar" || prefs.language === "en")) {
        setLanguage(prefs.language);
      }
      hasAppliedInitialPrefs.current = true;
    } catch { /* skip invalid JSON */ }
  }, [branding?.dashboardThemeJson]);

  // ── Studio Preview Mode (§22) ──
  // When ?_preview=true, listen for postMessage draft updates from the studio
  const [previewOverrides, setPreviewOverrides] = useState<{
    loginBrandingJson?: string;
    slotConfigJson?: string;
  } | null>(null);

  const isPreviewMode = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("_preview") === "true";

  useEffect(() => {
    if (!isPreviewMode) return;

    // Signal to studio that preview is ready
    window.parent?.postMessage({ type: "NEXORA_PREVIEW_READY" }, window.location.origin);

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "NEXORA_STUDIO_DRAFT_UPDATE") {
        setPreviewOverrides(e.data.payload);
      }
      if (e.data?.type === "NEXORA_STUDIO_RESET") {
        setPreviewOverrides(null);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [isPreviewMode]);

  // Login rendering engine — CSS token injection + layout + accessibility
  // In preview mode, draft overrides take priority over live settings
  const { layout, slotConfig, a11y } = useLoginBrandingTokens({
    loginBrandingJson: previewOverrides?.loginBrandingJson ?? branding?.loginBrandingJson ?? null,
    slotConfigJson: previewOverrides?.slotConfigJson ?? branding?.slotConfigJson ?? null,
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
    if (isPreviewMode) return; // ◄ Skip auth redirect in preview mode
    hasCheckedAuth.current = true;
    vm.checkAndRedirect();
  }, [vm.hasHydrated, vm.checkAndRedirect, isPreviewMode]);

  // Wire resolved tenant ID into the login viewmodel for tenant-scoped login
  useEffect(() => {
    if (tenantId) {
      vm.setTenantId(tenantId);
    }
  }, [tenantId, vm.setTenantId]);

  // Dynamic document title — a11y page title override takes priority
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (a11y.pageTitle) {
        document.title = a11y.pageTitle;
      } else {
        document.title = isResolved
          ? `Login — ${companyName}`
          : `Login — ${BRAND.name}`;
      }
    }
  }, [isResolved, companyName, a11y.pageTitle]);

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

  // ── Premium loading gate (skip in preview mode) ──
  // Always wait for branding resolution before first paint to prevent FOUC
  if (!isPreviewMode && (!vm.hasHydrated || vm.isRedirecting || isTenantLoading)) {
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

  // ── Tenant status routing (skip in preview mode) ──
  if (!isPreviewMode && (branding?.status === "suspended" || branding?.status === "canceled")) {
    return <TenantSuspendedView branding={branding} />;
  }

  // Non-existent tenant domain (skip in preview mode)
  if (!isPreviewMode && !isTenantLoading && !isResolved && typeof window !== "undefined") {
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
    <div
      id="login-main-content"
      className="w-full"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
      {...(a11y.ariaLandmarks ? { role: "main", "aria-label": t("auth.loginFormAriaLabel") } : {})}
    >
      {/* Safe Mode Banner */}
      {safeModeActive && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400" role="alert">
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
            errorAnnounce={a11y.errorAnnounce}
          />
          <SsoProviderButtons
            providers={sso.providers}
            isLoading={sso.isLoading}
            error={sso.error}
            onProviderClick={sso.initiateSsoLogin}
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
        />
      )}

      {/* Slot: form.below */}
      <SlotRenderer slotId="login.form.below" slotConfig={slotConfig} className="mt-6" />
    </div>
  );

  // ── Skip-to-Content Link (accessibility) ──
  const skipLink = a11y.skipLinkEnabled ? (
    <a href="#login-main-content" className="login-skip-link">
      {t("auth.a11y.skipToContent")}
    </a>
  ) : null;

  // ── Top Actions Bar (shared — includes skipLink so it propagates to all layouts) ──
  const topActions = (
    <>
      {skipLink}
      <div className="absolute left-8 right-8 top-8 flex items-center justify-between lg:justify-end gap-5 z-20" {...(a11y.ariaLandmarks ? { role: "navigation", "aria-label": t("auth.a11y.topActionsLabel") } : {})}>
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
    </>
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
  // 12 LAYOUT VARIANTS
  // ═══════════════════════════════════════════════════

  // Common wrapper style — single layered background for gradient support
  const bgStyle = "selection:bg-primary/20";
  const wrapperStyle: React.CSSProperties = {
    background: "var(--login-bg-image, none) center/cover no-repeat, var(--login-bg, hsl(var(--background)))",
    // fontFamily handled by .login-page CSS class (with RTL combined font stack)
    lineHeight: "var(--login-line-height, 1.5)",
    letterSpacing: "var(--login-letter-spacing, 0px)",
  };

  // Split layouts: outer wrapper uses solid bg, each side manages its own
  const splitWrapperStyle: React.CSSProperties = {
    ...wrapperStyle,
    background: "none",
  };

  // Form side in split layouts: show bg-image + solid fallback
  const formSideBgStyle: React.CSSProperties = {
    background: "var(--login-bg-image, none) var(--login-bg-image-position, center)/var(--login-bg-image-fit, cover) no-repeat, var(--login-bg, hsl(var(--background)))",
  };

  switch (layout) {
    // ── SPLIT-LEFT: Branding right, form left ──────
    case "split-left":
      return (
        <div className={`flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]" style={formSideBgStyle}>
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && (
              <DesktopHeading companyName={companyName} />
            )}
            {formContent}
            {footer}
            {footerSlot}
          </div>
          <LoginBranding branding={branding} slotConfig={slotConfig} position="right" />
        </div>
      );

    // ── CENTERED ──
    case "centered":
      return (
        <div className={`flex min-h-screen w-full flex-col items-center ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 w-full max-w-lg">
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

    // ── BRANDED-FULL ──
    case "branded-full":
      return (
        <div
          className={`relative flex min-h-screen w-full items-center justify-center ${bgStyle} login-page selection:bg-primary/20`}
          dir={direction}
          style={wrapperStyle}
        >
          <div className="absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, #000000)", opacity: "var(--login-overlay-opacity, 0.5)", backdropFilter: "blur(var(--login-overlay-blur, 0px))" }} />
          {topActions}
          <div className="relative z-10 w-full border border-[var(--login-border,hsl(var(--border)))]/50 backdrop-blur-xl mx-4" style={{ maxWidth: "var(--login-form-width, 480px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 95%, transparent)" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden bg-background border border-border shadow-sm" style={{ borderRadius: "var(--login-radius-card, 12px)" }}>
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}>{companyName}</h1>
            </div>
            <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── MINIMAL ──
    case "minimal":
      return (
        <div className={`flex min-h-screen w-full flex-col items-center justify-center ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="w-full px-6" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}>{companyName}</h1>
              <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            {formContent}
            {footerSlot}
            <p className="mt-12 text-center text-[11px] font-medium text-muted-foreground/50">
              © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
            </p>
          </div>
        </div>
      );

    // ── OVERLAY (True glassmorphism over bg image) ──
    case "overlay":
      return (
        <div
          className={`relative flex min-h-screen w-full items-center justify-center ${bgStyle} login-page selection:bg-primary/20`}
          dir={direction}
          style={wrapperStyle}
        >
          <div className="absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, hsl(var(--background)))", opacity: "var(--login-overlay-opacity, 0.7)", backdropFilter: "blur(var(--login-overlay-blur, 6px))" }} />
          {topActions}
          <div className="relative z-10 w-full border border-[var(--login-accent,hsl(var(--border)))]/30 shadow-2xl backdrop-blur-2xl mx-4" style={{ maxWidth: "var(--login-form-width, 420px)", padding: "var(--login-card-padding, 32px)", borderRadius: "var(--login-radius-card, 24px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 85%, transparent)" }}>
            {/* Luminous border glow */}
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-[var(--login-primary,hsl(var(--primary)))]/20 via-transparent to-[var(--login-primary,hsl(var(--primary)))]/10" />
            <div className="relative z-10">
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[var(--login-accent,hsl(var(--border)))]/30 shadow-lg backdrop-blur-sm" style={{ backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 60%, transparent)" }}>
                  <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </div>
                <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}>{companyName}</h1>
                <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
              </div>
              {formContent}
              {footerSlot}
            </div>
          </div>
        </div>
      );

    // ── MAGAZINE (Editorial-style with large hero text) ──
    case "magazine":
      return (
        <div className={`flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="relative hidden lg:flex lg:w-3/5 flex-col justify-end p-16 overflow-hidden"
            style={{ backgroundImage: "var(--login-bg-image, none)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 max-w-2xl">
              <h1 className="login-heading text-6xl font-bold tracking-tight text-white leading-[1.1]"
              >
                {branding?.loginHeadline || t("auth.branding.headline")}
              </h1>
              <p className="mt-4 text-lg text-white/80">{branding?.loginSubtitle || t("auth.branding.subtitle")}</p>
            </div>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="relative z-10 mt-8" />
          </div>
          <div className="relative flex w-full lg:w-2/5 flex-col items-center justify-center px-6 py-12">
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    // ── STACKED (Brand banner top, form below) ──
    case "stacked":
      return (
        <div className={`flex min-h-screen w-full flex-col ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          {/* Brand Banner */}
          <div className="relative w-full py-12 px-8 text-center overflow-hidden"
            style={{ backgroundImage: "var(--login-bg-image, none)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-[var(--login-surface,hsl(var(--muted)/0.4))]" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</h1>
              <p className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{t("auth.pleaseLogin")}</p>
            </div>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="relative z-10 mt-6" />
          </div>
          {/* Form */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── SIDEBAR-COMPACT (Narrow brand bar + form) ──
    case "sidebar-compact":
      return (
        <div className={`flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          {/* Narrow brand strip */}
          <div className="hidden lg:flex w-20 flex-col items-center justify-between py-8 bg-[var(--login-surface,hsl(var(--muted)/0.4))] border-e border-border">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
              <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
            <p className="text-[9px] text-muted-foreground/40 [writing-mode:vertical-lr] rotate-180">© {new Date().getFullYear()} {companyName}</p>
          </div>
          {/* Main form area */}
          <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    // ── ASYMMETRIC (60/40 split with accent divider) ──
    case "asymmetric":
      return (
        <div className={`flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
            <LoginBranding branding={branding} slotConfig={slotConfig} position="left" />
            {/* Accent divider */}
            <div className="absolute inset-y-0 end-0 w-1 bg-gradient-to-b from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
          </div>
          <div className="relative flex w-full lg:w-[40%] flex-col items-center justify-center px-6 py-12">
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    // ── FLOATING (Card floating with pattern bg) ──
    case "floating":
      return (
        <div className={`relative flex min-h-screen w-full items-center justify-center ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {/* Pattern background */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
          {topActions}
          <div className="relative z-10 w-full border border-border mx-4" style={{ maxWidth: "var(--login-form-width, 440px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}>{companyName}</h1>
              <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── IMMERSIVE (Full-bleed cinematic hero, no card) ──
    case "immersive":
      return (
        <div
          className={`relative flex min-h-screen w-full ${bgStyle} font-sans selection:bg-primary/20`}
          dir={direction}
          style={wrapperStyle}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom right, var(--login-overlay-color, hsl(var(--background)))/0.8, transparent/0.4, var(--login-overlay-color, hsl(var(--background)))/0.8)", opacity: "var(--login-overlay-opacity, 0.7)", backdropFilter: "blur(var(--login-overlay-blur, 0px))" }} />
          {topActions}
          {/* Left: Big cinematic headline */}
          <div className="relative z-10 hidden lg:flex lg:w-3/5 flex-col justify-center px-16 xl:px-24">
            <h1 className="login-heading text-7xl font-black tracking-tighter leading-[0.95] text-[var(--login-text,hsl(var(--foreground)))]">
              {branding?.loginHeadline || companyName}
            </h1>
            <p className="mt-6 max-w-lg text-xl text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
              {branding?.loginSubtitle || t("auth.branding.subtitle")}
            </p>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
          </div>
          {/* Right: Form directly on surface (no card) */}
          <div className="relative z-10 flex w-full lg:w-2/5 flex-col items-center justify-center px-8 py-12">
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    // ── SPLIT-DIAGONAL (Diagonal clip separating brand/form) ──
    case "split-diagonal":
      return (
        <div className={`relative flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="hidden lg:block absolute inset-0 w-[55%]" style={{ clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)", backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}>
            <LoginBranding branding={branding} slotConfig={slotConfig} position="left" />
          </div>
          <div className="relative z-10 flex w-full lg:ms-auto lg:w-[50%] flex-col items-center justify-center px-6 py-12">
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    // ── CAROUSEL (Auto-rotating testimonials branding panel) ──
    case "carousel":
      return (
        <div className={`flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center overflow-hidden bg-[var(--login-surface,hsl(var(--muted)/0.4))] border-e border-border p-16">
            <div className="mb-8">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
            </div>
            <h2 className="login-heading text-4xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">
              {branding?.loginHeadline || t("auth.branding.headline")}
            </h2>
            <p className="mt-4 text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{branding?.loginSubtitle || t("auth.branding.subtitle")}</p>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
            <SlotRenderer slotId="login.sidebar.bottom" slotConfig={slotConfig} className="mt-auto pt-10" />
          </div>
          <div className="relative flex w-full lg:w-1/2 xl:w-[45%] flex-col items-center justify-center px-6 py-12">
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      );

    // ── GLASS-MORPHISM (Extreme glass: thick blur, luminous border) ──
    case "glass-morphism":
      return (
        <div className={`relative flex min-h-screen w-full items-center justify-center ${bgStyle} login-page selection:bg-primary/20`} dir={direction}
          style={wrapperStyle}>
          <div className="absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, hsl(var(--background)))", opacity: "var(--login-overlay-opacity, 0.5)", backdropFilter: "blur(var(--login-overlay-blur, 2px))" }} />
          {/* Ambient glow orbs */}
          <div className="pointer-events-none absolute top-1/4 start-1/4 h-64 w-64 rounded-full bg-[var(--login-primary,hsl(var(--primary)))]/20 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-1/4 end-1/4 h-48 w-48 rounded-full bg-[var(--login-primary,hsl(var(--primary)))]/15 blur-[80px]" />
          {topActions}
          <div className="relative z-10 w-full mx-4" style={{ maxWidth: "var(--login-form-width, 440px)" }}>
            <div className="border border-[var(--login-accent,hsl(var(--border)))]/20 shadow-2xl backdrop-blur-3xl" style={{ borderRadius: "var(--login-radius-card, 24px)", padding: "var(--login-card-padding, 40px)", backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 70%, transparent)" }}>
              <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-[var(--login-primary,hsl(var(--primary)))]/30 via-transparent to-[var(--login-primary,hsl(var(--primary)))]/15" />
              <div className="relative z-10">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                  <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-2xl border border-[var(--login-accent,hsl(var(--border)))]/20 shadow-xl backdrop-blur-md" style={{ backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 50%, transparent)" }}>
                    <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</h1>
                  <p className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{t("auth.pleaseLogin")}</p>
                </div>
                {formContent}
                {footerSlot}
              </div>
            </div>
          </div>
        </div>
      );

    // ── GRADIENT-WAVE (Animated wave between sections) ──
    case "gradient-wave":
      return (
        <div className={`flex min-h-screen w-full flex-col ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          {/* Top branded section */}
          <div className="relative flex flex-col items-center justify-center px-8 pt-20 pb-24 text-center" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}>
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
              <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
            <h1 className="login-heading mt-6 text-4xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</h1>
            <p className="mt-3 text-base text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{branding?.loginSubtitle || t("auth.branding.subtitle")}</p>
            {/* Wave SVG divider */}
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ height: "60px" }}>
              <path d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,50 1440,40 L1440,100 L0,100 Z" fill="var(--login-bg, hsl(var(--background)))" />
            </svg>
          </div>
          {/* Bottom form section */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── SPOTLIGHT (Dark bg with radial glow behind form) ──
    case "spotlight":
      return (
        <div className={`relative flex min-h-screen w-full items-center justify-center ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {/* Radial spotlight glow */}
          <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 50% 60% at 50% 50%, var(--login-primary, hsl(var(--primary)))/0.12 0%, transparent 70%)` }} />
          {topActions}
          <div className="relative z-10 w-full border border-[var(--login-accent,hsl(var(--border)))] mx-4" style={{ maxWidth: "var(--login-form-width, 420px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
                <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}>{companyName}</h1>
              <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── DUAL-PANEL (Header + features left + form right) ──
    case "dual-panel":
      return (
        <div className={`flex min-h-screen w-full flex-col ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          {/* Top header bar */}
          <div className="flex items-center justify-between border-b border-border px-8 py-4" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-background border border-border"><img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
              <span className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</span>
            </div>
            <div className="flex gap-1"><LanguageSwitcher /><ThemeSwitcher /></div>
          </div>
          {/* Two-column body */}
          <div className="flex flex-1">
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center border-e border-border px-12 xl:px-16" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.2))" }}>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">{branding?.loginHeadline || t("auth.branding.headline")}</h2>
              <p className="mt-3 text-base text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{branding?.loginSubtitle || t("auth.branding.subtitle")}</p>
              <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
              <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
              {formContent}
              {footerSlot}
            </div>
          </div>
        </div>
      );

    // ── CORNER-CARD (Small form bottom-right, large brand hero) ──
    case "corner-card":
      return (
        <div className={`relative flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          <div className="absolute inset-0" style={{ backgroundColor: "var(--login-overlay-color, hsl(var(--background)))", opacity: "var(--login-overlay-opacity, 0.6)", backdropFilter: "blur(var(--login-overlay-blur, 0px))" }} />
          {topActions}
          {/* Hero branding area */}
          <div className="relative z-10 hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24">
            <h1 className="login-heading text-6xl font-black tracking-tighter text-[var(--login-text,hsl(var(--foreground)))]">{branding?.loginHeadline || companyName}</h1>
            <p className="mt-4 max-w-lg text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{branding?.loginSubtitle || t("auth.branding.subtitle")}</p>
            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-8" />
          </div>
          {/* Corner card */}
          <div className="relative z-10 flex w-full lg:w-auto items-end lg:items-end justify-center lg:justify-end p-6 lg:p-10">
            <div className="w-full border border-[var(--login-accent,hsl(var(--border)))]" style={{ maxWidth: "var(--login-form-width, 400px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-background border border-border"><img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
                <span className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</span>
              </div>
              {formContent}
              {footerSlot}
            </div>
          </div>
        </div>
      );

    // ── VERTICAL-SPLIT (Top branding, bottom form) ──
    case "vertical-split":
      return (
        <div className={`flex min-h-screen w-full flex-col ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {topActions}
          <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 text-center" style={{ backgroundImage: "var(--login-bg-image, none)", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0" style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.6))" }} />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-background border border-border shadow-lg"><img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
              <h1 className="login-heading text-4xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">{branding?.loginHeadline || companyName}</h1>
              <p className="text-base text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">{branding?.loginSubtitle || t("auth.branding.subtitle")}</p>
            </div>
            {/* Gradient divider */}
            <div className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── FULLSCREEN-FORM (Zero distraction, full-screen form) ──
    case "fullscreen-form":
      return (
        <div className={`relative flex min-h-screen w-full items-center justify-center ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {/* Subtle animated dot pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--login-accent,hsl(var(--border)))_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.07]" />
          {topActions}
          <div className="relative z-10 w-full px-6" style={{ maxWidth: "var(--login-form-width, 400px)" }}>
            <div className="mb-12 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm"><img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}>{companyName}</h1>
            </div>
            {formContent}
            {footerSlot}
            <p className="mt-12 text-center text-[11px] font-medium text-[var(--login-text-muted,hsl(var(--muted-foreground)))]/50">© {new Date().getFullYear()} {companyName}</p>
          </div>
        </div>
      );

    // ── MOSAIC (CSS grid mosaic bg, form card centered) ──
    case "mosaic":
      return (
        <div className={`relative flex min-h-screen w-full items-center justify-center ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={wrapperStyle}>
          {/* Mosaic grid pattern background */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2 opacity-[0.06]">
            {Array.from({ length: 24 }).map((_, i) => (<div key={i} className="rounded-lg bg-[var(--login-primary,hsl(var(--primary)))]" style={{ opacity: 0.3 + (i % 5) * 0.15 }} />))}
          </div>
          {topActions}
          <div className="relative z-10 w-full border border-[var(--login-accent,hsl(var(--border)))] mx-4" style={{ maxWidth: "var(--login-form-width, 440px)", borderRadius: "var(--login-radius-card, 16px)", padding: "var(--login-card-padding, 32px)", boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))", backgroundColor: "var(--login-surface, hsl(var(--background)))" }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm"><img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
              <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}>{companyName}</h1>
              <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}>{t("auth.pleaseLogin")}</p>
            </div>
            {formContent}
            {footerSlot}
          </div>
        </div>
      );

    // ── SPLIT-RIGHT (default): Branding left, form right ──
    case "split-right":
    default:
      return (
        <div className={`flex min-h-screen w-full ${bgStyle} login-page selection:bg-primary/20`} dir={direction} style={splitWrapperStyle}>
          <LoginBranding branding={branding} slotConfig={slotConfig} position="left" />
          <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]" style={formSideBgStyle}>
            {topActions}
            <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            {vm.loginStep === "credentials" && (
              <DesktopHeading companyName={companyName} />
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
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden bg-background border border-border shadow-sm" style={{ borderRadius: "var(--login-radius-card, 24px)" }}>
        <img src={logoSrc} alt={`${logoAlt} Logo`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </div>
      <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 24px)" }}>{companyName}</h1>
    </div>
  );
}

function DesktopHeading({ companyName }: { companyName: string }) {
  const { t } = useI18n();
  return (
    <div className="mb-10 text-center lg:text-start hidden lg:block w-full" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
      <h2 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]" style={{ fontSize: "var(--login-size-headline, 30px)" }}>{companyName}</h2>
      <p className="mt-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]" style={{ fontSize: "var(--login-size-subtitle, 0.9375rem)" }}>{t("auth.pleaseLogin")}</p>
    </div>
  );
}

export default LoginView;
