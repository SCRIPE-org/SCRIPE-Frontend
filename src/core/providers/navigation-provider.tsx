"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type React from "react";
import { authBroadcast } from "@core/common/broadcast-auth";
import { usePathname } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import type { MenuItemActions } from "@core/navigation";
import type { NavigationData } from "@core/navigation";
import { NavigationDataMapper } from "@core/navigation";
import { appLogger } from "@core/common/logger";
import { STORAGE_KEYS, CACHE_EXPIRY } from "@core/config/storage-keys";

// ── Context shape ──────────────────────────────────────────────────────────────

interface NavigationContextType {
  navigationData: NavigationData | null;
  isLoading: boolean;
  /** (Re)fetch the default workspace menu. Pass forceRefresh=true to bypass cache. */
  refreshNavigation: (skipLoading?: boolean, forceRefresh?: boolean) => Promise<void>;
  /**
   * JIT: fetch and cache menu items for a specific workspace.
   * Returns cached data instantly if already loaded.
   * Delegates to the in-memory cache inside NavigationRepository,
   * and persists to localStorage for page-reload resilience.
   */
  fetchWorkspaceMenu: (workspaceKey: string) => Promise<NavigationData | null>;
  hasPageAccess: (pathname: string) => boolean;
  getRoutes: () => string[];
  getPageActions: (pathname: string) => MenuItemActions | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// ── localStorage cache helpers ─────────────────────────────────────────────────
// These helpers live in the Provider (React layer) — not in the Repository.
// The Repository owns in-memory caching; localStorage is the persistence layer.

const wsKey = (key: string) => `${STORAGE_KEYS.NAVIGATION_WORKSPACE_PREFIX}${key}`;
const wsExpKey = (key: string) => `${wsKey(key)}_expiry`;

function readWsCache(workspaceKey: string): NavigationData | null {
  try {
    const raw = localStorage.getItem(wsKey(workspaceKey));
    const exp = localStorage.getItem(wsExpKey(workspaceKey));
    if (!raw || !exp) return null;
    if (Date.now() > parseInt(exp, 10)) {
      localStorage.removeItem(wsKey(workspaceKey));
      localStorage.removeItem(wsExpKey(workspaceKey));
      return null;
    }
    return NavigationDataMapper.fromPlainObject(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeWsCache(workspaceKey: string, data: NavigationData) {
  try {
    const plain = NavigationDataMapper.toPlainObject(data);
    localStorage.setItem(wsKey(workspaceKey), JSON.stringify(plain));
    localStorage.setItem(
      wsExpKey(workspaceKey),
      (Date.now() + CACHE_EXPIRY.NAVIGATION).toString()
    );
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

function clearAllWsCaches() {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(STORAGE_KEYS.NAVIGATION_WORKSPACE_PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    // Also clear the legacy single-key cache
    localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
    localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.WORKSPACE_STUBS_CACHE);
    localStorage.removeItem(STORAGE_KEYS.WORKSPACE_STUBS_CACHE_EXPIRY);
  } catch {
    // ignore
  }
}

function readDefaultCache(): NavigationData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE);
    const exp = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
    if (!raw || !exp) return null;
    if (Date.now() > parseInt(exp, 10)) {
      localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
      localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
      return null;
    }
    return NavigationDataMapper.fromPlainObject(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeDefaultCache(data: NavigationData) {
  try {
    const plain = NavigationDataMapper.toPlainObject(data);
    localStorage.setItem(STORAGE_KEYS.NAVIGATION_CACHE, JSON.stringify(plain));
    localStorage.setItem(
      STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY,
      (Date.now() + CACHE_EXPIRY.NAVIGATION).toString()
    );
  } catch {
    // ignore
  }
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Seed from localStorage cache on first render (SSR-safe)
  const [navigationData, setNavigationData] = useState<NavigationData | null>(() => {
    if (typeof window === "undefined") return null;
    return readDefaultCache();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasTriggeredRefresh, setHasTriggeredRefresh] = useState(false);

  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const mustChangePassword = useAppStore((s) => s.mustChangePassword);
  const { navigationRepository } = useServices();
  const pathname = usePathname();
  const isDocsRoute = pathname?.startsWith("/docs") || pathname?.startsWith("/commercial");

  // ── Step 1: Fetch default workspace (called on login / missing data) ─────────

  const refreshNavigation = useCallback(
    async (skipLoading = false, forceRefresh = false) => {
      if (!forceRefresh && !isAuthenticated) {
        setNavigationData(null);
        navigationRepository.clearAllCaches();
        clearAllWsCaches();
        return;
      }

      if (forceRefresh) setHasTriggeredRefresh(false);

      if (!skipLoading) setIsLoading(true);

      try {
        const data = await navigationRepository.fetchDefaultWorkspace();
        setNavigationData(data);
        writeDefaultCache(data);
        // Persist the default workspace's menu items to per-workspace cache too
        if (data.workspaceGroups.length > 0) {
          const firstKey = data.workspaceGroups[0].workspaceKey;
          writeWsCache(firstKey, data);
        }
        setHasTriggeredRefresh(true);
      } catch (error) {
        appLogger.error("Failed to fetch navigation data:", error);
        const cached = readDefaultCache();
        setNavigationData(cached ?? null);
      } finally {
        if (!skipLoading) setIsLoading(false);
      }
    },
    [isAuthenticated, navigationRepository]
  );

  // ── Step 2: JIT per-workspace fetch ─────────────────────────────────────────
  //
  // Strategy:
  //   1. Repository in-memory cache  (instant, lives for session duration)
  //   2. localStorage cache          (survives page reload, has TTL)
  //   3. Network fetch               (JIT on first access or cache miss)

  const fetchWorkspaceMenu = useCallback(
    async (workspaceKey: string): Promise<NavigationData | null> => {
      // Check localStorage first (survives page reload)
      const lsCached = readWsCache(workspaceKey);
      if (lsCached) {
        appLogger.debug(`Nav localStorage cache HIT for workspace "${workspaceKey}"`);
        return lsCached;
      }
      try {
        // Repository handles in-memory cache + HTTP fetch
        const data = await navigationRepository.fetchWorkspaceMenu(workspaceKey);
        // Persist to localStorage for next reload
        writeWsCache(workspaceKey, data);
        return data;
      } catch (err) {
        appLogger.error(`JIT fetch failed for workspace "${workspaceKey}":`, err);
        return null;
      }
    },
    [navigationRepository]
  );

  // ── Logout: clear everything ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) {
      setNavigationData(null);
      navigationRepository.clearAllCaches();
      clearAllWsCaches();
      setIsLoading(false);
      setHasTriggeredRefresh(false);
    }
  }, [isAuthenticated, navigationRepository]);

  // ── Auto-refresh: data missing for authenticated user ────────────────────────

  useEffect(() => {
    if (isDocsRoute) return;
    if (mustChangePassword) return;
    if (isAuthenticated && !navigationData && !isLoading && !hasTriggeredRefresh) {
      appLogger.debug("Navigation data missing, auto-refreshing...");
      refreshNavigation(false, true);
    }
  }, [
    isAuthenticated,
    mustChangePassword,
    navigationData,
    isLoading,
    hasTriggeredRefresh,
    refreshNavigation,
    isDocsRoute,
  ]);

  // ── Tenant context change: clear all and refetch ─────────────────────────────

  const { currentTenant } = useTenantContext();
  const tenantIdRef = useRef(currentTenant?.id ?? null);

  useEffect(() => {
    const newTenantId = currentTenant?.id ?? null;
    const prevTenantId = tenantIdRef.current;
    if (newTenantId !== prevTenantId) {
      tenantIdRef.current = newTenantId;
      appLogger.debug(
        `Tenant context changed: ${prevTenantId ?? "platform"} → ${newTenantId ?? "platform"}, purging all workspace caches...`
      );
      setNavigationData(null);
      navigationRepository.clearAllCaches();
      clearAllWsCaches();
      setHasTriggeredRefresh(false);
      if (isAuthenticated && !isDocsRoute && !mustChangePassword) {
        refreshNavigation(false, true);
      }
    }
  }, [currentTenant, isAuthenticated, isDocsRoute, mustChangePassword, refreshNavigation, navigationRepository]);

  // ── Impersonation: listen via shared authBroadcast singleton ─────────────────

  useEffect(() => {
    authBroadcast.onImpersonation((type) => {
      appLogger.auth(`Impersonation "${type}" — purging all workspace caches`);
      setNavigationData(null);
      navigationRepository.clearAllCaches();
      clearAllWsCaches();
      setHasTriggeredRefresh(false);
    });
    // authBroadcast is a singleton — no cleanup needed
  }, [navigationRepository]);

  // ── Periodic refresh check ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || isDocsRoute || mustChangePassword) return;
    const checkAndRefresh = () => {
      try {
        const exp = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
        if (!exp) {
          refreshNavigation(true, true);
          return;
        }
        const timeUntilExpiry = parseInt(exp, 10) - Date.now();
        if (timeUntilExpiry < CACHE_EXPIRY.NAVIGATION_REFRESH_CHECK) {
          refreshNavigation(true, true);
        }
      } catch {}
    };
    const t = setTimeout(checkAndRefresh, 1000);
    const iv = setInterval(checkAndRefresh, CACHE_EXPIRY.NAVIGATION_REFRESH_CHECK);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [isAuthenticated, refreshNavigation, isDocsRoute, mustChangePassword]);

  // ── Route guards ──────────────────────────────────────────────────────────────

  const hasPageAccess = useCallback(
    (path: string): boolean => {
      if (!isAuthenticated) return false;
      const cleanPath = path.split("?")[0].replace(/\/$/, "") || "/";
      const systemPages = [
        "/",
        "",
        "/dashboard",
        "/not-authorized",
        "/profile",
        "/_not-found",
        "/not-found",
        "/404",
        "/500",
        "/global-error",
        "/error",
      ];
      if (systemPages.includes(cleanPath)) return true;
      if (!navigationData) return true;
      return navigationData.hasPageAccess(cleanPath);
    },
    [navigationData, isAuthenticated]
  );

  const getRoutes = useCallback(
    (): string[] => navigationData?.routes ?? [],
    [navigationData]
  );

  const getPageActions = useCallback(
    (path: string): MenuItemActions | null =>
      navigationData?.getPageActions(path) ?? null,
    [navigationData]
  );

  const contextValue = useMemo(
    () => ({
      navigationData,
      isLoading,
      refreshNavigation,
      fetchWorkspaceMenu,
      hasPageAccess,
      getRoutes,
      getPageActions,
    }),
    [
      navigationData,
      isLoading,
      refreshNavigation,
      fetchWorkspaceMenu,
      hasPageAccess,
      getRoutes,
      getPageActions,
    ]
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
