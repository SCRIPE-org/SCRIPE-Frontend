/**
 * Tenant Context Provider
 *
 * Provides tenant context management for system admins to "enter" a tenant's world
 * and manage resources within that tenant's scope.
 *
 * When in a tenant context, all API calls automatically include the X-Tenant-Context header.
 *
 * @example
 * // Enter a tenant's context
 * const { enterTenantWorld, exitTenantWorld, currentTenant } = useTenantContext();
 * enterTenantWorld({ id: 'tenant-123', name: 'Acme Corp' });
 *
 * // Later, exit the context
 * exitTenantWorld();
 */
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { appLogger } from "../common/logger";
import { clearNavigationCaches } from "@modules/auth/core/data/utils/auth-storage-cleanup";

/**
 * Tenant information for context
 */
export interface TenantInfo {
  id: string;
  name: string;
  parentId?: string;
  hierarchyPath?: string;
}

/**
 * Breadcrumb item for tenant navigation
 */
export interface TenantBreadcrumb {
  id: string;
  name: string;
}

/**
 * Tenant context state and actions
 */
interface TenantContextType {
  /** Current tenant context (null = system level) */
  currentTenant: TenantInfo | null;
  /** Whether we're inside a tenant world */
  isInTenantWorld: boolean;
  /** Breadcrumb trail for navigation */
  breadcrumbs: TenantBreadcrumb[];
  /** Enter a tenant's context */
  enterTenantWorld: (tenant: TenantInfo) => void;
  /** Exit the current tenant context */
  exitTenantWorld: () => void;
  /** Navigate to a specific breadcrumb level */
  navigateToBreadcrumb: (tenantId: string) => void;
  /** Check if user can enter tenant contexts */
  canEnterTenantWorld: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantContextProviderProps {
  children: React.ReactNode;
}

/**
 * TenantContextProvider
 *
 * Wraps the app to provide tenant context management.
 * Must be placed inside PermissionProvider.
 */
export function TenantContextProvider({ children }: TenantContextProviderProps) {
  const { hasPermission } = usePermissions();
  const { apiService } = useServices();
  const queryClient = useQueryClient();

  // Context state — hydrate from sessionStorage on first render
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = sessionStorage.getItem("tenant_context");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id && parsed?.name) return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  });
  const [breadcrumbs, setBreadcrumbs] = useState<TenantBreadcrumb[]>([]);

  // Can enter tenant world if has drill_down permission
  // This is the guard permission for switching tenant context
  const canEnterTenantWorld = useMemo(() => {
    // Must have tenants.drill_down permission to switch context
    return hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN);
  }, [hasPermission]);

  const isInTenantWorld = currentTenant !== null;

  // Sync tenant context with API service on mount
  useEffect(() => {
    if (currentTenant?.id) {
      apiService.setTenantContext(currentTenant.id);
    }
  }, []);

  const enterTenantWorld = useCallback(
    (tenant: TenantInfo) => {
      if (!canEnterTenantWorld) {
        appLogger.warn("User does not have permission to enter tenant world");
        return;
      }

      setCurrentTenant(tenant);
      sessionStorage.setItem("tenant_context", JSON.stringify(tenant));
      // Sync with API Service
      apiService.setTenantContext(tenant.id);

      // CRITICAL: Clear the navigation localStorage cache so that after the
      // full-page redirect below, NavigationProvider mounts fresh and fetches
      // from the backend with the new X-Tenant-Context header.
      // Without this, the sidebar keeps showing platform-only items.
      clearNavigationCaches();

      // Invalidate ALL TanStack Query cache so data refetches with new context.
      queryClient.invalidateQueries();

      setBreadcrumbs((prev) => {
        // Add to breadcrumb trail
        const existingIndex = prev.findIndex((b) => b.id === tenant.id);
        if (existingIndex >= 0) {
          // Already in trail, truncate to this point
          return prev.slice(0, existingIndex + 1);
        }
        return [...prev, { id: tenant.id, name: tenant.name }];
      });

      // Navigate to home so the user sees the tenant's dashboard
      window.location.href = "/";
    },
    [canEnterTenantWorld, apiService, queryClient]
  );

  const exitTenantWorld = useCallback(() => {
    setCurrentTenant(null);
    sessionStorage.removeItem("tenant_context");
    // Sync with API Service
    apiService.setTenantContext(null);
    setBreadcrumbs([]);

    // CRITICAL: Clear the navigation cache so NavigationProvider
    // auto-refreshes and fetches the platform-level menu (no tenant context).
    clearNavigationCaches();

    // Invalidate ALL TanStack Query cache so data refetches without context.
    queryClient.invalidateQueries();

    // Navigate to home — mirrors enterTenantWorld behavior.
    // Without this the user stays on a module page that is now locked (or
    // shows stale tenant data) after the context has been cleared.
    window.location.href = "/";
  }, [apiService, queryClient]);

  const navigateToBreadcrumb = useCallback(
    (tenantId: string) => {
      const index = breadcrumbs.findIndex((b) => b.id === tenantId);
      if (index < 0) return;

      if (index === 0 && breadcrumbs.length === 1) {
        // Clicking on first and only breadcrumb exits tenant world
        exitTenantWorld();
      } else {
        // Truncate breadcrumbs and update current tenant
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        const targetCrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
        setCurrentTenant({
          id: targetCrumb.id,
          name: targetCrumb.name,
        });
        // Sync with API Service
        apiService.setTenantContext(targetCrumb.id);

        // Invalidate queries for new tenant context
        queryClient.invalidateQueries();
      }
    },
    [breadcrumbs, exitTenantWorld, apiService, queryClient]
  );

  const value = useMemo(
    () => ({
      currentTenant,
      isInTenantWorld,
      breadcrumbs,
      enterTenantWorld,
      exitTenantWorld,
      navigateToBreadcrumb,
      canEnterTenantWorld,
    }),
    [
      currentTenant,
      isInTenantWorld,
      breadcrumbs,
      enterTenantWorld,
      exitTenantWorld,
      navigateToBreadcrumb,
      canEnterTenantWorld,
    ]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

/**
 * useTenantContext Hook
 *
 * Access the tenant context for managing tenant world entry/exit.
 *
 * @example
 * const { enterTenantWorld, isInTenantWorld, currentTenant } = useTenantContext();
 *
 * if (!isInTenantWorld && canEnterTenantWorld) {
 *   enterTenantWorld({ id: 'abc', name: 'Tenant ABC' });
 * }
 */
export function useTenantContext(): TenantContextType {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error("useTenantContext must be used within a TenantContextProvider");
  }

  return context;
}

/**
 * Get the current tenant context ID for API calls
 * Returns null if not in tenant world
 */
export function useCurrentTenantId(): string | null {
  const context = useContext(TenantContext);
  return context?.currentTenant?.id ?? null;
}
