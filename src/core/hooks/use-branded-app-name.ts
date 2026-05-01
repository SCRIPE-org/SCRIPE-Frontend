"use client";

/**
 * useBrandedAppName — Returns the tenant-branded app name,
 * or falls back to the platform name from translations.
 *
 * Use this hook in ALL layout components that display the app name
 * instead of `t("app.title")`.
 */

import { useTenantBranding } from "@core/providers/tenant-branding-provider";

export function useBrandedAppName(): string {
  const { appName } = useTenantBranding();
  return appName;
}
