"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@core/providers/auth-provider";
import { useServices } from "@core/providers/service-provider";
import { NavigationData, NavigationMapper } from "../../domain/entities";
import { appLogger } from "@core/common/logger";

// LocalStorage key for navigation cache
const NAVIGATION_CACHE_KEY = "navigation_data";
const NAVIGATION_CACHE_EXPIRY_KEY = "navigation_data_expiry";
const CACHE_EXPIRY_TIME = 1000 * 60 * 30; // 30 minutes

interface NavigationContextType {
  navigationData: NavigationData | null;
  isLoading: boolean;
  refreshNavigation: () => Promise<void>;
  hasPageAccess: (pathname: string) => boolean;
  getAllowedPages: () => string[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Initialize with cached data immediately (sync operation)
  const [navigationData, setNavigationData] = useState<NavigationData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedData = localStorage.getItem(NAVIGATION_CACHE_KEY);
        const cacheExpiry = localStorage.getItem(NAVIGATION_CACHE_EXPIRY_KEY);
        
        if (!cachedData || !cacheExpiry) {
          return null;
        }

        const expiryTime = parseInt(cacheExpiry, 10);
        const now = Date.now();

        if (now > expiryTime) {
          localStorage.removeItem(NAVIGATION_CACHE_KEY);
          localStorage.removeItem(NAVIGATION_CACHE_EXPIRY_KEY);
          return null;
        }

        const parsedData = JSON.parse(cachedData);
        const navData = NavigationMapper.navigationDataFromJson({
          menuItems: parsedData.menuItems,
          allowedPages: parsedData.allowedPages
        });
        
        appLogger.debug('Navigation data loaded from cache on initialization');
        return navData;
      } catch (error) {
        appLogger.error('Failed to load navigation from cache on init:', error);
        return null;
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriggeredRefresh, setHasTriggeredRefresh] = useState(false);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { navigationService } = useServices();

  /**
   * Load navigation data from localStorage cache
   */
  const loadFromCache = useCallback((): NavigationData | null => {
    try {
      const cachedData = localStorage.getItem(NAVIGATION_CACHE_KEY);
      const cacheExpiry = localStorage.getItem(NAVIGATION_CACHE_EXPIRY_KEY);
      
      if (!cachedData || !cacheExpiry) {
        return null;
      }

      const expiryTime = parseInt(cacheExpiry, 10);
      const now = Date.now();

      // Check if cache is expired
      if (now > expiryTime) {
        appLogger.debug('Navigation cache expired, clearing...');
        localStorage.removeItem(NAVIGATION_CACHE_KEY);
        localStorage.removeItem(NAVIGATION_CACHE_EXPIRY_KEY);
        return null;
      }

      // Parse and return cached data
      const parsedData = JSON.parse(cachedData);
      const navigationData = NavigationMapper.navigationDataFromJson({
        menuItems: parsedData.menuItems,
        allowedPages: parsedData.allowedPages
      });
      
      appLogger.debug('Navigation data loaded from cache');
      return navigationData;
    } catch (error) {
      appLogger.error('Failed to load navigation from cache:', error);
      // Clear invalid cache
      localStorage.removeItem(NAVIGATION_CACHE_KEY);
      localStorage.removeItem(NAVIGATION_CACHE_EXPIRY_KEY);
      return null;
    }
  }, []);

