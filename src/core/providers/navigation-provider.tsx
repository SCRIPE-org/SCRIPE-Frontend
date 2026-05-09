"use client";

/**
 * NavigationProvider — Thin TanStack Query Orchestrator (v2)
 *
 * Responsibilities (v2 — dramatically simplified):
 *  1. On login: fire GET /Menus/my/routes → seeds useNavigationStore.allRoutes (eager)
 *  2. On login: fire GET /Menus/my → seeds useNavigationStore.defaultWorkspace + groups
 *  3. Expose fetchWorkspaceMenu(key) → fires GET /Menus/my?workspace={key} (JIT)
 *  4. Listen for impersonation/tenant changes → store.reset() + queryClient.invalidate
 *
 * What this provider does NOT do (v2):
 *  ❌ Maintain its own React state for navigation data (Zustand store handles this)
 *  ❌ Read/write localStorage manually (Zustand persist handles this)
 *  ❌ Implement hasPageAccess (store.hasRouteAccess() handles this)
 *  ❌ Manage jitRoutes / jitMenus (store.workspaces Map handles this)
 *
 * Context API surface is intentionally minimal — most consumers should read
 * from useNavigationStore directly rather than through this context.
 *
 * Performance (v2.1):
 *  All WRITE operations use useNavigationStore.getState() directly — this avoids
 *  subscribing to the full Zustand snapshot, which would cause the provider to
 *  re-render on every unrelated store change (activeRootItemId, isWorkspaceSwitching…).
 *  Only the two slices that drive the legacy context value (isInitialLoading,
 *  defaultWorkspace) use granular Zustand selectors.
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import type React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { authBroadcast } from "@core/common/broadcast-auth";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { appLogger } from "@core/common/logger";

import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import type { MenuItemActions } from "@core/navigation/domain/entities/MenuItem";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { CACHE_EXPIRY } from "@core/config/storage-keys";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const NAV_QUERY_KEYS = {
  routes: (contextKey: string) => ["navigation", "routes", contextKey] as const,
  defaultWorkspace: (contextKey: string) => ["navigation", "default", contextKey] as const,
  workspace: (key: string, contextKey: string) => ["navigation", "workspace", key, contextKey] as const,
};

// ── Context (minimal surface) ───────────────────────────────────────────────
interface NavigationContextType {
  /**
   * Fetch (or return cached) JIT workspace menu.
   * Returns null on failure — caller should handle gracefully.
   */
  fetchWorkspaceMenu: (workspaceKey: string) => Promise<NavigationData | null>;
  /** Force re-fetch of default workspace + routes (e.g. after settings change) */
  refreshNavigation: () => Promise<void>;
  // ── Legacy compat — delegates to store ─────────────────────────────
  /** @deprecated Use useNavigationStore().hasRouteAccess() directly */
  hasPageAccess: (pathname: string) => boolean;
  /** @deprecated Use useNavigationStore().getPageActions() directly */
  getPageActions: (pathname: string) => MenuItemActions | null;
  /** @deprecated Use Array.from(useNavigationStore().allRoutes) directly */
  getRoutes: () => string[];
  /** @deprecated Use useNavigationStore().defaultWorkspace directly */
  navigationData: NavigationData | null;
  isLoading: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────────────────
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { navigationRepository } = useServices();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const { currentTenant } = useTenantContext();
  const tenantId = currentTenant?.id ?? null;
  const queryClient = useQueryClient();

  // ── Granular selectors — only the two slices we need in the render path ───
  // All WRITE operations use getState() so this provider doesn't subscribe to
  // the full store snapshot and re-render on unrelated state changes.
  const isInitialLoading = useNavigationStore((s) => s.isInitialLoading);
  const defaultWorkspace  = useNavigationStore((s) => s.defaultWorkspace);
  // Read persisted contextKey exactly once — used in the one-time guard effect.
  const persistedContextKey = useNavigationStore((s) => s.contextKey);

  // ── Context key — identifies this user+tenant combination ─────────────────
  const userId = useAppStore((s) => s.user?.id ?? "");
  const contextKey = `${tenantId ?? "platform"}:${userId}`;

  const isReady = hasHydrated && isAuthenticated;

  // ── Cross-context cache invalidation guard ────────────────────────────────
  // If the rehydrated store was for a different user/tenant, reset it first.
  const guardedOnce = useRef(false);
  useEffect(() => {
    if (!isReady || guardedOnce.current) return;
    guardedOnce.current = true;

    if (persistedContextKey && persistedContextKey !== contextKey) {
      appLogger.auth(`[NavigationProvider] Context mismatch (${persistedContextKey} ≠ ${contextKey}) — resetting store`);
      useNavigationStore.getState().reset();
    }
  // persistedContextKey is read once at guard time — after that guardedOnce prevents re-runs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, contextKey]);

  // ── Query 1: Eager routes load ────────────────────────────────────────────
  useQuery({
    queryKey: NAV_QUERY_KEYS.routes(contextKey),
    queryFn: async () => {
      const { routes, workspaceRouteMap } = await navigationRepository.fetchRoutes();
      useNavigationStore.getState().initializeRoutes(routes, workspaceRouteMap, contextKey);
      return { routes, workspaceRouteMap };
    },
    enabled: isReady,
    staleTime: CACHE_EXPIRY.NAVIGATION,
    gcTime: CACHE_EXPIRY.NAVIGATION * 2,
    retry: 2,
  });

  // ── Query 2: Default workspace menu + groups ──────────────────────────────
  useQuery({
    queryKey: NAV_QUERY_KEYS.defaultWorkspace(contextKey),
    queryFn: async () => {
      const data = await navigationRepository.fetchDefaultWorkspace();
      const groups = (data.workspaceGroups ?? []).map(
        (g) => new WorkspaceGroup(g)
      );
      useNavigationStore.getState().initializeDefaultWorkspace(data, groups);
      return data;
    },
    enabled: isReady,
    staleTime: CACHE_EXPIRY.NAVIGATION,
    gcTime: CACHE_EXPIRY.NAVIGATION * 2,
    retry: 2,
  });

  // ── Mutation: JIT workspace fetch ─────────────────────────────────────────
  const workspaceMutation = useMutation({
    mutationFn: async (workspaceKey: string) => {
      // Always read from live state to avoid stale closure cache hits
      const s = useNavigationStore.getState();
      // Return cached data from store if already loaded
      if (s.hasWorkspaceData(workspaceKey)) {
        return s.workspaces.get(workspaceKey)!;
      }

      useNavigationStore.getState().setIsWorkspaceSwitching(true);
      try {
        const data = await navigationRepository.fetchWorkspaceMenu(workspaceKey);
        useNavigationStore.getState().setWorkspaceData(workspaceKey, data);
        // Seed TanStack Query cache too — so it knows this is fresh
        queryClient.setQueryData(
          NAV_QUERY_KEYS.workspace(workspaceKey, contextKey),
          data
        );
        return data;
      } finally {
        useNavigationStore.getState().setIsWorkspaceSwitching(false);
      }
    },
  });

  const fetchWorkspaceMenu = useCallback(
    async (workspaceKey: string): Promise<NavigationData | null> => {
      try {
        return await workspaceMutation.mutateAsync(workspaceKey);
      } catch (err) {
        appLogger.error("[NavigationProvider] JIT workspace fetch failed:", err);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextKey]
  );

  const refreshNavigation = useCallback(async () => {
    useNavigationStore.getState().reset();
    await queryClient.invalidateQueries({ queryKey: ["navigation"] });
  }, [queryClient]);

  // ── Impersonation listener ─────────────────────────────────────────────────
  // Note: authBroadcast is a singleton with no unsubscribe API — this is intentional.
  // The handler is registered once and lives for the lifetime of the app.
  const impersonationListenerRegistered = useRef(false);
  useEffect(() => {
    if (impersonationListenerRegistered.current) return;
    impersonationListenerRegistered.current = true;

    authBroadcast.onImpersonation(async () => {
      appLogger.auth("[NavigationProvider] Impersonation event — resetting navigation");
      useNavigationStore.getState().reset();
      await queryClient.invalidateQueries({ queryKey: ["navigation"] });
    });
    // authBroadcast is a singleton — no cleanup needed (matches pattern in useImpersonation.ts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  // When tenant context changes, reset and refetch
  const prevTenantRef = useRef<string | null | undefined>("__initial__");
  useEffect(() => {
    if (prevTenantRef.current === "__initial__") {
      prevTenantRef.current = tenantId;
      return;
    }
    if (prevTenantRef.current !== tenantId) {
      prevTenantRef.current = tenantId;
      appLogger.auth(`[NavigationProvider] Tenant changed (${prevTenantRef.current} → ${tenantId}) — resetting navigation`);
      useNavigationStore.getState().reset();
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
    }
  }, [tenantId, queryClient]);

  // ── Context value (backwards-compat delegation to store) ─────────────────
  // isInitialLoading + defaultWorkspace come from granular selectors above.
  // All method calls go through getState() to stay decoupled from the render cycle.
  const value = useMemo<NavigationContextType>(() => ({
    fetchWorkspaceMenu,
    refreshNavigation,
    // Legacy compat — reads always go via getState() so no stale closure risk
    hasPageAccess: (pathname) => useNavigationStore.getState().hasRouteAccess(pathname),
    getPageActions: (pathname) => useNavigationStore.getState().getPageActions(pathname),
    getRoutes: () => Array.from(useNavigationStore.getState().allRoutes),
    navigationData: defaultWorkspace,
    isLoading: isInitialLoading,
  }), [fetchWorkspaceMenu, refreshNavigation, defaultWorkspace, isInitialLoading]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useNavigation(): NavigationContextType {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return ctx;
}
