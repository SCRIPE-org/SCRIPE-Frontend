/**
 * useTenantResolution — Pre-Authentication Tenant Domain Resolution Hook
 *
 * On mount, extracts `window.location.hostname` and calls
 * `GET /api/v1/tenants/resolve?domain={hostname}` to retrieve
 * tenant branding and IdP configuration mode.
 *
 * Falls back gracefully: if the domain doesn't resolve (e.g. localhost),
 * returns null branding → UI shows default NEXORA branding.
 *
 * // ARCH-EXCEPTION: pre-auth hook — calls getModuleApiService directly
 * // because no auth token exists yet (runs before login).
 * // Cannot go through DI container or repository pattern.
 *
 * @module auth/signin/presentation
 */
"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import { getModuleApiService } from "@core/services/api-factory";
import { STORAGE_KEYS } from "@core/config/storage-keys";

// ─── Types ────────────────────────────────────────────────

/** Public branding DTO returned by the resolve endpoint */
export interface TenantBranding {
      tenantId: string;
      name: string;
      companyName: string | null;
      logoUrl: string | null;
      faviconUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
      loginHeadline: string | null;
      loginSubtitle: string | null;
      identityProviderMode: string; // "inherit" | "custom"
      status: string | null;        // "suspended" | "canceled" | null (active)
      statusReason: string | null;  // reason for suspension/cancellation
      // Customization system (login rendering engine)
      loginBrandingJson: string | null;
      slotConfigJson: string | null;
      dashboardThemeJson: string | null;
      isSafeMode: boolean;
}

/** Hook return value */
export interface TenantResolutionResult {
      /** Resolved tenant ID (encrypted), null if not on a tenant subdomain */
      tenantId: string | null;
      /** Branding data, null if not resolved */
      branding: TenantBranding | null;
      /** Whether the domain was successfully resolved to a tenant */
      isResolved: boolean;
      /** Whether the resolution request is in-flight */
      isLoading: boolean;
      /**
       * True when the API call failed due to a network/CORS/mixed-content error.
       * LoginView uses this to distinguish "API unreachable" (show platform login)
       * from "API says no tenant" (show Tenant Not Found).
       */
      isApiError: boolean;
}

// ─── Domains to skip ──────────────────────────────────────

const SKIP_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"];

function isDevDomain(hostname: string): boolean {
      return (
            SKIP_DOMAINS.includes(hostname) ||
            hostname.endsWith(".localhost")
      );
}

/**
 * Extract tenant code from URL query parameter (?_tenant=CODE) for dev fallback.
 * Returns null if not present.
 */
function getDevTenantCode(): string | null {
      if (typeof window === "undefined") return null;
      const params = new URLSearchParams(window.location.search);
      return params.get("_tenant");
}

// ─── Hook ─────────────────────────────────────────────────

export function useTenantResolution(): TenantResolutionResult {
      const [tenantId, setTenantId] = useState<string | null>(null);
      const [branding, setBranding] = useState<TenantBranding | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [isApiError, setIsApiError] = useState(false);

      useEffect(() => {
            let cancelled = false;

            async function resolve() {
                  // SSR guard
                  if (typeof window === "undefined") {
                        setIsLoading(false);
                        return;
                  }

                  const hostname = window.location.hostname;
                  const devCode = getDevTenantCode();

                  // On dev domains, resolve by code if ?_tenant=CODE is present.
                  // Otherwise, call resolve with no params to get system-level defaults.

                  try {
                        const api = getModuleApiService("IDENTITY");
                        // Dev: use ?code=CODE, Prod: use ?domain=hostname
                        const queryParams = devCode
                              ? { code: devCode }
                              : { domain: hostname };
                        const url = buildUrl(API_ENDPOINTS.TENANTS.RESOLVE, queryParams);
                        const data = await api.get<TenantBranding>(url);

                        if (!cancelled && data) {
                              setTenantId(data.tenantId);
                              setBranding(data);

                              // ── Pre-auth prefs sync: write nexora_pref_* from DashboardThemeJson ──
                              // Only writes reference keys (nexora_pref_*) — NOT the active "theme"/"language" keys.
                              // The active keys are set by LoginView's one-time initial sync effect,
                              // so manual changes from the language/theme switcher are NOT overridden.
                              if (data.dashboardThemeJson) {
                                    try {
                                          const prefs = JSON.parse(data.dashboardThemeJson);
                                          if (prefs.theme) localStorage.setItem(STORAGE_KEYS.PREF_THEME, prefs.theme);
                                          if (prefs.language) localStorage.setItem(STORAGE_KEYS.PREF_LANG, prefs.language);
                                          if (prefs.sidebarCollapsed !== undefined)
                                                localStorage.setItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED, String(prefs.sidebarCollapsed));
                                          // Full dashboard settings for settings-provider Layer 3
                                          localStorage.setItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS, data.dashboardThemeJson);
                                    } catch { /* invalid JSON — skip */ }
                              }
                        }
                  } catch {
                        // API call failed (network error, CORS, mixed content, etc.)
                        // This is NOT the same as "tenant not found" — the API may simply be unreachable.
                        if (!cancelled) {
                              setTenantId(null);
                              setBranding(null);
                              setIsApiError(true);
                        }
                  } finally {
                        if (!cancelled) setIsLoading(false);
                  }
            }

            resolve();
            return () => {
                  cancelled = true;
            };
      }, []);

      return {
            tenantId,
            branding,
            isResolved: branding !== null,
            isLoading,
            isApiError,
      };
}

