/**
 * Tenant Context Provider
 *
 * Provides tenant context management for system admins to "enter" a tenant's world
 * and manage resources within that tenant's scope, or for multi-tenant members to
 * switch active membership context.
 *
 * When in a tenant context, all API calls automatically include the X-Tenant-Context header
 * via broadcast across every module ApiService instance.
 */
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServices } from "@core/providers/service-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { broadcastTenantContext } from "@core/services/api-factory";
import { appLogger } from "../common/logger";
import { clearNavigationCaches } from "@modules/auth/core/data/utils/auth-storage-cleanup";

const TENANT_BREADCRUMBS_STORAGE_KEY = "scr_tenant_breadcrumbs";
const EMPTY_BREADCRUMBS: TenantBreadcrumb[] = [];

/**
 * Tenant information for context
 */
export interface TenantInfo {
  id: string;
  name: string;
  code?: string | null;
  slug?: string | null;
  parentId?: string | null;
  hierarchyPath?: string;
  switchMode?: "drill_down" | "membership";
}

/**
 * Breadcrumb item for tenant navigation
 */
export interface TenantBreadcrumb {
  id: string;
  name: string;
}

/**
 * Options controlling context switching navigation and authorization mode.
 */
export interface TenantSwitchOptions {
  /** Target URL after switch. Pass null to skip browser navigation (in-memory only). */
  redirectTo?: string | null;
  /** Authorization mechanism: drill-down ("tenants.drill_down") or membership ("identity_context.switch"). */
  mode?: "drill_down" | "membership";
}

/**
 * Tenant context state and actions
 */
export interface TenantContextType {
  /** Current tenant context (null = system level) */
  currentTenant: TenantInfo | null;
  /** Whether we're inside a tenant world */
  isInTenantWorld: boolean;
  /** Breadcrumb trail for navigation */
  breadcrumbs: TenantBreadcrumb[];
  /** Enter a tenant's context */
  enterTenantWorld: (tenant: TenantInfo, options?: TenantSwitchOptions) => void;
  /** Exit the current tenant context */
  exitTenantWorld: (options?: Pick<TenantSwitchOptions, "redirectTo">) => void;
  /** Navigate to a specific breadcrumb level */
  navigateToBreadcrumb: (tenantId: string, options?: Pick<TenantSwitchOptions, "redirectTo">) => void;
  /** Check if user can enter tenant contexts via drill-down */
  canEnterTenantWorld: boolean;
  /** Check if user can switch tenant contexts via membership */
  canSwitchMembership?: boolean;
  /** Check if user can switch tenant contexts via either mechanism */
  canSwitchContext?: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantContextProviderProps {
  children: React.ReactNode;
}

function readStoredTenant(): TenantInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEYS.tenant_context);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<TenantInfo> | null;
      if (parsed?.id && parsed?.name) {
        return {
          id: parsed.id,
          name: parsed.name,
          code: parsed.code ?? undefined,
          slug: parsed.slug ?? undefined,
          parentId: parsed.parentId ?? undefined,
          hierarchyPath: parsed.hierarchyPath ?? undefined,
          switchMode: parsed.switchMode,
        };
      }
    }
  } catch {
    /* ignore invalid sessionStorage JSON */
  }
  return null;
}

function readStoredBreadcrumbs(fallbackTenant: TenantInfo | null): TenantBreadcrumb[] {
  if (typeof window !== "undefined") {
    try {
      const saved = sessionStorage.getItem(TENANT_BREADCRUMBS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (b): b is TenantBreadcrumb =>
              Boolean(b && typeof b.id === "string" && typeof b.name === "string")
          );
          if (valid.length > 0) return valid;
        }
      }
    } catch {
      /* ignore invalid sessionStorage JSON */
    }
  }
  return fallbackTenant ? [{ id: fallbackTenant.id, name: fallbackTenant.name }] : [];
}

function getCurrentBrowserPath(): string {
  if (typeof window === "undefined") return "/";
  const path = window.location.pathname || "/";
  const search = window.location.search || "";
  return `${path}${search}`;
}

