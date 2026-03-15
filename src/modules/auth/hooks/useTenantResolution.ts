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
 * @module auth/hooks
 */
"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import { getModuleApiService } from "@core/services/api-factory";

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

                  // On dev domains, only resolve if ?_tenant=CODE is present
                  if (isDevDomain(hostname) && !devCode) {
                        setIsLoading(false);
                        return;
                  }

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
                        }
                  } catch {
                        // Domain doesn't resolve → use default branding (not an error)
                        if (!cancelled) {
                              setTenantId(null);
                              setBranding(null);
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
      };
}
