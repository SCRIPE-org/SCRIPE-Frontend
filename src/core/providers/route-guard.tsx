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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@core/common/logger";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useQueryClient } from "@tanstack/react-query";
import { authBroadcast } from "@core/common/broadcast-auth";

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
  "/venue",
  "/setup-account",
  // /change-password requires auth — listed as SYSTEM_PAGE below
  "/signup",
  "/terms",
  "/privacy",
  "/signup/complete",
  // ── Passwordless / cross-device flows — public (no auth required) ────────
  "/magic-link", // Magic link email callback — token-authenticated, no session needed
  "/qr-approve", // QR code approval page — scanned from mobile, no auth session
  "/bookings/guest", // Guest reservation portal — token-authenticated via fragment, no auth session
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
  "/entitlements/subscriptions", // Dynamic detail page (no menu)
  "/entitlements/overrides", // Dynamic overrides page (no menu)
  "/entitlements/signup-content", // Signup content management (no menu)
  "/plugins", // Dynamic plugin pages (no menu)
  "/marketplace", // Marketplace hub page (no menu)
  "/venue", // Venue operations workspace
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
  const queryClient = useQueryClient();
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
  const [checkTrigger, setCheckTrigger] = useState(0);
  // No useI18n() here on purpose: the only string this guard rendered was the
  // "Loading" caption, and LoadingSpinner already owns it (and its
  // role="status" name). A permission boundary should subscribe to as little
  // as possible.
  const [isMounted] = useState(() => typeof window !== "undefined");

  const hasRedirected = useRef(false);
  const isRefreshing = useRef(false);

  // Reset redirect tracking on pathname change
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // ── Cross-tab refresh coordination (F-67) ───────────────────────────────
  // RouteGuard's own silent-refresh-on-reload (Case 2 below) and ApiService's
  // 401-interceptor refresh each call authRepository.refreshToken() through
  // an independent lock, with no coordination between tabs. Since the
  // backend's refresh cookie is single-use/rotating, two tabs refreshing at
  // once means one call always fails. `onTokenRefreshed` already fires
  // whenever ANY tab completes a refresh (broadcast-auth.ts persists the new
  // access token into this tab's secureTokenService before the callback
  // runs) — subscribe to it so a refresh that just landed elsewhere is
  // trusted instead of racing a second /auth/refresh call.
  useEffect(() => {
    authBroadcast.onTokenRefreshed(() => {
      appLogger.debug("[RouteGuard] Observed cross-tab token refresh — re-checking access");
      setCheckTrigger((prev) => prev + 1);
    });
  }, []);

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
        const defaultPath = useAppStore.getState().defaultRedirectPath;
        const targetPath = !defaultPath || defaultPath === "/" ? "/overview" : defaultPath;
        router.replace(mcp ? "/change-password" : targetPath);
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
        const subscriptionStatus = useAppStore.getState().subscriptionStatus;
        if (subscriptionStatus === "PendingPayment") {
          if (pathname !== "/activate-workspace") {
            appLogger.debug("[RouteGuard] Pending payment status → /activate-workspace");
            hasRedirected.current = true;
            router.replace("/activate-workspace");
            return;
          }
          setIsChecking(false);
          return;
        }

        const mcp = useAppStore.getState().mustChangePassword;
        if (mcp && pathname !== "/change-password") {
          appLogger.debug("[RouteGuard] Must change password → /change-password");
          hasRedirected.current = true;
          router.replace("/change-password");
          return;
        }

        if (!canAccessPage(pathname)) {
          appLogger.debug(
            "[RouteGuard] Access denied by permission system — checking for alternative workspace pages"
          );
          const workspaceRouteMap = useNavigationStore.getState().workspaceRouteMap;
          let currentWorkspaceKey: string | null = null;
          for (const [wsKey, routes] of Object.entries(workspaceRouteMap)) {
            if (
              routes.includes(pathname) ||
              routes.some((r) => pathname.startsWith(r + "/") || r.startsWith(pathname + "/"))
            ) {
              currentWorkspaceKey = wsKey;
              break;
            }
          }
          if (currentWorkspaceKey) {
            const workspaceRoutes = workspaceRouteMap[currentWorkspaceKey] || [];
            const accessibleRoute = workspaceRoutes.find((r) => canAccessPage(r));
            if (accessibleRoute) {
              appLogger.debug(
                `[RouteGuard] Redirecting to alternative accessible workspace route: ${accessibleRoute}`
              );
              hasRedirected.current = true;
              router.replace(accessibleRoute);
              return;
            }
          }
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
          appLogger.debug(
            "[RouteGuard] Access denied by navigation store — checking for alternative workspace pages"
          );
          const workspaceRouteMap = useNavigationStore.getState().workspaceRouteMap;
          let currentWorkspaceKey: string | null = null;
          for (const [wsKey, routes] of Object.entries(workspaceRouteMap)) {
            if (
              routes.includes(pathname) ||
              routes.some((r) => pathname.startsWith(r + "/") || r.startsWith(pathname + "/"))
            ) {
              currentWorkspaceKey = wsKey;
              break;
            }
          }
          if (currentWorkspaceKey) {
            const workspaceRoutes = workspaceRouteMap[currentWorkspaceKey] || [];
            const accessibleRoute = workspaceRoutes.find((r) => canAccessPage(r));
            if (accessibleRoute) {
              appLogger.debug(
                `[RouteGuard] Redirecting to alternative accessible workspace route: ${accessibleRoute}`
              );
              hasRedirected.current = true;
              router.replace(accessibleRoute);
              return;
            }
          }
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
              setCheckTrigger((prev) => prev + 1);
              return;
            }
          }
        } catch (error) {
          appLogger.error("[RouteGuard] Silent refresh failed:", error);
        }

        // Our own /auth/refresh call may have failed simply because another
        // tab (or ApiService's 401 interceptor) already rotated the
        // single-use refresh cookie first — the onTokenRefreshed broadcast
        // subscription above already persisted that tab's fresh token into
        // secureTokenService. Trust it instead of forcing logout.
        if (secureTokenService.hasToken()) {
          appLogger.debug(
            "[RouteGuard] Own refresh failed but a cross-tab refresh already succeeded — recovering"
          );
          isRefreshing.current = false;
          setIsRestoringSession(false);
          setCheckTrigger((prev) => prev + 1);
          return;
        }

        isRefreshing.current = false;
        setIsRestoringSession(false);
        appLogger.debug("[RouteGuard] Session expired → /login");

        if (!isAuthPage && !hasRedirected.current) {
          hasRedirected.current = true;
          forceLogout();
          logout();
          queryClient.clear();
          router.push("/login");
        } else if (isAuthPage) {
          forceLogout();
          logout();
          queryClient.clear();
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
    checkTrigger,
    queryClient,
  ]);

  if (!isMounted) return <>{children}</>;

  // ── Rendered fallback ───────────────────────────────────────────────────
  // Presentation only. Both branches show the SAME thing — the shared loader,
  // which already carries role="status", aria-busy and the translated
  // "Loading" caption. The caption used to be a second hand-written <p> next
  // to a text-suppressed spinner, so the same wait announced itself twice and
  // wore ink the token ladder does not own.
  if (authLoading || (isChecking && !isPublicPage(pathname) && !isRestoringSession)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nx-ground">
        <LoadingSpinner />
      </div>
    );
  }

  if (isPublicPage(pathname)) return <>{children}</>;

  if (isAuthenticated && secureTokenService.hasToken()) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-nx-ground">
      <LoadingSpinner />
    </div>
  );
}
