"use client";

/**
 * RouteGuard (v2)
 *
 * Changes vs v1:
 *  - Navigation access check is now a SINGLE call: store.hasRouteAccess(pathname)
 *    instead of the old 7-tier waterfall (navLoading guard + hasPageAccess())
 *  - The store's allRoutes Set is eagerly populated on login (via NavigationProvider)
 *    so there is ZERO race condition between route guard and JIT menu fetches.
 *  - Removed dependency on STORAGE_KEYS.NAVIGATION_CACHE (deleted in v2)
 *  - forceLogout() now calls store.reset() instead of manual localStorage cleanup
 *
 * 4-case auth logic is preserved exactly from v1 (token × store state matrix).
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { USE_DYNAMIC_NAVIGATION } from "@core/config/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@core/common/logger";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";

interface RouteGuardProps {
  children: React.ReactNode;
}

// ── Public pages (auth not required) ──────────────────────────────────────
const PUBLIC_PAGES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/not-authorized",
  "/not-found",
  "/global-error",
  "/error",
  "/404",
  "/500",
  // Profile + settings pages are system pages (auth required) — not public
  "/docs",
  "/commercial",
  "/oauth/callback",
  "/oauth/test",
  "/authorize",
  "/studio-preview",
  "/dashboard-preview",
  "/setup-account",
  // /change-password requires auth — listed as SYSTEM_PAGE below
  "/signup",
  "/terms",
  "/privacy",
  // ── Passwordless / cross-device flows — public (no auth required) ────────
  "/magic-link", // Magic link email callback — token-authenticated, no session needed
  "/qr-approve", // QR code approval page — scanned from mobile, no auth session
];

const PUBLIC_PREFIXES = ["/docs", "/commercial", "/sso"];

/**
 * System pages: require authentication but bypass the navigation store
 * route-access check. These are always accessible to any authenticated
 * admin regardless of their menu permissions.
 */
const SYSTEM_PAGES = [
  "/hub", // Workspace picker — for tenant-only module admins
  "/change-password",
  "/profile",
  "/profile/security",
  "/profile/activity",
  "/profile/sessions",
  "/profile/notifications",
  "/profile/settings",
  "/settings",
  "/overview",
];

function isSystemPage(pathname: string): boolean {
  return SYSTEM_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicPage(pathname: string): boolean {
  if (PUBLIC_PAGES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix + "/"));
}

function forceLogout() {
  secureTokenService.clearTokens();
  // Reset navigation store — replaces old manual localStorage.removeItem calls
  useNavigationStore.getState().reset();
  appLogger.debug("[RouteGuard] Forced logout — cleared tokens + navigation store");
}

