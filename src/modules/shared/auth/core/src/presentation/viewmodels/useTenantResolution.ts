"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { getAuthContainer } from "@modules/auth/di";
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

const DEV_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"];

/**
 * Detect whether the current hostname is the platform domain.
 *
 * Platform domain → skip tenant resolution API call.
 * Tenant subdomain (e.g. ahly.localhost or seif.admin.scripe.org) → must resolve.
 *
 * Detection sources (in order):
 *  1. Bare dev domains (localhost, 127.0.0.1, 0.0.0.0, [::1]) — NOT *.localhost subdomains!
 *  2. NEXT_PUBLIC_APP_URL environment variable (e.g. https://admin.scripe.org)
 *
 * Uses `process.env.NEXT_PUBLIC_APP_URL` directly — Next.js inlines
 * NEXT_PUBLIC_* values at build time, which is more reliable than
 * importing the `env` module in client components.
 */
export function isPlatformDomain(hostname: string): boolean {
  const normalized = hostname.toLowerCase().trim();
  // 1. Bare dev domains — always platform (*.localhost is a tenant subdomain, NOT platform)
  if (DEV_DOMAINS.includes(normalized)) return true;

  // 2. Production: compare against NEXT_PUBLIC_APP_URL
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();
  if (appUrl) {
    try {
      const platformHost = new URL(appUrl).hostname.toLowerCase();
      if (normalized === platformHost) return true;
    } catch {
      // Invalid URL — fall through
    }
  }

  return false;
}

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
