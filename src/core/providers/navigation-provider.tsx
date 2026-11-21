"use client";

/**
 * NavigationProvider — Thin TanStack Query Orchestrator (v2)
 *
 * Responsibilities (v2 — dramatically simplified):
 *  1. On login: fire GET /menus/navigation/routes → seeds useNavigationStore.allRoutes (eager)
 *  2. On login: fire GET /menus/navigation → seeds useNavigationStore.defaultWorkspace + groups
 *  3. Expose fetchWorkspaceMenu(key) → fires GET /menus/navigation?workspace={key} (JIT)
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
  useState,
} from "react";
import type React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { authBroadcast } from "@core/common/broadcast-auth";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { appLogger } from "@core/common/logger";
import { secureTokenService } from "@core/common/secure-token-service";
import { extractEligibleDeepLink } from "@core/common/redirect-safety";
import { normalizeRoutePath } from "@core/config/app-route-manifest";

import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import type { MenuItemActions } from "@core/navigation/domain/entities/MenuItem";
import { CACHE_EXPIRY } from "@core/config/storage-keys";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const NAV_QUERY_KEYS = {
  bootstrap: (contextKey: string) => ["navigation", "bootstrap", contextKey] as const,
  workspace: (key: string, contextKey: string) =>
    ["navigation", "workspace", key, contextKey] as const,
};

const BOOTSTRAP_REDIRECT_PATHNAMES = new Set([
  "/",
  "/login",
  "/magic-link",
  "/qr-approve",
  "/sso/callback",
  "/sso/saml/callback",
  "/change-password",
]);

/**
 * True when an error represents a transient network or 5xx/408 server error
 * that is safe to retry. Never retries 401/403 authorization or 429 rate-limit failures.
 */
