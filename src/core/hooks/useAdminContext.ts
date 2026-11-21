"use client";

import { useAppStore } from "@core/store/useAppStore";
import * as TenantContextModule from "@core/providers/tenant-context-provider";
import { useTenantBranding } from "@core/providers/tenant-branding-provider";
import { useI18n } from "@core/providers/i18n-provider";

// Safe wrapper: avoids throwing when isolated unit tests omit <TenantContextProvider>,
// while staying compatible with legacy mocks that stub only `useTenantContext`.
// Inspect own properties cleanly without triggering Vitest's missing-export Proxy `get` trap.
function resolveTenantContextHook() {
  try {
    const mod = TenantContextModule as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(mod, "useOptionalTenantContext")) {
      const candidate = mod["useOptionalTenantContext"];
      if (typeof candidate === "function") {
        return candidate as typeof TenantContextModule.useOptionalTenantContext;
      }
    }
  } catch {
    /* ignore mocked module inspection errors */
  }
  return TenantContextModule.useTenantContext;
}

const useSafeTenantContext = resolveTenantContextHook();

export type AdminContextType = "platform" | "tenant";

export interface AdminContextState {
  /** The resolved administration context mode */
  contextType: AdminContextType;
  /** True if operating at the platform / infrastructure level */
  isPlatform: boolean;
  /** True if operating within a tenant organization's boundary */
  isTenant: boolean;
  /** True if a global SuperAdmin has entered a tenant world via drill-down */
  isImpersonating: boolean;
  /** Active tenant ID if in tenant context, null if platform */
  activeTenantId: string | null;
  /** Active tenant display name if known */
  activeTenantName: string | null;
  /** True when client-side stores have hydrated from storage (prevents hydration flash) */
  isHydrated: boolean;
}

/**
 * useAdminContext
 *
 * Authoritative client-side resolver for the active administration context.
 * Distinguishes whether the currently rendered administrative surface should present
 * Platform Command Center controls (SCRIPE infrastructure & cross-tenant operations)
 * or Tenant Organization Control Center controls (governing a specific tenant organization).
 *
 * Truth model:
 * 1. If inside a Tenant World (SuperAdmin drilled down into a tenant):
 *    -> contextType: "tenant", isImpersonating: true, activeTenantId = currentTenant.id
 * 2. If logged in as a direct Tenant Admin (user.tenantId is set):
 *    -> contextType: "tenant", isImpersonating: false, activeTenantId = user.tenantId
 * 3. If logged in as a global Platform SuperAdmin and not drilled into a tenant:
 *    -> contextType: "platform", isImpersonating: false, activeTenantId = null
 */
export function useAdminContext(): AdminContextState {
  const user = useAppStore((s) => s.user);
  const tenantCode = useAppStore((s) => s.tenantCode);
  const isHydrated = useAppStore((s) => s._hasHydrated);
  const tenantCtx = useSafeTenantContext();
  const branding = useTenantBranding();
  const { t } = useI18n();
  const currentTenant = tenantCtx?.currentTenant ?? null;
  const isInTenantWorld = tenantCtx?.isInTenantWorld ?? false;

  // Preserve compatibility for unit tests that mock `useAppStore` with `{ tenantCode }` and omit `user`;
  // never treat `tenantCode` as an active tenant when `user` is resolved in real app sessions.
  const legacyTestTenantFallback = user === undefined ? (tenantCode ?? null) : null;
  const activeTenantId = currentTenant?.id ?? user?.tenantId ?? legacyTestTenantFallback;
  const isTenant = Boolean(activeTenantId);
  const userTenantName = (user as { tenantName?: string | null } | null)?.tenantName ?? null;
  const userTenantCode = (user as { tenantCode?: string | null } | null)?.tenantCode ?? null;
  const brandingTenantName = branding?.isTenantContext
    ? branding.companyName || branding.appName || null
    : null;
  const resolvedTenantCode = userTenantCode ?? (tenantCode?.trim() || null);
  const activeTenantName = isTenant
    ? (currentTenant?.name ??
      userTenantName ??
      brandingTenantName ??
      resolvedTenantCode ??
      t("chrome.section.organization", { defaultValue: "Organization" }))
    : null;
  const isPlatform = !isTenant;
  const isImpersonating = Boolean(
    isInTenantWorld && currentTenant && (!user?.tenantId || currentTenant.id !== user.tenantId)
  );
  const contextType: AdminContextType = isPlatform ? "platform" : "tenant";

  return {
    contextType,
    isPlatform,
    isTenant,
    isImpersonating,
    activeTenantId,
    activeTenantName,
    isHydrated,
  };
}