function navigateAfterSwitch(targetUrl: string | null | undefined, defaultUrl: string): void {
  if (targetUrl === null || typeof window === "undefined") return;
  const destination = targetUrl ?? defaultUrl;
  if (!destination) return;
  try {
    const current = getCurrentBrowserPath();
    if (destination === current && window.location.hash) {
      window.location.reload();
    } else {
      window.location.href = destination;
    }
  } catch {
    /* ignore jsdom navigation errors */
  }
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
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);

  // Context state — hydrate from sessionStorage on first render
  const [storedTenant, setCurrentTenant] = useState<TenantInfo | null>(() => readStoredTenant());
  const [storedBreadcrumbs, setBreadcrumbs] = useState<TenantBreadcrumb[]>(() =>
    readStoredBreadcrumbs(readStoredTenant())
  );

  // Drill-down requires tenants.drill_down; membership switching requires identity_context.switch
  const canEnterTenantWorld = useMemo(
    () => hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN),
    [hasPermission]
  );
  const canSwitchMembership = useMemo(
    () => hasPermission(SYSTEM_PERMISSIONS.IDENTITY_CONTEXT_SWITCH),
    [hasPermission]
  );
  const canSwitchContext = canEnterTenantWorld || canSwitchMembership;

  const isStoredTenantPermitted = useMemo(() => {
    if (!storedTenant) return true;
    const mode = storedTenant.switchMode ?? "drill_down";
    return mode === "membership"
      ? canSwitchMembership || canEnterTenantWorld
      : canEnterTenantWorld;
  }, [storedTenant, canSwitchMembership, canEnterTenantWorld]);

  const currentTenant =
    hasHydrated && isAuthenticated && storedTenant !== null && !isStoredTenantPermitted
      ? null
      : storedTenant;
  const breadcrumbs = currentTenant ? storedBreadcrumbs : EMPTY_BREADCRUMBS;

  const isInTenantWorld = currentTenant !== null;
  const currentTenantId = currentTenant?.id ?? null;

  // Synchronize external storage, caches, and internal state in effect when stale context lacks permissions
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    const stored = readStoredTenant();
    const active = storedTenant ?? stored;
    if (!active) return;

    const mode = active.switchMode ?? "drill_down";
    const isPermitted =
      mode === "membership" ? canSwitchMembership || canEnterTenantWorld : canEnterTenantWorld;

    if (!isPermitted) {
      appLogger.warn(
        "[TenantContextProvider] Clearing stale tenant_context because user lacks required switch permission"
      );
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
        sessionStorage.removeItem(TENANT_BREADCRUMBS_STORAGE_KEY);
      }
      apiService.setTenantContext(null);
      broadcastTenantContext(null);
      clearNavigationCaches();
      useNavigationStore.getState().reset();
      queryClient.invalidateQueries();

      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setCurrentTenant(null);
        setBreadcrumbs([]);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [
    hasHydrated,
    isAuthenticated,
    storedTenant,
    canEnterTenantWorld,
    canSwitchMembership,
    apiService,
    queryClient,
  ]);

  // Sync tenant context with base + all module ApiService instances
  useEffect(() => {
    apiService.setTenantContext(currentTenantId);
    broadcastTenantContext(currentTenantId);
  }, [currentTenantId, apiService]);

  const applyTenantState = useCallback(
    (
      tenant: TenantInfo | null,
      nextBreadcrumbs: TenantBreadcrumb[],
      options?: { redirectTo?: string | null; defaultRedirect?: string }
    ) => {
      setCurrentTenant(tenant);
      setBreadcrumbs(nextBreadcrumbs);

      if (typeof window !== "undefined") {
        if (tenant) {
          sessionStorage.setItem(STORAGE_KEYS.tenant_context, JSON.stringify(tenant));
          sessionStorage.setItem(TENANT_BREADCRUMBS_STORAGE_KEY, JSON.stringify(nextBreadcrumbs));
        } else {
          sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
          sessionStorage.removeItem(TENANT_BREADCRUMBS_STORAGE_KEY);
        }
      }

      const nextId = tenant?.id ?? null;
      apiService.setTenantContext(nextId);
      broadcastTenantContext(nextId);

      clearNavigationCaches();
      useNavigationStore.getState().reset();
      queryClient.invalidateQueries();

      navigateAfterSwitch(options?.redirectTo, options?.defaultRedirect ?? "/");
    },
    [apiService, queryClient]
  );

  const enterTenantWorld = useCallback(
    (tenant: TenantInfo, options?: TenantSwitchOptions) => {
      const mode = options?.mode ?? tenant.switchMode ?? "drill_down";
      const isAllowed =
        mode === "membership" ? canSwitchMembership || canEnterTenantWorld : canEnterTenantWorld;

      if (!isAllowed) {
        appLogger.warn("User does not have permission to enter tenant world");
        return;
      }

      const normalizedTenant: TenantInfo = {
        ...tenant,
        switchMode: mode,
      };

      const nextBreadcrumbs: TenantBreadcrumb[] = (() => {
        if (mode === "membership") {
          return [{ id: normalizedTenant.id, name: normalizedTenant.name }];
        }
        const existingIndex = breadcrumbs.findIndex((b) => b.id === normalizedTenant.id);
        if (existingIndex >= 0) {
          return breadcrumbs.slice(0, existingIndex + 1);
        }
        return [...breadcrumbs, { id: normalizedTenant.id, name: normalizedTenant.name }];
      })();

      applyTenantState(normalizedTenant, nextBreadcrumbs, {
        redirectTo: options?.redirectTo,
        defaultRedirect: "/",
      });
    },
    [canEnterTenantWorld, canSwitchMembership, breadcrumbs, applyTenantState]
  );

  const exitTenantWorld = useCallback(
    (options?: Pick<TenantSwitchOptions, "redirectTo">) => {
      applyTenantState(null, [], {
        redirectTo: options?.redirectTo,
        defaultRedirect: "/",
      });
    },
    [applyTenantState]
  );

  const navigateToBreadcrumb = useCallback(
    (tenantId: string, options?: Pick<TenantSwitchOptions, "redirectTo">) => {
      const index = breadcrumbs.findIndex((b) => b.id === tenantId);
      if (index < 0) return;

      if (index === 0 && breadcrumbs.length === 1) {
        exitTenantWorld(options);
        return;
      }

      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      const targetCrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
      const nextTenant: TenantInfo = {
        id: targetCrumb.id,
        name: targetCrumb.name,
        switchMode: currentTenant?.switchMode ?? "drill_down",
      };

      applyTenantState(nextTenant, newBreadcrumbs, {
        redirectTo: options?.redirectTo,
        defaultRedirect: getCurrentBrowserPath(),
      });
    },
    [breadcrumbs, exitTenantWorld, currentTenant, applyTenantState]
  );

  const value = useMemo<TenantContextType>(
    () => ({
      currentTenant,
      isInTenantWorld,
      breadcrumbs,
      enterTenantWorld,
      exitTenantWorld,
      navigateToBreadcrumb,
      canEnterTenantWorld,
      canSwitchMembership,
      canSwitchContext,
    }),
    [
      currentTenant,
      isInTenantWorld,
      breadcrumbs,
      enterTenantWorld,
      exitTenantWorld,
      navigateToBreadcrumb,
      canEnterTenantWorld,
      canSwitchMembership,
      canSwitchContext,
    ]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

/**
 * useTenantContext Hook
 *
 * Access the tenant context for managing tenant world entry/exit.
 */
export function useTenantContext(): TenantContextType {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error("useTenantContext must be used within a TenantContextProvider");
  }

  return context;
}

/**
 * Safe variant of useTenantContext for shared UI components that may render
 * inside unit tests or standalone error fallbacks without TenantContextProvider.
 */
export function useOptionalTenantContext(): TenantContextType | null {
  return useContext(TenantContext) ?? null;
}

/**
 * Get the current tenant context ID for API calls
 * Returns null if not in tenant world
 */
export function useCurrentTenantId(): string | null {
  const context = useContext(TenantContext);
  return context?.currentTenant?.id ?? null;
}
