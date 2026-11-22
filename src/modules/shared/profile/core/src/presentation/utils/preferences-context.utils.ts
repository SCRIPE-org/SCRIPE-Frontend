"use client";

import * as PermissionProviderModule from "@core/providers/permission-provider";
import * as TenantContextModule from "@core/providers/tenant-context-provider";
import type { SovereignAccountContext } from "../../domain/entities/SovereignAccountEntities";
import type { LogicalToastPosition } from "../sections/preferences/ToastViewportPreferencesSection";

/** Resolves the browser IANA timezone with safe UTC fallback. */
export function resolveBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Normalizes any legacy toast position string into logical `top-center`, `bottom-center`, `bottom-end`, or `top-end`. */
export function resolveLogicalToastPosition(rawPosition: string | undefined): LogicalToastPosition {
  const normalized = (rawPosition || "top-end").toLowerCase().trim();
  if (normalized === "top-center") return "top-center";
  if (normalized === "bottom-center") return "bottom-center";
  if (
    normalized === "bottom-end" ||
    normalized === "bottom-right" ||
    normalized === "bottom-left" ||
    normalized === "bottom-start"
  ) {
    return "bottom-end";
  }
  return "top-end";
}

/**
 * Safely resolves `useOptionalTenantContext` when exported by `@core/providers/tenant-context-provider`,
 * returning a no-op null hook if a unit test provides a partial module mock.
 */
export function resolveOptionalTenantContextHook(): () => TenantContextModule.TenantContextType | null {
  try {
    const mod = TenantContextModule as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(mod, "useOptionalTenantContext")) {
      const candidate = mod["useOptionalTenantContext"];
      if (typeof candidate === "function") {
        return candidate as () => TenantContextModule.TenantContextType | null;
      }
    }
  } catch {
    /* ignore mocked module inspection errors */
  }
  return () => null;
}

/**
 * Reads `PermissionProvider` status safely without throwing in isolated unit tests
 * that mount views without `<PermissionProvider>`.
 */
export function useSafeOptionalPermissions() {
  try {
    if (typeof PermissionProviderModule.usePermissions === "function") {
      return PermissionProviderModule.usePermissions();
    }
  } catch {
    /* ignore missing PermissionProvider in isolated unit tests */
  }
  return null;
}

/**
 * Resolves human-readable platform or tenant display label for `/account/preferences` scope badges.
 */
export function resolveAccountScopeLabel({
  t,
  isPlatform,
  activeTenantName,
  tenantContextName,
  accountContext,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  isPlatform: boolean;
  activeTenantName: string | null | undefined;
  tenantContextName: string | null | undefined;
  accountContext: SovereignAccountContext | undefined;
}): string {
  if (isPlatform) {
    return t("profile.preferences.startupContextPlatform");
  }
  const organizationFallback = t("chrome.section.organization", { defaultValue: "Organization" });
  const explicit = activeTenantName?.trim();
  const nonFallback =
    explicit && explicit !== organizationFallback && explicit !== "Organization" ? explicit : "";

  return (
    tenantContextName?.trim() ||
    accountContext?.principalContext?.activeTenantName?.trim() ||
    accountContext?.clubAffiliation?.trim() ||
    nonFallback ||
    t("profile.preferences.startupContextTenant")
  );
}
