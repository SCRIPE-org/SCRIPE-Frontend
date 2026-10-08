/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/**
 * TenantBrandingProvider
 *
 * After authentication, fetches the current user's tenant branding
 * via GET /tenants/my/branding and exposes it to all layout components.
 * System admins (no tenant) receive null → uses platform defaults.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { TENANTS_ENDPOINTS } from "@core/config/api-endpoints";
import { getModuleApiService } from "@core/services/api-factory";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { BRAND } from "@core/config/branding";
import { useAppStore } from "@core/store/useAppStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import { secureTokenService } from "@core/common/secure-token-service";

// ─── Types ────────────────────────────────────────────────

export interface TenantBrandingData {
  tenantId: string;
  name: string;
  companyName: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  // Customization system (login-relevant, safe for pre-auth)
  loginBrandingJson: string | null;
  loginTextOverridesJson: string | null;
  customFeaturesJson: string | null;
  slotConfigJson: string | null;
  dashboardThemeJson: string | null;
  termsOfServiceUrl: string | null;
  privacyPolicyUrl: string | null;
  isSafeMode: boolean;
  // M11: Admin override control — determines which settings admins can customize
  allowAdminThemeOverride: boolean;
  allowedAdminSettingsJson: string | null;
  // Gap #10: Version for stale-cache detection
  settingsVersion: number;
}

export interface TenantBrandingContextValue {
  /** Display name: companyName → name → BRAND.name */
  appName: string;
  /** Resolved absolute logo URL or default */
  logoUrl: string;
  /** Favicon URL if available */
  faviconUrl: string | null;
  /** Company name for footer/header */
  companyName: string;
  /** Primary color from tenant settings */
  primaryColor: string | null;
  /** Whether branding has been fetched */
  isLoading: boolean;
  /** Whether user is on a tenant (vs system admin) */
  isTenantContext: boolean;
}

// ─── Context ──────────────────────────────────────────────

const TenantBrandingContext = createContext<TenantBrandingContextValue>({
  appName: BRAND.name,
  logoUrl: "/brand/app-logo-1024.png",
  faviconUrl: null,
  companyName: BRAND.name,
  primaryColor: null,
  isLoading: true,
  isTenantContext: false,
});

// ─── Hook ─────────────────────────────────────────────────

export function useTenantBranding(): TenantBrandingContextValue {
  return useContext(TenantBrandingContext);
}

// ─── Provider ─────────────────────────────────────────────

interface TenantBrandingProviderProps {
  children: ReactNode;
}

