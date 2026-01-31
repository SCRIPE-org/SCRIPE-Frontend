"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigation } from "@core/providers/navigation-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { USE_DYNAMIC_NAVIGATION } from "@core/config/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { secureTokenService } from "@core/common/secure-token-service";
import { NAVIGATION_CACHE_KEY, NAVIGATION_CACHE_EXPIRY_KEY } from "@core/providers/navigation-provider";

interface RouteGuardProps {
  children: React.ReactNode;
}

// Define public pages that don't require authentication or authorization
const PUBLIC_PAGES = [
  "/login",
  "/not-authorized",
  "/not-found",
  "/global-error",
  "/error",
  "/404",
  "/500",
  "/settings"
];

/**
 * Force clear auth tokens on logout (preserves user settings)
 */
function forceLogout() {
  secureTokenService.clearTokens();

  // Clear navigation cache
  if (typeof window !== "undefined") {
    localStorage.removeItem(NAVIGATION_CACHE_KEY);
    localStorage.removeItem(NAVIGATION_CACHE_EXPIRY_KEY);
  }

  console.log("[RouteGuard] Forced logout - cleared auth tokens and cache");
}

export function RouteGuard({ children }: RouteGuardProps) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const logout = useAppStore((state) => state.logout);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const authLoading = !hasHydrated;
  const { hasPageAccess, isLoading: navLoading } = useNavigation();
  const { canAccessPage } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);

  // Track if we've already redirected to prevent loops
  const hasRedirected = useRef(false);
  const lastPathname = useRef(pathname);

  // Reset redirect tracking when pathname changes
  useEffect(() => {
    if (pathname !== lastPathname.current) {
      hasRedirected.current = false;
      lastPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      // Skip check if still loading
      if (authLoading) {
        return;
      }

      // Check if this is a public page FIRST - always allow
      if (PUBLIC_PAGES.includes(pathname)) {
        setIsChecking(false);
        return;
      }

      // Prevent redirect loops
      if (hasRedirected.current) {
        return;
      }

      // Get actual token status
      const hasToken = secureTokenService.hasToken();

      // If no token exists, redirect to login
      if (!hasToken) {
        console.log("[RouteGuard] No token found, redirecting to login");
        hasRedirected.current = true;
        forceLogout();
        logout();
        router.push("/login");
        return;
      }

      // If store says not authenticated but token exists, 
      // this is an inconsistent state - clear everything and redirect
      if (!isAuthenticated && hasToken) {
        console.log("[RouteGuard] Inconsistent auth state, clearing and redirecting to login");
        hasRedirected.current = true;
        forceLogout();
        logout();
        router.push("/login");
        return;
      }

      // At this point: has token AND authenticated
      // Check RBAC permissions
      if (!canAccessPage(pathname)) {
        console.log("[RouteGuard] Access denied by permissions");
        hasRedirected.current = true;
        router.push("/not-authorized");
        return;
      }

      // If using static navigation, allow all pages for authenticated users
      if (!USE_DYNAMIC_NAVIGATION) {
        setIsChecking(false);
        return;
      }

      // Skip navigation loading check if still loading
      if (navLoading) {
        return;
      }

      // Check if user has access to current page (dynamic navigation)
      const hasAccess = hasPageAccess(pathname);

      if (!hasAccess) {
        console.log("[RouteGuard] Access denied by dynamic navigation");
        hasRedirected.current = true;
        router.push("/not-authorized");
        return;
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, authLoading, navLoading, pathname, hasPageAccess, canAccessPage, router, logout]);

  // For SSR/prerendering, render children without checks
  if (!isMounted) {
    return <>{children}</>;
  }

  // Show loading only when actually checking auth (not navigation loading for public pages)
  if (authLoading || (isChecking && !PUBLIC_PAGES.includes(pathname))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Always render children for public pages
  if (PUBLIC_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected pages, only render if authenticated AND token exists
  if (isAuthenticated && secureTokenService.hasToken()) {
    return <>{children}</>;
  }

  // Default fallback - show loading (redirects should have happened)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}
