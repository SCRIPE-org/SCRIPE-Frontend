"use client";

import { appLogger } from "@core/common/logger";
import { useAuth } from "@core/providers/auth-provider";
import { useServices } from "@core/providers/service-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface AuthorizationState {
  isAuthorized: boolean;
  isLoading: boolean;
  allowedPages: string[];
}

/**
 * Hook to check if user is authorized to access current page
 */
export function useAuthorization(): AuthorizationState {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { navigationService } = useServices();
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthorizationState>({
    isAuthorized: false,
    isLoading: true,
    allowedPages: []
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setAuthState({
        isAuthorized: false,
        isLoading: false,
        allowedPages: []
      });
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
        
        setAuthState({
          isAuthorized,
          isLoading: false,
          allowedPages: navigationData.allowedPages
        });

        // Redirect to not authorized page if user doesn't have access
        if (!isAuthorized && pathname !== "/not-authorized") {
          router.push("/not-authorized");
        }
      } catch (error) {
        appLogger.error("Authorization check failed:", error);
        setAuthState({
          isAuthorized: false,
          isLoading: false,
          allowedPages: []
        });
      }
    };

    checkAuthorization();
  }, [isAuthenticated, authLoading, pathname, navigationService, router]);

  return authState;
}

/**
 * Hook to check if user has access to a specific page
 */
export function usePageAccess(pagePath: string): boolean {
  const { navigationService } = useServices();
  const { isAuthenticated } = useAuth();
  
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
