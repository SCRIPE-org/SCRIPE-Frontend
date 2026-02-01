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

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { usePermissions } from "@core/providers/permission-provider";

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
      const { isSuperAdmin, hasPermission } = usePermissions();
      const roles = useAppStore((state) => state.roles);

      // Get user's primary tenant ID from their roles (if any)
      const userTenantId = roles.find((r) => r.tenantId)?.tenantId ?? null;

      // Context state
      const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(null);
      const [breadcrumbs, setBreadcrumbs] = useState<TenantBreadcrumb[]>([]);

      // Can enter tenant world if system admin (no tenant) or has super_admin role
      const canEnterTenantWorld = useMemo(() => {
            // System admin (no tenant assigned) or super admin can enter tenant contexts
            return !userTenantId || isSuperAdmin || hasPermission("tenants.manage");
      }, [userTenantId, isSuperAdmin, hasPermission]);

      const isInTenantWorld = currentTenant !== null;

      const enterTenantWorld = useCallback((tenant: TenantInfo) => {
            if (!canEnterTenantWorld) {
                  console.warn("User does not have permission to enter tenant world");
                  return;
            }

            setCurrentTenant(tenant);
            setBreadcrumbs((prev) => {
                  // Add to breadcrumb trail
                  const existingIndex = prev.findIndex((b) => b.id === tenant.id);
                  if (existingIndex >= 0) {
                        // Already in trail, truncate to this point
                        return prev.slice(0, existingIndex + 1);
                  }
                  return [...prev, { id: tenant.id, name: tenant.name }];
            });
      }, [canEnterTenantWorld]);

      const exitTenantWorld = useCallback(() => {
            setCurrentTenant(null);
            setBreadcrumbs([]);
      }, []);

      const navigateToBreadcrumb = useCallback((tenantId: string) => {
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
            }
      }, [breadcrumbs, exitTenantWorld]);

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

      return (
            <TenantContext.Provider value={value}>
                  {children}
            </TenantContext.Provider>
      );
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