// ── Component ──────────────────────────────────────────────────────────────
export function RouteGuard({ children }: RouteGuardProps) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const logout = useAppStore((state) => state.logout);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const { authRepository } = useServices();
  const authLoading = !hasHydrated;

  // ── v2: single store-based nav check (replaces navLoading + hasPageAccess) ──
  // Use granular selectors so only their specific slice triggers a re-render,
  // not the entire store snapshot (which changes on JIT loads, workspace switches, etc.)
  const navReady = useNavigationStore((s) => s.allRoutes.size > 0);
  // hasRouteAccess is a method on the store — read via getState() in the effect
  // so we never capture a stale reference and don't need it as a dependency.
  const hasRouteAccess = useCallback(
    (p: string) => useNavigationStore.getState().hasRouteAccess(p),
    []
  );

  const { canAccessPage } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  const { t } = useI18n();
  const [isMounted] = useState(() => typeof window !== "undefined");

  const hasRedirected = useRef(false);
  const isRefreshing = useRef(false);

  // Reset redirect tracking on pathname change
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      const isAuthPage =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname === "/magic-link" ||
        pathname === "/qr-approve" ||
        pathname.startsWith("/sso");

      const hasToken = secureTokenService.hasToken();

      // Only redirect pre-authenticated users away from standard auth pages.
      // Magic-link, qr-approve, and sso pages handle their own token exchange
      // and must NOT be preempted by the route guard — that would cut the success
      // animation short and could race with the in-flight token exchange.
      const isStandardAuthPage =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password";

      if (isStandardAuthPage && hasToken && isAuthenticated) {
        appLogger.debug("[RouteGuard] Authenticated user on auth page → dashboard");
        hasRedirected.current = true;
        const mcp = useAppStore.getState().mustChangePassword;
        const defaultPath = useAppStore.getState().defaultRedirectPath || "/";
        router.replace(mcp ? "/change-password" : defaultPath);
        return;
      }

      if (isPublicPage(pathname)) {
        // Only attempt silent refresh on credential-based auth pages.
        // Token-exchange pages handle their own auth — starting a concurrent
        // refresh would race and call logout() AFTER a fresh token was stored.
        const needsSilentRefreshOnAuthPage = isStandardAuthPage && !hasToken && isAuthenticated;
        if (!needsSilentRefreshOnAuthPage) {
          setIsChecking(false);
          return;
        }
      }

      if (hasRedirected.current) return;

      // ── Case 1: Token + authenticated → RBAC check ─────────────────────
      if (hasToken && isAuthenticated) {
        const mcp = useAppStore.getState().mustChangePassword;
        if (mcp && pathname !== "/change-password") {
          appLogger.debug("[RouteGuard] Must change password → /change-password");
          hasRedirected.current = true;
          router.replace("/change-password");
          return;
        }

        if (!canAccessPage(pathname)) {
          appLogger.debug("[RouteGuard] Access denied by permission system");
          hasRedirected.current = true;
          router.push("/not-authorized");
          return;
        }

        if (!USE_DYNAMIC_NAVIGATION) {
          setIsChecking(false);
          return;
        }

        // ── v2: system pages bypass nav store RBAC (always allowed when authenticated) ──
        if (isSystemPage(pathname)) {
          setIsChecking(false);
          return;
        }

        // ── v2: wait for eager routes to be populated (usually instant from cache) ──
        if (!navReady) {
          // Routes not yet loaded — allow render, NavigationProvider is fetching
          setIsChecking(false);
          return;
        }

        if (!hasRouteAccess(pathname)) {
          appLogger.debug("[RouteGuard] Access denied by navigation store");
          hasRedirected.current = true;
          router.push("/not-authorized");
          return;
        }

        setIsChecking(false);
        return;
      }

      // ── Case 2: No token but store says authenticated (page reload) ─────
      if (!hasToken && isAuthenticated) {
        if (isRefreshing.current) return;
        isRefreshing.current = true;
        setIsRestoringSession(true);

        appLogger.debug("[RouteGuard] No token, store=authenticated → silent refresh");

        try {
          const result = await authRepository.refreshToken();
          if (result.kind === "ok") {
            appLogger.debug("[RouteGuard] Silent refresh succeeded");

            const refreshData = result.value;
            setSubscriptionInfo(
              refreshData.subscriptionStatus ?? null,
              refreshData.gracePhase ?? null,
              refreshData.editionName ?? null
            );
            useAppStore.getState().setMustChangePassword(refreshData.mustChangePassword ?? false);

            const user = await authRepository.getMe();
            if (user) {
              setAuth(user, user.permissions || [], []);
              isRefreshing.current = false;
              setIsRestoringSession(false);
              return;
            }
          }
        } catch (error) {
          appLogger.error("[RouteGuard] Silent refresh failed:", error);
        }

        isRefreshing.current = false;
        setIsRestoringSession(false);
        appLogger.debug("[RouteGuard] Session expired → /login");

        if (!isAuthPage && !hasRedirected.current) {
          hasRedirected.current = true;
          forceLogout();
          logout();
          router.push("/login");
        } else if (isAuthPage) {
          forceLogout();
          logout();
          setIsChecking(false);
        }
        return;
      }

      // ── Case 3: No token + not authenticated → /login ──────────────────
      if (!hasToken && !isAuthenticated) {
        if (!isAuthPage && !hasRedirected.current) {
          appLogger.debug("[RouteGuard] Not authenticated → /login");
          hasRedirected.current = true;
          forceLogout();
          router.push("/login");
        } else if (isAuthPage) {
          setIsChecking(false);
        }
        return;
      }

      // ── Case 4: Token exists but store NOT authenticated ────────────────
      if (hasToken && !isAuthenticated) {
        appLogger.debug("[RouteGuard] Token exists, store empty → restoring session");

        try {
          const user = await authRepository.getMe();
          if (user) {
            appLogger.debug("[RouteGuard] Session restored");
            setAuth(user, user.permissions || [], []);
            return;
          }
        } catch (error) {
          appLogger.error("[RouteGuard] Session restore failed:", error);
          hasRedirected.current = true;
          forceLogout();
          logout();
          router.push("/login");
        }
      }
    };

    checkAccess();
  }, [
    isAuthenticated,
    authLoading,
    navReady,
    pathname,
    canAccessPage,
    router,
    logout,
    authRepository,
    setAuth,
    setSubscriptionInfo,
    hasRouteAccess,
    // NOTE: mustChangePassword intentionally NOT here — read via getState()
    // NOTE: hasRouteAccess is stable (useCallback with [] deps)
  ]);

  if (!isMounted) return <>{children}</>;

  if (authLoading || (isChecking && !isPublicPage(pathname) && !isRestoringSession)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner showText={false} />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (isPublicPage(pathname)) return <>{children}</>;

  if (isAuthenticated && secureTokenService.hasToken()) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}