export function TenantBrandingProvider({ children }: TenantBrandingProviderProps) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const { setTheme } = useTheme();
  const { setLanguage } = useI18n();
  const [branding, setBranding] = useState<TenantBrandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [hasToken, setHasToken] = useState(() => secureTokenService.hasToken());

  useEffect(() => {
    const unsubscribe = secureTokenService.subscribe(() => {
      setHasToken(secureTokenService.hasToken());
    });
    return unsubscribe;
  }, []);

  const username = user?.username;

  useEffect(() => {
    if (!isAuthenticated || !user || !hasToken) {
      if (!isAuthenticated || !user) {
        queueMicrotask(() => {
          setIsLoading(false);
        });
      }
      return;
    }

    let cancelled = false;

    async function fetchBranding() {
      try {
        const api = getModuleApiService("IDENTITY");
        const data = await api.get<TenantBrandingData>(TENANTS_ENDPOINTS.TENANTS.MY_BRANDING);

        if (!cancelled && data) {
          setBranding(data);
        }
      } catch {
        // System admin or error → use platform defaults
        if (!cancelled) {
          setBranding(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          // Signal SettingsProvider that branding fetch is done
          // (even if dashboardThemeJson is null — SettingsProvider should finalize)
          window.dispatchEvent(new Event("tenant-branding-loaded"));
        }
      }
    }

    fetchBranding();
    return () => {
      cancelled = true;
    };
    // Depend on username, not tenantId: MY_BRANDING is resolved server-side from
    // the auth token (no tenantId param sent), so this array only needs to detect
    // "different session, please refetch" -- and user.tenantId is
    // IIdEncryptionService.Encrypt(guid), a fresh ciphertext on every /Admins/me
    // response for the SAME tenant, which retriggers this effect on every user
    // refresh instead of settling (same bug as navigation-provider.tsx's
    // contextKey). Drill-down tenant switches are unaffected: enterTenantWorld
    // already forces a full page reload, which remounts this provider anyway.
  }, [isAuthenticated, username, hasToken]);

  // Build the context value with fallbacks.
  // Hooks run unconditionally regardless of `branding` — each already
  // handles empty/undefined input and resolves once branding arrives.
  const resolvedLogoUrl = useResolvedFileUrl(branding?.logoUrl);
  const resolvedFaviconUrl = useResolvedFileUrl(branding?.faviconUrl);
  const appName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const logoUrl = branding?.logoUrl
    ? resolvedLogoUrl || "/brand/app-logo-1024.png"
    : "/brand/app-logo-1024.png";
  const faviconUrl = branding?.faviconUrl ? resolvedFaviconUrl || null : null;
  const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;
  const primaryColor = branding?.primaryColor ?? null;
  const isTenantContext = branding !== null;

  // ── Gap 2: Swap browser favicon when tenant branding is available ──
  useEffect(() => {
    if (typeof document === "undefined" || !faviconUrl) return;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);

  // ── Gap 2b: Update document title with tenant name ──
  useEffect(() => {
    if (typeof document === "undefined" || !isTenantContext) return;
    const originalTitle = document.title;
    document.title = document.title.replace(BRAND.name, appName);
    return () => {
      document.title = originalTitle;
    };
  }, [appName, isTenantContext]);

  // ── Gap 3: Inject tenant primary color as CSS variable ──
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (primaryColor) {
      root.style.setProperty("--tenant-primary", primaryColor);
    }
    return () => {
      root.style.removeProperty("--tenant-primary");
    };
  }, [primaryColor]);

  // ══════════════════════════════════════════════════════════
  // GLOBAL PREFS SYNC — Parse DashboardThemeJson, sync to localStorage,
  // and apply as defaults when no manual override exists.
  //
  // DashboardThemeJson contains two categories:
  //   1. Basic prefs: { theme, language, sidebarCollapsed }
  //   2. Dashboard appearance: { colorTheme, layoutTemplate, cardStyle, ... }
  //
  // Priority (4-layer merge per analysis Section 9):
  //   Layer 1: Platform defaults (hardcoded defaultSettings)
  //   Layer 3: Tenant defaults (DashboardThemeJson → scr_pref_dashboard_settings)
  //   Layer 4: Admin overrides (localStorage dashboard-settings)
  // ══════════════════════════════════════════════════════════
  const dashboardThemeJson = branding?.dashboardThemeJson;
  useEffect(() => {
    if (typeof window === "undefined" || !dashboardThemeJson) return;

    try {
      const prefs = JSON.parse(dashboardThemeJson);

      // 1. Write basic pref keys (backward compat for theme/i18n/sidebar providers)
      if (prefs.theme) localStorage.setItem(STORAGE_KEYS.PREF_THEME, prefs.theme);
      if (prefs.language) localStorage.setItem(STORAGE_KEYS.PREF_LANG, prefs.language);
      if (prefs.sidebarCollapsed !== undefined)
        localStorage.setItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED, String(prefs.sidebarCollapsed));

      // 2. Write the FULL DashboardThemeJson + override control as tenant defaults for settings-provider (Layer 3)
      // M11: Enrich with AllowAdminThemeOverride + AllowedAdminSettingsJson so SettingsProvider
      // can enforce path-level access control during the 4-layer merge.
      const enrichedDefaults = {
        ...prefs,
        _allowAdminOverride: branding.allowAdminThemeOverride ?? true,
        _allowedAdminPaths: branding.allowedAdminSettingsJson
          ? JSON.parse(branding.allowedAdminSettingsJson)
          : null,
        // Gap #10: Include version so SettingsProvider can detect stale admin caches
        _settingsVersion: branding.settingsVersion ?? 0,
      };
      localStorage.setItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS, JSON.stringify(enrichedDefaults));

      // 3. Apply basic prefs as defaults ONLY when no manual override exists
      const currentTheme = localStorage.getItem("theme");
      if (!currentTheme && prefs.theme) {
        setTheme(prefs.theme);
      }

      const currentLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (!currentLang && prefs.language) {
        setLanguage(prefs.language as "en" | "ar");
      }

      try {
        const stored = localStorage.getItem("app-storage");
        const hasSidebar = stored && JSON.parse(stored).state?.sidebarOpen !== undefined;
        if (!hasSidebar && prefs.sidebarCollapsed !== undefined) {
          setSidebarOpen(!prefs.sidebarCollapsed);
        }
      } catch {
        /* ignore */
      }

      // 4. Signal SettingsProvider to re-merge with the now-populated tenant defaults
      // This eliminates FOUC — SettingsProvider listens for this event and re-applies the 4-layer merge
      window.dispatchEvent(new Event("tenant-branding-loaded"));
    } catch {
      /* invalid JSON — skip */
    }
  }, [dashboardThemeJson, setTheme, setLanguage, setSidebarOpen]);

  const value: TenantBrandingContextValue = {
    appName,
    logoUrl,
    faviconUrl,
    companyName,
    primaryColor,
    isLoading,
    isTenantContext,
  };

  return <TenantBrandingContext.Provider value={value}>{children}</TenantBrandingContext.Provider>;
}
