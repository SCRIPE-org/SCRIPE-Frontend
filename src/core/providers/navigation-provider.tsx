"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { NavigationData, MenuItemActions } from "@core/domain/entities";
import { NavigationMapper } from "@core/domain/mappers/NavigationMapper";
import { appLogger } from "@core/common/logger";
import { STORAGE_KEYS, CACHE_EXPIRY } from "@core/config/storage-keys";

interface NavigationContextType {
  navigationData: NavigationData | null;
  isLoading: boolean;
  refreshNavigation: (skipLoading?: boolean, forceRefresh?: boolean) => Promise<void>;
  hasPageAccess: (pathname: string) => boolean;
  getRoutes: () => string[];
  getPageActions: (pathname: string) => MenuItemActions | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Initialize with cached data immediately (sync operation)
  const [navigationData, setNavigationData] = useState<NavigationData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedData = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE);
        const cacheExpiry = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);

        if (!cachedData || !cacheExpiry) {
          return null;
        }

        const expiryTime = parseInt(cacheExpiry, 10);
        const now = Date.now();

        if (now > expiryTime) {
          localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
          localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
          return null;
        }

        const parsedData = JSON.parse(cachedData);
        const navData = NavigationMapper.navigationDataFromJson({
          menuItems: parsedData.menuItems,
          routes: parsedData.routes,
        });

        appLogger.debug("Navigation data loaded from cache on initialization");
        return navData;
      } catch (error) {
        appLogger.error("Failed to load navigation from cache on init:", error);
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasTriggeredRefresh, setHasTriggeredRefresh] = useState(false);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const mustChangePassword = useAppStore((state) => state.mustChangePassword);
  const user = useAppStore((state) => state.user);
  const { navigationService } = useServices();
  const pathname = usePathname();
  const isDocsRoute = pathname?.startsWith("/docs") || pathname?.startsWith("/commercial");

  /**
   * Load navigation data from localStorage cache
   */
  const loadFromCache = useCallback((): NavigationData | null => {
    try {
      const cachedData = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE);
      const cacheExpiry = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);

      if (!cachedData || !cacheExpiry) {
        return null;
      }

      const expiryTime = parseInt(cacheExpiry, 10);
      const now = Date.now();

      // Check if cache is expired
      if (now > expiryTime) {
        appLogger.debug("Navigation cache expired, clearing...");
        localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
        localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
        return null;
      }

      // Parse and return cached data
      const parsedData = JSON.parse(cachedData);
      const navigationData = NavigationMapper.navigationDataFromJson({
        menuItems: parsedData.menuItems,
        routes: parsedData.routes,
      });

      appLogger.debug("Navigation data loaded from cache");
      return navigationData;
    } catch (error) {
      appLogger.error("Failed to load navigation from cache:", error);
      // Clear invalid cache
      localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
      localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
      return null;
    }
  }, []);

  /**
   * Save navigation data to localStorage cache
   */
  const saveToCache = useCallback((data: NavigationData) => {
    try {
      const cacheData = NavigationMapper.navigationDataToPlainObject(data);
      localStorage.setItem(STORAGE_KEYS.NAVIGATION_CACHE, JSON.stringify(cacheData));
      localStorage.setItem(
        STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY,
        (Date.now() + CACHE_EXPIRY.NAVIGATION).toString()
      );
      appLogger.debug("Navigation data saved to cache");
    } catch (error) {
      appLogger.error("Failed to save navigation to cache:", error);
    }
  }, []);

  /**
   * Clear navigation cache
   */
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
      localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
      appLogger.debug("Navigation cache cleared");
    } catch (error) {
      appLogger.error("Failed to clear navigation cache:", error);
    }
  }, []);

  const refreshNavigation = useCallback(
    async (skipLoading = false, forceRefresh = false) => {
      // When force refreshing (e.g., after login), skip the isAuthenticated check
      // because the store may not have updated yet
      if (!forceRefresh && !isAuthenticated) {
        setNavigationData(null);
        navigationService.clearNavigationData();
        clearCache();
        return;
      }

      // Allow force refresh from login hook
      if (forceRefresh) {
        setHasTriggeredRefresh(false);
      }

      // Don't set loading state if we're refreshing in background with existing data
      if (!skipLoading) {
        setIsLoading(true);
      }

      try {
        const data = await navigationService.fetchMenuItems();
        setNavigationData(data);
        saveToCache(data); // Save to cache after successful fetch
        setHasTriggeredRefresh(true);
      } catch (error) {
        appLogger.error("Failed to fetch navigation data:", error);
        // Try to load from cache as fallback
        const cachedData = loadFromCache();
        if (cachedData) {
          appLogger.debug("Using cached navigation data due to fetch error");
          setNavigationData(cachedData);
        } else {
          setNavigationData(null);
        }
      } finally {
        if (!skipLoading) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, navigationService, saveToCache, loadFromCache, clearCache]
  );

  // Handle logout - clear navigation data when user logs out
  // Navigation fetch is now handled explicitly by useAuthLogin.onSuccess
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear everything on logout
      setNavigationData(null);
      navigationService.clearNavigationData();
      clearCache();
      setIsLoading(false);
      setHasTriggeredRefresh(false); // Allow refresh on next login
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ========================================
  // AUTO-REFRESH ON EXPIRY / MISSING DATA
  // ========================================
  // When user is authenticated but navigation data is null (expired or missing),
  // automatically trigger a refresh instead of leaving the user stuck.
  useEffect(() => {
    if (isDocsRoute) return; // Skip navigation fetch on docs routes
    // Skip navigation fetch when user must change password first.
    // The MCP middleware blocks /Menus/my with 403, which would cause an infinite loop.
    if (mustChangePassword) return;
    if (isAuthenticated && !navigationData && !isLoading && !hasTriggeredRefresh) {
      appLogger.debug("Navigation data missing for authenticated user, auto-refreshing...");
      refreshNavigation(false, true); // forceRefresh = true
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

  // ========================================
  // TENANT CONTEXT CHANGE → NAVIGATION REFETCH
  // ========================================
  // When the admin enters or exits a tenant's world, the backend returns
  // different menu items (RequiresPlatformContext / RequiresTenantContext).
  // We must clear the stale in-memory navigation and refetch immediately.
  const { currentTenant } = useTenantContext();
  const tenantIdRef = useRef(currentTenant?.id ?? null);

  useEffect(() => {
    const newTenantId = currentTenant?.id ?? null;
    const prevTenantId = tenantIdRef.current;

    // Only act when the value actually changes (not on initial mount)
    if (newTenantId !== prevTenantId) {
      tenantIdRef.current = newTenantId;
      appLogger.debug(
        `Tenant context changed: ${prevTenantId ?? "platform"} → ${newTenantId ?? "platform"}, refreshing navigation...`
      );

      // Clear stale in-memory state so the auto-refresh effect can trigger
      setNavigationData(null);
      clearCache();
      setHasTriggeredRefresh(false);

      // If not doing a full page reload (exitTenantWorld), force refetch now
      if (isAuthenticated && !isDocsRoute && !mustChangePassword) {
        refreshNavigation(false, true);
      }
    }
  }, [currentTenant, isAuthenticated, isDocsRoute, mustChangePassword, refreshNavigation, clearCache]);

  // ========================================
  // PERIODIC REFRESH CHECK (every 5 minutes)
  // ========================================
  // Periodically check if cache is about to expire and refresh proactively
  useEffect(() => {
    if (!isAuthenticated || isDocsRoute || mustChangePassword) return;

    const checkAndRefresh = () => {
      try {
        const cacheExpiry = localStorage.getItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
        if (!cacheExpiry) {
          // No expiry means no cache, trigger refresh
          appLogger.debug("Periodic check: No navigation cache, refreshing...");
          refreshNavigation(true, true); // skipLoading=true, forceRefresh=true
          return;
        }

        const expiryTime = parseInt(cacheExpiry, 10);
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        // If cache expires in less than 5 minutes, proactively refresh
        if (timeUntilExpiry < CACHE_EXPIRY.NAVIGATION_REFRESH_CHECK) {
          appLogger.debug("Periodic check: Navigation cache expiring soon, refreshing...");
          refreshNavigation(true, true); // Background refresh
        }
      } catch (error) {
        appLogger.error("Periodic refresh check failed:", error);
      }
    };

    // Initial check after mount
    const initialCheckTimeout = setTimeout(checkAndRefresh, 1000);

    // Periodic checks
    const intervalId = setInterval(checkAndRefresh, CACHE_EXPIRY.NAVIGATION_REFRESH_CHECK);

    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, refreshNavigation, isDocsRoute]);

  const hasPageAccess = useCallback(
    (pathname: string): boolean => {
      if (!isAuthenticated) {
        return false;
      }

      // Remove query parameters and trailing slashes for comparison
      const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

      // Always allow access to system pages for authenticated users
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

      if (systemPages.includes(cleanPath)) {
        return true;
      }

      // If no navigation data yet, allow access temporarily (RouteGuard will re-check)
      if (!navigationData) {
        return true;
      }

      return navigationData.hasPageAccess(cleanPath);
    },
    [navigationData, isAuthenticated]
  );

  const getRoutes = useCallback((): string[] => {
    return navigationData?.routes || [];
  }, [navigationData]);

  /**
   * Get page-level actions (canView, canCreate, canUpdate, canDelete)
   */
  const getPageActions = useCallback(
    (pathname: string): MenuItemActions | null => {
      if (!navigationData) return null;
      return navigationData.getPageActions(pathname);
    },
    [navigationData]
  );

  // P0.4: Memoize context value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo(
    () => ({
      navigationData,
      isLoading,
      refreshNavigation,
      hasPageAccess,
      getRoutes,
      getPageActions,
    }),
    [navigationData, isLoading, refreshNavigation, hasPageAccess, getRoutes, getPageActions]
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
