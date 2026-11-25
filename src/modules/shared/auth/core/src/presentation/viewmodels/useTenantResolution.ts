"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { getAuthContainer } from "@modules/auth/di";
import { isPlatformDomain } from "@core/common/origin-routing";
import type { TenantBranding } from "../../../domain/entities/TenantBranding";

/**
 * Exported type in the auth/core module.
 */
export type { TenantBranding };

/**
 * Interface defining property specifications, keys types, and structural contract rules for tenant resolution result.
 */
export interface TenantResolutionResult {
  tenantId: string | null;
  branding: TenantBranding | null;
  isResolved: boolean;
  isLoading: boolean;
  isApiError: boolean;
  /** True when the current hostname or `_tenant` query explicitly expects a tenant workspace. */
  isTenantExpected: boolean;
  /** True when an explicit tenant lookup failed with 404 (unknown/inactive tenant). */
  isNotFound: boolean;
}

/**
 * Detect whether the current hostname is the platform or central auth domain.
 * Re-exported from `@core/common/origin-routing` (handles dev domains,
 * `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_AUTH_URL`).
 */
export { isPlatformDomain };

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const candidate = err as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
  };
  return (
    candidate.status === 404 ||
    candidate.statusCode === 404 ||
    candidate.response?.status === 404
  );
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

/**
 * React hook/ViewModel orchestrating state and data flows for tenant resolution.
 * Handles active states updates, form fields validations, and browser navigation controllers.
 */
export function useTenantResolution(page?: string): TenantResolutionResult {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiError, setIsApiError] = useState(false);
  const [isTenantExpected, setIsTenantExpected] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const hostname = window.location.hostname;
      const devCode = getDevTenantCode();
      const expectedTenant = Boolean(devCode) || !isPlatformDomain(hostname);

      if (!cancelled) {
        setIsTenantExpected(expectedTenant);
        setIsNotFound(false);
        setIsApiError(false);
      }

      if (!expectedTenant) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAuthContainer().tenantResolutionRepository.resolveTenant({
          code: devCode,
          domain: devCode ? null : hostname,
          page,
        });

        if (!cancelled) {
          if (data && data.tenantId) {
            setTenantId(data.tenantId);
            setBranding(data);
            persistDashboardPreferences(data);
          } else {
            setTenantId(null);
            setBranding(null);
            setIsNotFound(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setTenantId(null);
          setBranding(null);
          // BAM-04 fail-closed: any failed lookup on a tenant domain or explicit `?_tenant=`
          // MUST signal failure and never silently fall back to the platform SSO list.
          setIsApiError(expectedTenant);
          setIsNotFound(isNotFoundError(err));
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
    isTenantExpected,
    isNotFound,
  };
}
