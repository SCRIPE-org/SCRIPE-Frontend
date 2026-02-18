/**
 * useAuthRefresh Hook
 *
 * Handles automatic refresh of user authentication data (permissions, roles).
 * This ensures that if permissions are updated on the backend, the frontend
 * will eventually sync without requiring a logout/login.
 *
 * @example
 * // In a layout or provider component:
 * useAuthRefresh({ intervalMs: 5 * 60 * 1000 }); // Refresh every 5 minutes
 */

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { appLogger } from "@core/common/logger";
import { STORAGE_KEYS } from "../config/storage-keys";

interface UseAuthRefreshOptions {
  /**
   * Interval in milliseconds for periodic refresh.
   * Default: 5 minutes (300000ms)
   */
  intervalMs?: number;

  /**
   * Whether to enable automatic refresh.
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Hook to automatically refresh user permissions and roles.
 * Should be called once in a high-level layout component.
 */
export function useAuthRefresh(options: UseAuthRefreshOptions = {}) {
  const { intervalMs = 1000 * 60 * 5, enabled = true } = options;

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const setAuth = useAppStore((state) => state.setAuth);
  const { authRepository } = useServices();
  const pathname = usePathname();
  const isDocsRoute = pathname?.startsWith("/docs");

  const isRefreshing = useRef(false);

  /**
   * Refresh user data from the backend
   */
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated || isRefreshing.current) return;

    isRefreshing.current = true;

    try {
      appLogger.debug("[AuthRefresh] Refreshing user data...");
      const user = await authRepository.getMe();

      if (user) {
        // Update store with fresh data
        setAuth(user, user.permissions || [], []);
        appLogger.debug("[AuthRefresh] User data refreshed successfully");
      }
    } catch (error) {
      // Don't log as error - this is expected if token expired
      // The API interceptor will handle token refresh
      appLogger.debug("[AuthRefresh] Failed to refresh user data:", error);
    } finally {
      isRefreshing.current = false;
    }
  }, [isAuthenticated, authRepository, setAuth]);

  // Set up periodic refresh
  useEffect(() => {
    if (!enabled || !isAuthenticated || isDocsRoute) return;

    // Initial delay before first refresh (give app time to settle)
    const initialDelay = setTimeout(() => {
      // Don't refresh immediately - the login flow already fetched fresh data
    }, intervalMs);

    // Periodic refresh
    const intervalId = setInterval(refreshUserData, intervalMs);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(intervalId);
    };
  }, [enabled, isAuthenticated, intervalMs, refreshUserData]);

  // Also refresh when window regains focus (user returns to tab)
  useEffect(() => {
    if (!enabled || !isAuthenticated || isDocsRoute) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Only refresh if tab was hidden for more than 5 minutes
        // We track this via a stored timestamp
        const lastRefresh = sessionStorage.getItem(STORAGE_KEYS.lastAuthRefresh);
        const now = Date.now();

        if (!lastRefresh || now - parseInt(lastRefresh, 10) > intervalMs) {
          refreshUserData();
          sessionStorage.setItem(STORAGE_KEYS.lastAuthRefresh, now.toString());
        }
      }
    };

    // Update timestamp on each refresh
    const updateTimestamp = () => {
      sessionStorage.setItem(STORAGE_KEYS.lastAuthRefresh, Date.now().toString());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set initial timestamp
    updateTimestamp();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, isAuthenticated, intervalMs, refreshUserData]);

  return {
    refresh: refreshUserData,
  };
}
