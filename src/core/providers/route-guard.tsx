"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigation } from "@core/providers/navigation-provider";
import { useServices } from "@core/providers/service-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { USE_DYNAMIC_NAVIGATION } from "@core/config/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { secureTokenService } from "@core/common/secure-token-service";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { appLogger } from "../common/logger";

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
  "/settings",
  "/profile",
  "/profile/security",
  "/profile/activity",
  "/profile/sessions",
  "/profile/notifications",
  "/profile/settings",
  "/docs",
  "/commercial",
  "/oauth/callback",
  "/oauth/test",
  "/authorize",
];

// Route prefixes that are always public (no auth checks at all)
const PUBLIC_PREFIXES = ["/docs", "/commercial"];

/** Check if a pathname is a public page (no auth required) */
function isPublicPage(pathname: string): boolean {
  if (PUBLIC_PAGES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix + "/"));
}

/**
 * Force clear auth tokens on logout (preserves user settings)
 */
function forceLogout() {
  secureTokenService.clearTokens();

  // Clear navigation cache
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE);
    localStorage.removeItem(STORAGE_KEYS.NAVIGATION_CACHE_EXPIRY);
  }

  appLogger.debug("[RouteGuard] Forced logout - cleared auth tokens and cache");
}

export function RouteGuard({ children }: RouteGuardProps) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const logout = useAppStore((state) => state.logout);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const setAuth = useAppStore((state) => state.setAuth);
  const { authRepository } = useServices();
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
  // Track if we're currently refreshing to prevent duplicate calls
  const isRefreshing = useRef(false);

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

      // ─── Redirect authenticated users AWAY from auth pages ───
      // If user is already logged in and tries to visit /login (via URL bar,
      // browser back button, or bookmark), redirect to dashboard.
      // Uses router.replace to remove /login from browser history stack.
      const isAuthPage = pathname === "/login" || pathname === "/authorize" || pathname.startsWith("/sso");
      if (isAuthPage && secureTokenService.hasToken() && isAuthenticated) {
        appLogger.debug("[RouteGuard] Authenticated user on auth page, redirecting to dashboard");
        hasRedirected.current = true;
        router.replace("/");
        return;
      }

      // Check if this is a public page FIRST - always allow
      if (isPublicPage(pathname)) {
        setIsChecking(false);
        return;
      }

      // Prevent redirect loops
      if (hasRedirected.current) {
        return;
      }

      const hasToken = secureTokenService.hasToken();

      // ─── Case 1: Has in-memory token AND authenticated → normal RBAC flow ───
      if (hasToken && isAuthenticated) {
        if (!canAccessPage(pathname)) {
          appLogger.debug("[RouteGuard] Access denied by permissions");
          hasRedirected.current = true;
          router.push("/not-authorized");
          return;
        }

        if (!USE_DYNAMIC_NAVIGATION) {
          setIsChecking(false);
          return;
        }

        if (navLoading) {
          return;
        }

        const hasAccess = hasPageAccess(pathname);
        if (!hasAccess) {
          appLogger.debug("[RouteGuard] Access denied by dynamic navigation");
          hasRedirected.current = true;
          router.push("/not-authorized");
          return;
        }

        setIsChecking(false);
        return;
      }

      // ─── Case 2: No in-memory token but store hints authenticated (page reload) ───
      // The access token was in memory and is now gone after reload.
      // Attempt silent refresh using the httpOnly refresh token cookie.
      if (!hasToken && isAuthenticated) {
        if (isRefreshing.current) return; // Prevent duplicate refreshes
        isRefreshing.current = true;

        appLogger.debug(
          "[RouteGuard] No in-memory token but store says authenticated. Attempting silent refresh..."
        );

        try {
          const result = await authRepository.refreshToken();
          if (result.kind === "ok") {
            appLogger.debug("[RouteGuard] Silent refresh succeeded, restoring session");
            const user = await authRepository.getMe();
            if (user) {
              setAuth(user, user.permissions || [], []);
              isRefreshing.current = false;
              // Token is now in memory. Next render cycle will hit Case 1.
              return;
            }
          }
        } catch (error) {
          appLogger.error("[RouteGuard] Silent refresh failed:", error);
        }

        isRefreshing.current = false;
        // Refresh failed → session is truly expired
        appLogger.debug("[RouteGuard] Session expired, redirecting to login");
        hasRedirected.current = true;
        forceLogout();
        logout();
        router.push("/login");
        return;
      }

      // ─── Case 3: No token AND not authenticated → redirect to login ───
      if (!hasToken && !isAuthenticated) {
        appLogger.debug("[RouteGuard] Not authenticated, redirecting to login");
        hasRedirected.current = true;
        forceLogout();
        logout();
        router.push("/login");
        return;
      }

      // ─── Case 4: Has token but store NOT authenticated (e.g. after impersonation) ───
      // Attempt to restore session from the in-memory token
      if (hasToken && !isAuthenticated) {
        appLogger.debug(
          "[RouteGuard] Token exists but state missing. Attempting to restore session..."
        );

        try {
          const user = await authRepository.getMe();
          if (user) {
            appLogger.debug("[RouteGuard] Session restored successfully");
            setAuth(user, user.permissions || [], []);
            return;
          }
        } catch (error) {
          appLogger.error("[RouteGuard] Failed to restore session:", error);
          hasRedirected.current = true;
          forceLogout();
          logout();
          router.push("/login");
          return;
        }
      }
    };

    checkAccess();
  }, [
    isAuthenticated,
    authLoading,
    navLoading,
    pathname,
    hasPageAccess,
    canAccessPage,
    router,
    logout,
    authRepository,
    setAuth,
  ]);

  // For SSR/prerendering, render children without checks
  if (!isMounted) {
    return <>{children}</>;
  }

  // Show loading only when actually checking auth (not navigation loading for public pages)
  if (authLoading || (isChecking && !isPublicPage(pathname))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Always render children for public pages
  if (isPublicPage(pathname)) {
    return <>{children}</>;
  }

  // For protected pages, render if authenticated (token is in memory after refresh)
  if (isAuthenticated && secureTokenService.hasToken()) {
    return <>{children}</>;
  }

  // Default fallback - show loading (redirects should have happened)
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}
