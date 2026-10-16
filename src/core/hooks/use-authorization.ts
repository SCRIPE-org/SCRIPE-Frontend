/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { appLogger } from "@core/common/logger";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigation } from "@core/providers/navigation-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface AuthorizationState {
  isAuthorized: boolean;
  isLoading: boolean;
  routes: string[];
}

/**
 * Hook to check if user is authorized to access current page.
 *
 * Uses NavigationRepository (via useNavigation context) for access checks
 * instead of the deprecated NavigationService.
 */
export function useAuthorization(): AuthorizationState {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const authLoading = !hasHydrated;
  const { navigationData, hasPageAccess } = useNavigation();
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

    const checkAuthorization = async () => {
      try {
        if (!navigationData) {
          // Navigation data not loaded yet — allow access until it is (provider handles loading state)
          setAsyncAuthState({ isAuthorized: true, routes: [], checkedPath: pathname });
          return;
        }

        const isAuthorized = hasPageAccess(pathname);

        setAsyncAuthState({
          isAuthorized,
          routes: navigationData.routes,
          checkedPath: pathname,
        });

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
  }, [isAuthenticated, authLoading, pathname, navigationData, hasPageAccess, router]);

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
 * Hook to check if user has access to a specific page.
 * Uses the NavigationProvider context (no service coupling).
 */
export function usePageAccess(pagePath: string): boolean {
  const { hasPageAccess } = useNavigation();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return false;
  }

  return hasPageAccess(pagePath);
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
      return null;
    }

    if (!isAuthorized) {
      return null; // Will be redirected by useAuthorization hook
    }

    // This would need to be used in a .tsx file to work properly
    return null;
  };
}
