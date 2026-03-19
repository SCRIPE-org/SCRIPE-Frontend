"use client";

/**
 * TenantBrandingProvider
 *
 * After authentication, fetches the current user's tenant branding
 * via GET /tenants/my/branding and exposes it to all layout components.
 * System admins (no tenant) receive null → uses platform defaults.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { getModuleApiService } from "@core/services/api-factory";
import { resolveFileUrl } from "@core/common/utils";
import { BRAND } from "@core/config/branding";
import { useAppStore } from "@core/store/useAppStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";

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
      logoUrl: "/app-logo.png",
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

      useEffect(() => {
            if (!isAuthenticated || !user) {
                  setIsLoading(false);
                  return;
            }

            let cancelled = false;

            async function fetchBranding() {
                  try {
                        const api = getModuleApiService("IDENTITY");
                        const data = await api.get<TenantBrandingData>(API_ENDPOINTS.TENANTS.MY_BRANDING);

                        if (!cancelled && data) {
                              setBranding(data);
                        }
                  } catch {
                        // System admin or error → use platform defaults
                        if (!cancelled) {
                              setBranding(null);
                        }
                  } finally {
                        if (!cancelled) setIsLoading(false);
                  }
            }

            fetchBranding();
            return () => { cancelled = true; };
      }, [isAuthenticated, user?.tenantId]);

      // Build the context value with fallbacks
      const appName = branding?.companyName ?? branding?.name ?? BRAND.name;
      const logoUrl = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
      const faviconUrl = branding?.faviconUrl ? resolveFileUrl(branding.faviconUrl) : null;
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
            return () => { document.title = originalTitle; };
      }, [appName, isTenantContext]);

      // ── Gap 3: Inject tenant primary color as CSS variable ──
      useEffect(() => {
            if (typeof document === "undefined") return;
            const root = document.documentElement;
            if (primaryColor) {
                  root.style.setProperty("--tenant-primary", primaryColor);
            }
            return () => { root.style.removeProperty("--tenant-primary"); };
      }, [primaryColor]);

      // ══════════════════════════════════════════════════════════
      // GLOBAL PREFS SYNC — Parse DashboardThemeJson, sync to localStorage,
      // and apply as defaults when no manual override exists.
      //
      // DashboardThemeJson format: { "theme": "light", "language": "ar", "sidebarCollapsed": true }
      //
      // Priority: manual (localStorage.theme) > tenant pref (nexora_pref_*) > platform default
      // ══════════════════════════════════════════════════════════
      useEffect(() => {
            if (typeof window === "undefined" || !branding?.dashboardThemeJson) return;

            try {
                  const prefs = JSON.parse(branding.dashboardThemeJson);

                  // 1. Always write tenant pref keys (so they're available as fallback)
                  if (prefs.theme) localStorage.setItem(STORAGE_KEYS.PREF_THEME, prefs.theme);
                  if (prefs.language) localStorage.setItem(STORAGE_KEYS.PREF_LANG, prefs.language);
                  if (prefs.sidebarCollapsed !== undefined)
                        localStorage.setItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED, String(prefs.sidebarCollapsed));

                  // 2. Apply as defaults ONLY when no manual override exists
                  // Theme: if no "theme" in localStorage (first visit or cleared)
                  const currentTheme = localStorage.getItem("theme");
                  if (!currentTheme && prefs.theme) {
                        setTheme(prefs.theme);
                  }

                  // Language: if no "language" in localStorage (first visit or cleared)
                  const currentLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
                  if (!currentLang && prefs.language) {
                        setLanguage(prefs.language as "en" | "ar");
                  }

                  // Sidebar: check app-storage for explicit sidebar state
                  try {
                        const stored = localStorage.getItem("app-storage");
                        const hasSidebar = stored && JSON.parse(stored).state?.sidebarOpen !== undefined;
                        if (!hasSidebar && prefs.sidebarCollapsed !== undefined) {
                              setSidebarOpen(!prefs.sidebarCollapsed);
                        }
                  } catch { /* ignore */ }
            } catch { /* invalid JSON — skip */ }
      }, [branding?.dashboardThemeJson, setTheme, setLanguage, setSidebarOpen]);

      const value: TenantBrandingContextValue = {
            appName,
            logoUrl,
            faviconUrl,
            companyName,
            primaryColor,
            isLoading,
            isTenantContext,
      };

      return (
            <TenantBrandingContext.Provider value={value}>
                  {children}
            </TenantBrandingContext.Provider>
      );
}
