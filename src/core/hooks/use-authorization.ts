"use client";

import { appLogger } from "@core/common/logger";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface AuthorizationState {
  isAuthorized: boolean;
  isLoading: boolean;
  routes: string[];
}

/**
 * Hook to check if user is authorized to access current page
 */
export function useAuthorization(): AuthorizationState {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  // const { isLoading: authLoading } = useAuth(); // Removed
  const authLoading = !hasHydrated;
  const { navigationService } = useServices();
  const pathname = usePathname();
  const router = useRouter();
  const [asyncAuthState, setAsyncAuthState] = useState<{
    isAuthorized: boolean;
    routes: string[];
    checkedPath: string | null;
  }>({ isAuthorized: false, routes: [], checkedPath: null });

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    // Check authorization for the current page
    const checkAuthorization = async () => {
      try {
        const navigationData = navigationService.getNavigationData();

        if (!navigationData) {
          // Navigation data not loaded yet, redirect to login to refresh
          router.push("/login");
          return;
        }

        const isAuthorized = navigationService.hasPageAccess(pathname);

        setAsyncAuthState({
          isAuthorized,
          routes: navigationData.routes,
          checkedPath: pathname,
        });

        // Redirect to not authorized page if user doesn't have access
        if (!isAuthorized && pathname !== "/not-authorized") {
          router.push("/not-authorized");
        }
      } catch (error) {
        appLogger.error("Authorization check failed:", error);
        setAsyncAuthState({
          isAuthorized: false,
          routes: [],
          checkedPath: pathname,
        });
      }
    };

    checkAuthorization();
  }, [isAuthenticated, authLoading, pathname, navigationService, router]);

  // Compute final state synchronously (no setState in effect for early exits)
  if (authLoading) {
    return { isAuthorized: false, isLoading: true, routes: [] };
  }
  if (!isAuthenticated) {
    return { isAuthorized: false, isLoading: false, routes: [] };
  }
  // Async check not yet completed for current path
  if (asyncAuthState.checkedPath !== pathname) {
    return { isAuthorized: false, isLoading: true, routes: [] };
  }

  return {
    isAuthorized: asyncAuthState.isAuthorized,
    isLoading: false,
    routes: asyncAuthState.routes,
  };
}

/**
 * Hook to check if user has access to a specific page
 */
export function usePageAccess(pagePath: string): boolean {
  const { navigationService } = useServices();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return false;
  }

  return navigationService.hasPageAccess(pagePath);
}

/**
 * Higher-order component to protect routes
 * Note: This should be used in .tsx files, not .ts files
 */
export function withAuthorization<T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> {
  return function AuthorizedComponent(props: T) {
    const { isAuthorized, isLoading } = useAuthorization();

    if (isLoading) {
      // Return loading component (this would need to be in a .tsx file)
      return null;
    }

    if (!isAuthorized) {
      return null; // Will be redirected by useAuthorization hook
    }

    // This would need to be used in a .tsx file to work properly
    return null;
  };
}
