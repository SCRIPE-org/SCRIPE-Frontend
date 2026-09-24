"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";

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
  const isHydrated = useAppStore((s) => s._hasHydrated);
  const { currentTenant, isInTenantWorld } = useTenantContext();

  const activeTenantId = currentTenant?.id ?? user?.tenantId ?? null;
  const activeTenantName = currentTenant?.name ?? (user?.tenantId ? "Organization" : null);
  const isTenant = Boolean(activeTenantId);
  const isPlatform = !isTenant;
  const isImpersonating = Boolean(isInTenantWorld && currentTenant && !user?.tenantId);
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