export function isTransientHttpError(err: unknown): boolean {
  if (!err || typeof err !== "object") return true;
  const record = err as Record<string, unknown>;
  const details =
    record.details && typeof record.details === "object"
      ? (record.details as Record<string, unknown>)
      : null;
  const response =
    record.response && typeof record.response === "object"
      ? (record.response as Record<string, unknown>)
      : null;

  const status =
    (typeof record.statusCode === "number" ? record.statusCode : undefined) ??
    (typeof record.status === "number" ? record.status : undefined) ??
    (typeof details?.statusCode === "number" ? details.statusCode : undefined) ??
    (typeof response?.status === "number" ? response.status : undefined);

  if (typeof status !== "number") return true;
  if (status === 401 || status === 403 || status === 429) return false;
  if (status >= 400 && status < 500 && status !== 408) return false;
  return true;
}

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
  const { activeTenantId } = useAdminContext();
  const tenantId = activeTenantId;
  const queryClient = useQueryClient();

  // ── Granular selectors — only the two slices we need in the render path ───
  // All WRITE operations use getState() so this provider doesn't subscribe to
  // the full store snapshot and re-render on unrelated state changes.
  const isInitialLoading = useNavigationStore((s) => s.isInitialLoading);
  const defaultWorkspace = useNavigationStore((s) => s.defaultWorkspace);
  // Read persisted contextKey exactly once — used in the one-time guard effect.
  const persistedContextKey = useNavigationStore((s) => s.routesContextKey || s.contextKey);

  // ── Context key — identifies this user+tenant combination ─────────────────
  // MUST be username, not user.id: id is IIdEncryptionService.Encrypt(guid),
  // which is randomized-IV AEAD ciphertext — a fresh, different string on
  // every /auth/admin/principal response for the SAME underlying admin. Keying the nav
  // queries (and the store's own persisted contextKey guard above) off a
  // value that never repeats for "the same user" means the eager routes/
  // default-workspace queries restart under a brand new cache key on every
  // user-object refresh instead of ever settling — DashboardLayout's
  // isNavReady gate then waits forever and the welcome loader never clears.
  // username is stable and unique per admin; tenantId is the raw JWT claim,
  // not encrypted, so it doesn't have this problem.
  const userId = useAppStore((s) => s.user?.username ?? "");
  const contextKey = `${tenantId ?? "platform"}:${userId}`;

  // Track token availability to coordinate with silent refresh
  const [hasToken, setHasToken] = useState(() => secureTokenService.hasToken());

  useEffect(() => {
    const unsubscribe = secureTokenService.subscribe(() => {
      setHasToken(secureTokenService.hasToken());
    });
    return unsubscribe;
  }, []);

  const isReady = hasHydrated && isAuthenticated && hasToken;

  // ── Cross-context cache invalidation guard ────────────────────────────────
  // If the rehydrated store was for a different user/tenant, reset it first.
  const guardedOnce = useRef(false);
  const autoFetchDone = useRef(false);

  useEffect(() => {
    if (!isReady || guardedOnce.current) return;
    guardedOnce.current = true;

    if (persistedContextKey && persistedContextKey !== contextKey) {
      appLogger.auth(
        `[NavigationProvider] Context mismatch (${persistedContextKey} ≠ ${contextKey}) — resetting store`
      );
      useNavigationStore.getState().clearRouteData();
      useNavigationStore.getState().reset();
      autoFetchDone.current = false; // Allow auto-fetch to fire for the new context
    }
    // persistedContextKey is read once at guard time — after that guardedOnce prevents re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, contextKey]);

  // ── Single-Pass Bootstrap Query (routes + descriptors + groups + target tree + landing) ──
  useQuery({
    queryKey: NAV_QUERY_KEYS.bootstrap(contextKey),
    queryFn: async () => {
      try {
        const pathname =
          typeof window !== "undefined"
            ? normalizeRoutePath(window.location.pathname).toLowerCase()
            : "";
        const redirectParam =
          typeof window !== "undefined" && BOOTSTRAP_REDIRECT_PATHNAMES.has(pathname)
            ? extractEligibleDeepLink(
                new URLSearchParams(window.location.search).get("redirect")
              )
            : null;
        const result = await navigationRepository.fetchNavigationBootstrap(redirectParam);
        useNavigationStore.getState().initializeBootstrap(result, contextKey);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load navigation";
        useNavigationStore.getState().setRoutesError(message, contextKey);
        throw err;
      }
    },
    enabled: isReady,
    staleTime: CACHE_EXPIRY.NAVIGATION,
    gcTime: CACHE_EXPIRY.NAVIGATION * 2,
    retry: (failureCount, err) => failureCount < 2 && isTransientHttpError(err),
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
        queryClient.setQueryData(NAV_QUERY_KEYS.workspace(workspaceKey, contextKey), data);
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
    useNavigationStore.getState().clearRouteData();
    useNavigationStore.getState().reset();
    autoFetchDone.current = false; // Allow auto-fetch to fire after full refresh
    await queryClient.invalidateQueries({ queryKey: ["navigation"] });
  }, [queryClient]);

  // ── Impersonation listener ─────────────────────────────────────────────────
  useEffect(() => {
    return authBroadcast.onImpersonation(() => {
      appLogger.auth("[NavigationProvider] Impersonation event — resetting navigation");
      useNavigationStore.getState().clearRouteData();
      useNavigationStore.getState().reset();
      autoFetchDone.current = false; // Allow auto-fetch for impersonated user
      void queryClient.invalidateQueries({ queryKey: ["navigation"] });
    });
  }, [queryClient]);

  // When auth ends, purge cached navigation state immediately so the next user starts clean
  const wasReadyRef = useRef<boolean>(isReady);
  const prevContextRef = useRef<string | "__initial__">("__initial__");

  useEffect(() => {
    if (wasReadyRef.current && !isReady) {
      appLogger.auth("[NavigationProvider] Auth session ended — clearing navigation store");
      useNavigationStore.getState().clearRouteData();
      useNavigationStore.getState().reset();
      autoFetchDone.current = false;
      queryClient.removeQueries({ queryKey: ["navigation"] });
      prevContextRef.current = "__initial__";
    }
    wasReadyRef.current = isReady;
  }, [isReady, queryClient]);

  // When tenant context OR authenticated user changes, clear and refetch cleanly
  useEffect(() => {
    if (!isReady) return;
    if (prevContextRef.current === "__initial__") {
      prevContextRef.current = contextKey;
      return;
    }
    if (prevContextRef.current !== contextKey) {
      const previousContext = prevContextRef.current;
      prevContextRef.current = contextKey;
      appLogger.auth(
        `[NavigationProvider] Context changed (${previousContext} → ${contextKey}) — resetting navigation`
      );
      useNavigationStore.getState().clearRouteData();
      useNavigationStore.getState().reset();
      autoFetchDone.current = false; // Allow auto-fetch for the new context
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
    }
  }, [isReady, contextKey, queryClient]);

  // ── Auto-fetch active workspace on boot (Gap 1 + Gap 5 fix) ───────────────
  // After page refresh, activeWorkspaceKey is restored from localStorage while
  // the workspaces Map only contains whichever workspace bootstrap pre-hydrated
  // (e.g. "crm" for a CRM-enforced user). Fetch whenever activeWorkspaceKey lacks
  // hydrated menu data so any active workspace renders its sidebar cleanly.
  const activeWorkspaceKey = useNavigationStore((s) => s.activeWorkspaceKey);

  useEffect(() => {
    if (!isReady || isInitialLoading || autoFetchDone.current) return;

    const state = useNavigationStore.getState();
    const { workspaceGroups } = state;

    // workspaceGroups are loaded by bootstrap — if empty, bootstrap hasn't resolved yet
    if (workspaceGroups.length === 0) return;

    // Guard: skip the "__default__" sentinel key — it's an internal Map key, not a real workspace
    if (
      activeWorkspaceKey &&
      activeWorkspaceKey !== "__default__" &&
      !state.hasWorkspaceData(activeWorkspaceKey)
    ) {
      autoFetchDone.current = true;
      appLogger.debug(
        `[NavigationProvider] Boot: active workspace "${activeWorkspaceKey}" lacks hydrated menu data — auto-fetching`
      );
      fetchWorkspaceMenu(activeWorkspaceKey);
    }
  }, [isReady, isInitialLoading, activeWorkspaceKey, fetchWorkspaceMenu]);

  // ── Context value (backwards-compat delegation to store) ─────────────────
  // isInitialLoading + defaultWorkspace come from granular selectors above.
  // All method calls go through getState() to stay decoupled from the render cycle.
  const value = useMemo<NavigationContextType>(
    () => ({
      fetchWorkspaceMenu,
      refreshNavigation,
      // Legacy compat — reads always go via getState() so no stale closure risk
      hasPageAccess: (pathname) => useNavigationStore.getState().hasRouteAccess(pathname),
      getPageActions: (pathname) => useNavigationStore.getState().getPageActions(pathname),
      getRoutes: () => Array.from(useNavigationStore.getState().allRoutes),
      navigationData: defaultWorkspace,
      isLoading: isInitialLoading,
    }),
    [fetchWorkspaceMenu, refreshNavigation, defaultWorkspace, isInitialLoading]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useNavigation(): NavigationContextType {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return ctx;
}
