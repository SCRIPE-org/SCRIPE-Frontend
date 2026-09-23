/**
 * LoginView — 5-Layout Customizable Login Page
 * Renders tenant-branded login using the Login Rendering Engine.
 */
"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";

import { useLoginViewModel } from "../viewmodels/use-login-viewmodel";
import { useSsoProviders } from "../viewmodels/useSsoProviders";
import { useTenantResolution, isPlatformDomain } from "../viewmodels/useTenantResolution";
import { useLoginBrandingTokens } from "../viewmodels/useLoginBrandingTokens";
import { usePreviewMode } from "../viewmodels/usePreviewMode";

import { SlotRenderer } from "../components/SlotRenderer";
import { LoginFormRouter } from "../components/LoginFormRouter";
import { LoginLayoutRouter } from "../components/LoginLayoutRouter";
import { LoginTopActions } from "../components/LoginTopActions";
import { TenantSuspendedView, TenantNotFoundView } from "./TenantStatusView";

/**
 * LoginView represents the main customizable portal for tenant-scoped and platform authentication.
 */
export function LoginView() {
  const vm = useLoginViewModel();
  const { t, language, direction, setLanguage } = useI18n();
  const isRTL = language === "ar";
  const hasCheckedAuth = useRef(false);

  // Pre-auth domain resolution for white-label branding
  const {
    tenantId,
    branding,
    isResolved,
    isLoading: isTenantLoading,
    isApiError,
  } = useTenantResolution();

  // Studio preview mode (§22)
  const { isPreviewMode, previewOverrides } = usePreviewMode();

  // One-time sync: apply resolved preferences only on initial load
  const hasAppliedInitialPrefs = useRef(false);
  const dashboardThemeJson = branding?.dashboardThemeJson;
  useEffect(() => {
    if (hasAppliedInitialPrefs.current || !dashboardThemeJson) return;
    try {
      const prefs = JSON.parse(dashboardThemeJson);
      if (prefs.language === "ar" || prefs.language === "en") setLanguage(prefs.language);
      hasAppliedInitialPrefs.current = true;
    } catch {
      /* ignore */
    }
  }, [dashboardThemeJson, setLanguage]);

  // Login rendering engine — CSS token injection + layout + accessibility
  const { layout, slotConfig, a11y } = useLoginBrandingTokens({
    loginBrandingJson: previewOverrides?.loginBrandingJson ?? branding?.loginBrandingJson ?? null,
    slotConfigJson: previewOverrides?.slotConfigJson ?? branding?.slotConfigJson ?? null,
    isSafeMode: branding?.isSafeMode ?? false,
  });

  const sso = useSsoProviders({ tenantId, mode: branding?.identityProviderMode ?? "inherit" });

  const resolvedLogoSrc = useResolvedFileUrl(branding?.logoUrl);
  const logoSrc = branding?.logoUrl ? resolvedLogoSrc || "/brand/app-logo-1024.png" : "/brand/app-logo-1024.png";
  const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;

  const hasHydrated = vm.hasHydrated;
  const checkAndRedirect = vm.checkAndRedirect;
  useEffect(() => {
    if (hasCheckedAuth.current || !hasHydrated || isPreviewMode) return;
    hasCheckedAuth.current = true;
    checkAndRedirect();
  }, [hasHydrated, checkAndRedirect, isPreviewMode]);

  const setTenantId = vm.setTenantId;
  useEffect(() => {
    setTenantId(tenantId ?? undefined);
  }, [tenantId, setTenantId]);

  // Dynamic title + favicon
  const pageTitle = a11y.pageTitle;
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title =
      pageTitle || (isResolved ? `Login — ${companyName}` : `Login — ${BRAND.name}`);
  }, [isResolved, companyName, pageTitle]);

  const faviconUrl = branding?.faviconUrl;
  useEffect(() => {
    if (typeof document === "undefined" || !faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);

  // ── Loading gate ──────────────────────────────────────────────────────────
  if (!isPreviewMode && (!vm.hasHydrated || vm.isRedirecting || isTenantLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/40"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Tenant status routing ─────────────────────────────────────────────────
  if (!isPreviewMode && (branding?.status === "suspended" || branding?.status === "canceled")) {
    return <TenantSuspendedView branding={branding} />;
  }

  if (
    !isPreviewMode &&
    !isTenantLoading &&
    !isResolved &&
    !isApiError &&
    typeof window !== "undefined"
  ) {
    const hostname = window.location.hostname;
    const devCode = new URLSearchParams(window.location.search).get("_tenant");
    const isTenantExpected = devCode !== null || !isPlatformDomain(hostname);
    if (isTenantExpected) return <TenantNotFoundView />;
  }

  const safeModeActive = branding?.isSafeMode === true;

  // Platform mode = no tenant resolved (we're on the root platform surface).
  // Tenant mode = a specific workspace is resolved (scoped login, no create-workspace).
  const isPlatformMode = !tenantId;

  const formContent = (
    <LoginFormRouter
      vm={vm}
      sso={sso}
      tenantId={tenantId}
      slotConfig={slotConfig}
      a11y={a11y}
      isRTL={isRTL}
      safeModeActive={safeModeActive}
      isPlatformMode={isPlatformMode}
    />
  );

  const topActions = (
    <LoginTopActions skipLinkEnabled={a11y.skipLinkEnabled} ariaLandmarks={a11y.ariaLandmarks} />
  );

  const footer = (
    <div className="mt-12 text-center lg:hidden">
      <p className="text-[11px] font-medium text-muted-foreground/50">
        © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
      </p>
    </div>
  );

  const footerSlot = (
    <SlotRenderer slotId="login.footer" slotConfig={slotConfig} className="mt-6" />
  );

  return (
    <LoginLayoutRouter
      layout={layout}
      slotConfig={slotConfig}
      loginBrandingJson={previewOverrides?.loginBrandingJson ?? branding?.loginBrandingJson ?? null}
      branding={branding}
      formContent={formContent}
      topActions={topActions}
      footer={footer}
      footerSlot={footerSlot}
      logoSrc={logoSrc}
      logoAlt={logoAlt}
      companyName={companyName}
      direction={direction}
      loginStep={vm.loginStep}
      t={t}
    />
  );
}

export default LoginView;
