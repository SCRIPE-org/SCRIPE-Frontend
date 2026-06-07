"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { getAuthContainer } from "@modules/auth/di";
import { BRAND } from "@core/config/branding";
import { env } from "@core/config/env";
import type { TenantBranding } from "../../../domain/entities/TenantBranding";

export type { TenantBranding };

export interface TenantResolutionResult {
  tenantId: string | null;
  branding: TenantBranding | null;
  isResolved: boolean;
  isLoading: boolean;
  isApiError: boolean;
}

const SKIP_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"];

function isPlatformDomain(hostname: string): boolean {
  if (SKIP_DOMAINS.includes(hostname)) return true;
  if (hostname.endsWith(".localhost")) return true;
  
  try {
    const platformHost = new URL(env.NEXT_PUBLIC_APP_URL).hostname;
    if (hostname === platformHost) return true;
  } catch {
    // Ignore invalid URL
  }

  if (hostname === BRAND.domain) return true;
  
  return false;
}

function getDevTenantCode(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("_tenant");
  return code ? code.toUpperCase() : null;
}

function persistDashboardPreferences(branding: TenantBranding): void {
  if (!branding.dashboardThemeJson || typeof window === "undefined") return;

  try {
    const prefs = JSON.parse(branding.dashboardThemeJson);
    if (prefs.theme) localStorage.setItem(STORAGE_KEYS.PREF_THEME, prefs.theme);
    if (prefs.language) localStorage.setItem(STORAGE_KEYS.PREF_LANG, prefs.language);
    if (prefs.sidebarCollapsed !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PREF_SIDEBAR_COLLAPSED, String(prefs.sidebarCollapsed));
    }
    localStorage.setItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS, branding.dashboardThemeJson);
  } catch {
    // Invalid customization JSON should not block login.
  }
}

export function useTenantResolution(page?: string): TenantResolutionResult {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiError, setIsApiError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const hostname = window.location.hostname;
      const devCode = getDevTenantCode();

      if (!devCode && isPlatformDomain(hostname)) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAuthContainer().tenantResolutionRepository.resolveTenant({
          code: devCode,
          domain: devCode ? null : hostname,
          page,
        });

        if (!cancelled && data) {
          setTenantId(data.tenantId);
          setBranding(data);
          persistDashboardPreferences(data);
        }
      } catch {
        if (!cancelled) {
          setTenantId(null);
          setBranding(null);
          setIsApiError(!SKIP_DOMAINS.includes(hostname) && !hostname.endsWith(".localhost"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return {
    tenantId,
    branding,
    isResolved: branding !== null,
    isLoading,
    isApiError,
  };
}
