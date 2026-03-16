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

// ─── Types ────────────────────────────────────────────────

export interface TenantBrandingData {
      tenantId: string;
      name: string;
      companyName: string | null;
      logoUrl: string | null;
      faviconUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
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
      const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;

      const value: TenantBrandingContextValue = {
            appName,
            logoUrl,
            faviconUrl: branding?.faviconUrl ? resolveFileUrl(branding.faviconUrl) : null,
            companyName,
            primaryColor: branding?.primaryColor ?? null,
            isLoading,
            isTenantContext: branding !== null,
      };

      return (
            <TenantBrandingContext.Provider value={value}>
                  {children}
            </TenantBrandingContext.Provider>
      );
}