  /**
   * Save navigation data to localStorage cache
   */
  const saveToCache = useCallback((data: NavigationData) => {
    try {
      const cacheData = {
        menuItems: data.menuItems.map(item => ({
          id: item.id,
          name: item.name,
          href: item.href,
          icon: item.icon,
          order: item.order,
          parentMenuItem: item.parentMenuItem,
          children: item.children.map(child => ({
            id: child.id,
            name: child.name,
            href: child.href,
            icon: child.icon,
            order: child.order,
            parentMenuItem: child.parentMenuItem,
            children: [],
            requiredPermission: child.requiredPermission,
            isDeleted: child.isDeleted,
            isActive: child.isActive,
            notes: child.notes,
            createdTimestamp: child.createdTimestamp,
            updatedTimestamp: child.updatedTimestamp,
            deletedTimestamp: child.deletedTimestamp,
          })),
          requiredPermission: item.requiredPermission,
          isDeleted: item.isDeleted,
          isActive: item.isActive,
          notes: item.notes,
          createdTimestamp: item.createdTimestamp,
          updatedTimestamp: item.updatedTimestamp,
          deletedTimestamp: item.deletedTimestamp,
        })),
        allowedPages: data.allowedPages
      };

      localStorage.setItem(NAVIGATION_CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(NAVIGATION_CACHE_EXPIRY_KEY, (Date.now() + CACHE_EXPIRY_TIME).toString());
      
      appLogger.debug('Navigation data saved to cache');
    } catch (error) {
      appLogger.error('Failed to save navigation to cache:', error);
    }
  }, []);

  /**
   * Clear navigation cache
   */
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(NAVIGATION_CACHE_KEY);
      localStorage.removeItem(NAVIGATION_CACHE_EXPIRY_KEY);
      appLogger.debug('Navigation cache cleared');
    } catch (error) {
      appLogger.error('Failed to clear navigation cache:', error);
    }
  }, []);

  const refreshNavigation = useCallback(async (skipLoading = false) => {
    if (!isAuthenticated) {
      setNavigationData(null);
      navigationService.clearNavigationData();
      clearCache();
      return;
    }

    // Don't set loading state if we're refreshing in background with existing data
    if (!skipLoading) {
      setIsLoading(true);
    }
    
    try {
      const data = await navigationService.fetchMenuItems();
      setNavigationData(data);
      saveToCache(data); // Save to cache after successful fetch
    } catch (error) {
      appLogger.error("Failed to fetch navigation data:", error);
      // Try to load from cache as fallback
      const cachedData = loadFromCache();
      if (cachedData) {
        appLogger.debug('Using cached navigation data due to fetch error');
        setNavigationData(cachedData);
      } else {
        setNavigationData(null);
      }
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, navigationService, saveToCache, loadFromCache, clearCache]);

  // Check if we need to refresh cache (no effect hook needed - data already loaded on init)

  // Fetch navigation data when user logs in (only once per session)
  useEffect(() => {
    // Don't fetch if auth is still loading or already triggered
    if (authLoading || hasTriggeredRefresh) {
      return;
    }

    if (isAuthenticated && user) {
      // If we have cached data, refresh in background without blocking
      const hasCachedData = !!navigationData;
      setHasTriggeredRefresh(true);
      refreshNavigation(hasCachedData); // Skip loading state if we have cached data
    } else if (!isAuthenticated) {
      setNavigationData(null);
      navigationService.clearNavigationData();
      clearCache();
      setIsLoading(false);
      setHasTriggeredRefresh(false); // Allow refresh on next login
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, authLoading, hasTriggeredRefresh]);

  const hasPageAccess = useCallback((pathname: string): boolean => {
    if (!isAuthenticated) {
      return false;
    }

    // Remove query parameters and trailing slashes for comparison
    const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';
    
    // Always allow access to system pages for authenticated users
    const systemPages = [
      '/',           // Home page
      '',            // Root
      '/dashboard',  // Dashboard
      '/not-authorized',
      '/profile',    // User profile
      '/_not-found', // Not found page
      '/not-found',  // Next.js not-found page
      '/404',        // 404 page
      '/500',        // Error page
      '/global-error', // Global error page
      '/error'       // Generic error page
    ];
    
    if (systemPages.includes(cleanPath)) {
      return true;
    }

    // If no navigation data yet, allow access temporarily (RouteGuard will re-check)
    // This prevents false rejections during initial load
    if (!navigationData) {
      return true; // Temporarily allow, will re-check when data loads
    }

    // Check for exact match first
    if (navigationData.allowedPages.includes(cleanPath)) {
      return true;
    }

    // Check for case-insensitive match
    const lowerCleanPath = cleanPath.toLowerCase();
    if (navigationData.allowedPages.some((page: string) => page.toLowerCase() === lowerCleanPath)) {
      return true;
    }

    // Check for hierarchical access - if user has access to parent route, grant access to nested routes
    const pathSegments = cleanPath.split('/').filter(segment => segment !== '');
    
    // Build parent paths and check if user has access to any parent route
    for (let i = pathSegments.length - 1; i > 0; i--) {
      const parentPath = '/' + pathSegments.slice(0, i).join('/');
      if (navigationData.allowedPages.includes(parentPath)) {
        return true;
      }
      
      // Also check case-insensitive for parent paths
      const lowerParentPath = parentPath.toLowerCase();
      if (navigationData.allowedPages.some((page: string) => page.toLowerCase() === lowerParentPath)) {
        return true;
      }
    }

    return false;
  }, [navigationData, isAuthenticated, isLoading]);

  const getAllowedPages = useCallback((): string[] => {
    return navigationData?.allowedPages || [];
  }, [navigationData]);

  return (
    <NavigationContext.Provider
      value={{
        navigationData,
        isLoading,
        refreshNavigation,
        hasPageAccess,
        getAllowedPages,
      }}
    >
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
