"use client";

/**
 * RouteGuard (v3 — Phase 2 Option C Fail-Closed Security & Context Gate)
 *
 * Enforces unified fail-closed route security & contextual access control:
 *  1. SSR + synchronous transition gate: never renders protected `{children}` before
 *     client mount or while a route/context key transition has not settled (zero flash).
 *  2. Authoritative manifest (`APP_ROUTE_MANIFEST`): zero `SYSTEM_PAGES` or module
 *     prefix bypasses, production blocking for `devOnly` routes, and clean 404
 *     pass-through for unknown paths.
 *  3. Auth matrix (token x store state) with `?redirect=` preservation validated
 *     by `isSafeRedirectTarget`, non-leaking principal restoration, and complete
 *     `forceLogout()` cleanup (`app-storage` + nav store + tokens).
 *  4. Fail-closed PBAC (`canAccessPage`) + synced navigation (`isNavSyncedForContext`)
 *     + explicit `NavigationErrorRecovery` (never fail-open).
 *  5. Backend/manifest context & entitlement gates (`TenantContextRequiredGate`,
 *     `PlatformContextRequiredGate`, `FeatureUnavailableGate`) rendered inside
 *     `<DashboardLayout>` without mounting the blocked page component.
 */

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useServices } from "@core/providers/service-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { useNavigation } from "@core/providers/navigation-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { USE_DYNAMIC_NAVIGATION } from "@core/config/navigation";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import {
  matchAppRoute,
  normalizeRoutePath,
  isManifestPublicRoute,
} from "@core/config/app-route-manifest";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { DashboardLayout } from "@core/ui/layout/dashboard-layout";
import {
  TenantContextRequiredGate,
  FeatureUnavailableGate,
  PlatformContextRequiredGate,
  NavigationErrorRecovery,
} from "@core/components/tenant-context";
import { secureTokenService } from "@core/common/secure-token-service";
import { appLogger } from "@core/common/logger";
import { authBroadcast } from "@core/common/broadcast-auth";
import { isSafeRedirectTarget } from "@modules/shared/auth/signin/src/presentation/utils/redirect-safety";

interface RouteGuardProps {
  children: React.ReactNode;
}

type GuardOutcome =
  | { kind: "loading" }
  | { kind: "allow" }
  | { kind: "nav_error"; error: string }
  | { kind: "tenant_context_required"; routePattern?: string }
  | { kind: "platform_context_required"; routePattern?: string }
  | { kind: "feature_disabled"; featureKey?: string | null };

const STANDARD_AUTH_PAGES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

const ALL_AUTH_PAGES = new Set([
  ...STANDARD_AUTH_PAGES,
  "/magic-link",
  "/qr-approve",
  "/sso/callback",
  "/sso/saml/callback",
]);

function forceLogout() {
  secureTokenService.clearTokens();
  useNavigationStore.getState().reset();
  useAppStore.getState().logout();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.APP_STORE);
    } catch {
      // Ignore storage access errors in restricted browsing contexts
    }
  }
  appLogger.debug("[RouteGuard] Forced logout — cleared tokens, nav store, and app-storage");
}

function buildLoginRedirectUrl(normalizedPath: string): string {
  if (
    !normalizedPath ||
    normalizedPath === "/" ||
    normalizedPath === "/not-authorized" ||
    ALL_AUTH_PAGES.has(normalizedPath)
  ) {
    return "/login";
  }

  const search = typeof window !== "undefined" ? window.location.search : "";
  const candidate = search ? `${normalizedPath}${search}` : normalizedPath;

  if (!isSafeRedirectTarget(candidate)) {
    return "/login";
  }

  return `/login?redirect=${encodeURIComponent(candidate)}`;
}

const emptySubscribe = () => () => {};
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

function outcomesEqual(a: GuardOutcome, b: GuardOutcome): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case "nav_error":
      return b.kind === "nav_error" && a.error === b.error;
    case "tenant_context_required":
      return b.kind === "tenant_context_required" && a.routePattern === b.routePattern;
    case "platform_context_required":
      return b.kind === "platform_context_required" && a.routePattern === b.routePattern;
    case "feature_disabled":
      return b.kind === "feature_disabled" && a.featureKey === b.featureKey;
    default:
      return true;
  }
}

function findAlternativeWorkspaceRoute(
  currentPath: string,
  currentMenuKey: string | undefined,
  canAccessPage: (path: string) => boolean,
  hasRouteAccess: (path: string) => boolean,
  requireNavAccess = true
): string | null {
  const workspaceRouteMap = useNavigationStore.getState().workspaceRouteMap || {};
  const isValidFallback = (candidate: string): boolean => {
    const normalizedCandidate = normalizeRoutePath(candidate);
    if (normalizedCandidate === currentPath) return false;
    if (!canAccessPage(normalizedCandidate)) return false;
    if (requireNavAccess && USE_DYNAMIC_NAVIGATION && !hasRouteAccess(normalizedCandidate)) {
      return false;
    }
    return true;
  };

  for (const routes of Object.values(workspaceRouteMap)) {
    const belongsToWorkspace = routes.some((r) => {
      const normR = normalizeRoutePath(r);
      return normR === currentPath || (currentMenuKey && normR === currentMenuKey);
    });
    if (belongsToWorkspace) {
      const sibling = routes.find(isValidFallback);
      if (sibling) return sibling;
    }
  }

  const allWorkspaceRoutes = Object.values(workspaceRouteMap).flat();
  return allWorkspaceRoutes.find(isValidFallback) ?? null;
}

function renderLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nx-ground">
      <LoadingSpinner />
    </div>
  );
}

export function RouteGuard({ children }: RouteGuardProps) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const subscriptionStatus = useAppStore((state) => state.subscriptionStatus);
  const mustChangePassword = useAppStore((state) => state.mustChangePassword);
  const username = useAppStore((state) => state.user?.username ?? "");

  const { activeTenantId } = useAdminContext();
  const { refreshNavigation } = useNavigation();
  const { authRepository } = useServices();
  const { canAccessPage } = usePermissions();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname() || "/";

  const routesLoaded = useNavigationStore((s) => s.routesLoaded);
  const routesContextKey = useNavigationStore((s) => s.routesContextKey);
  const routesError = useNavigationStore((s) => s.routesError);
  const isNavSyncedForContext = useCallback(
    (expectedKey?: string | null) =>
      useNavigationStore.getState().isNavSyncedForContext(expectedKey),
    []
  );
  const hasRouteAccess = useCallback(
    (p: string) => useNavigationStore.getState().hasRouteAccess(p),
    []
  );

  const authLoading = !hasHydrated;
  const normalizedPath = normalizeRoutePath(pathname);
  const manifestEntry = matchAppRoute(normalizedPath);
  const isDevBlockedInProd = Boolean(
    manifestEntry?.devOnly && process.env.NODE_ENV === "production"
  );
  const isPublicRoute = !isDevBlockedInProd && isManifestPublicRoute(normalizedPath);
  const isUnknownRoute = manifestEntry === null;
  const contextKey = `${activeTenantId ?? "platform"}:${username}`;
  const permissionsKey = useAppStore((state) => (state.permissions ?? []).join(","));

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientMountedSnapshot,
    getServerMountedSnapshot
  );
  const [checkTrigger, setCheckTrigger] = useState(0);

  const targetKey = [
    normalizedPath,
    contextKey,
    permissionsKey,
    isAuthenticated ? "1" : "0",
    subscriptionStatus ?? "",
    mustChangePassword ? "1" : "0",
    routesLoaded ? "1" : "0",
    routesContextKey ?? "",
    routesError ?? "",
    String(checkTrigger),
  ].join("::");

  const [settled, setSettled] = useState<{ targetKey: string; outcome: GuardOutcome }>({
    targetKey: "",
    outcome: { kind: "loading" },
  });

  const hasRedirected = useRef(false);
  const isRefreshing = useRef(false);

  // Store callback/service helpers in a ref synced after commit so unstable hook
  // references (e.g., fresh provider objects or test mocks) never re-trigger checkAccess.
  const latestDepsRef = useRef({
    canAccessPage,
    router,
    queryClient,
    authRepository,
    setAuth,
    setSubscriptionInfo,
    isNavSyncedForContext,
    hasRouteAccess,
  });

  useEffect(() => {
    latestDepsRef.current = {
      canAccessPage,
      router,
      queryClient,
      authRepository,
      setAuth,
      setSubscriptionInfo,
      isNavSyncedForContext,
      hasRouteAccess,
    };
  });

  // Reset redirect guard synchronously inside effect lifecycle on pathname or context switch
  useEffect(() => {
    hasRedirected.current = false;
  }, [normalizedPath, contextKey]);

  // Cross-tab token refresh coordination
  useEffect(() => {
    authBroadcast.onTokenRefreshed(() => {
      appLogger.debug("[RouteGuard] Observed cross-tab token refresh — re-checking access");
      setCheckTrigger((prev) => prev + 1);
    });
  }, []);

  useEffect(() => {
    if (!isMounted || authLoading) return;

    let cancelled = false;
    const commitOutcome = (outcome: GuardOutcome) => {
      if (!cancelled) {
        setSettled((prev) =>
          prev.targetKey === targetKey && outcomesEqual(prev.outcome, outcome)
            ? prev
            : { targetKey, outcome }
        );
      }
    };

    const checkAccess = async () => {
      const {
        canAccessPage: checkPagePermission,
        router: navRouter,
        queryClient: qClient,
        authRepository: authRepo,
        setAuth: commitAuth,
        setSubscriptionInfo: commitSubInfo,
        isNavSyncedForContext: checkNavSynced,
        hasRouteAccess: checkNavRoute,
      } = latestDepsRef.current;

      const hasToken = secureTokenService.hasToken();
      const isStandardAuthPage = STANDARD_AUTH_PAGES.has(normalizedPath);
      const isAuthPage = ALL_AUTH_PAGES.has(normalizedPath);

      // 0. Production gate for development-only routes (e.g., /sileo-playground)
      if (isDevBlockedInProd) {
        commitOutcome({ kind: "loading" });
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          navRouter.replace("/not-found");
        }
        return;
      }

      // 1. Authenticated user landing on standard auth pages -> safe redirect or dashboard
      if (isStandardAuthPage && hasToken && isAuthenticated) {
        appLogger.debug("[RouteGuard] Authenticated user on auth page → workspace");
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          const mcp = useAppStore.getState().mustChangePassword;
          const redirectParam =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("redirect")
              : null;
          const safeRedirect = isSafeRedirectTarget(redirectParam) ? redirectParam : null;
          const rawDefault = useAppStore.getState().defaultRedirectPath;

          let targetPath =
            safeRedirect || (!rawDefault || rawDefault === "/" ? "/overview" : rawDefault);

          if (targetPath === "/overview" && !checkPagePermission("/overview")) {
            targetPath =
              findAlternativeWorkspaceRoute(
                "/overview",
                undefined,
                checkPagePermission,
                checkNavRoute,
                true
              ) || "/hub";
          }

          navRouter.replace(mcp ? "/change-password" : targetPath);
        }
        commitOutcome({ kind: "loading" });
        return;
      }

      // 2. Public manifest routes (always allowed without auth unless Case 2 silent refresh applies)
      if (isPublicRoute) {
        const needsSilentRefreshOnAuthPage = isStandardAuthPage && !hasToken && isAuthenticated;
        if (!needsSilentRefreshOnAuthPage) {
          commitOutcome({ kind: "allow" });
          return;
        }
      }

      // 3. Unknown routes (not in APP_ROUTE_MANIFEST) pass through so Next.js renders 404 cleanly
      if (isUnknownRoute) {
        commitOutcome({ kind: "allow" });
        return;
      }

      if (hasRedirected.current) {
        commitOutcome({ kind: "loading" });
        return;
      }

      // 4. Case 2: No access token in memory, store still flagged authenticated -> silent refresh
      if (!hasToken && isAuthenticated) {
        if (isRefreshing.current) {
          commitOutcome({ kind: "loading" });
          return;
        }
        isRefreshing.current = true;
        appLogger.debug("[RouteGuard] No token, store=authenticated → silent refresh");

        try {
          const result = await authRepo.refreshToken();
          if (result.kind === "ok") {
            appLogger.debug("[RouteGuard] Silent refresh succeeded");
            const refreshData = result.value;
            commitSubInfo(
              refreshData.subscriptionStatus ?? null,
              refreshData.gracePhase ?? null,
              refreshData.editionName ?? null
            );
            useAppStore
              .getState()
              .setMustChangePassword(refreshData.mustChangePassword ?? false);

            const user = await authRepo.getCurrentPrincipal();
            if (user && user.id) {
              const resolvedPermissions = (user.permissions ?? []) as any[];
              const resolvedRoles = user.roles ?? [];
              commitAuth(user, resolvedPermissions, resolvedRoles);
              isRefreshing.current = false;
              if (!cancelled) {
                setCheckTrigger((prev) => prev + 1);
              }
              return;
            }
          }
        } catch (error) {
          appLogger.error("[RouteGuard] Silent refresh failed:", error);
        }

        // Cross-tab recovery if another tab already rotated the refresh cookie and populated a token
        if (secureTokenService.hasToken() && useAppStore.getState().isAuthenticated) {
          appLogger.debug(
            "[RouteGuard] Own refresh failed but cross-tab refresh succeeded — recovering"
          );
          isRefreshing.current = false;
          if (!cancelled) {
            setCheckTrigger((prev) => prev + 1);
          }
          return;
        }

        isRefreshing.current = false;
        appLogger.debug("[RouteGuard] Session expired → /login");

        forceLogout();
        qClient.clear();

        if (!isAuthPage && !hasRedirected.current) {
          hasRedirected.current = true;
          navRouter.push(buildLoginRedirectUrl(normalizedPath));
          commitOutcome({ kind: "loading" });
        } else {
          commitOutcome({ kind: "allow" });
        }
        return;
      }

      // 5. Case 3: No token + not authenticated -> /login?redirect=...
      if (!hasToken && !isAuthenticated) {
        if (!isAuthPage && !hasRedirected.current) {
          appLogger.debug("[RouteGuard] Not authenticated → /login");
          hasRedirected.current = true;
          forceLogout();
          navRouter.push(buildLoginRedirectUrl(normalizedPath));
        } else if (isAuthPage) {
          commitOutcome({ kind: "allow" });
          return;
        }
        commitOutcome({ kind: "loading" });
        return;
      }

      // 6. Case 4: Token exists, store NOT authenticated -> restore principal cleanly
      if (hasToken && !isAuthenticated) {
        appLogger.debug("[RouteGuard] Token exists, store empty → restoring session");
        try {
          const user = await authRepo.getCurrentPrincipal();
          if (user && user.id) {
            appLogger.debug("[RouteGuard] Session restored");
            const resolvedPermissions = (user.permissions ?? []) as any[];
            const resolvedRoles = user.roles ?? [];
            commitAuth(user, resolvedPermissions, resolvedRoles);
            if (!cancelled) {
              setCheckTrigger((prev) => prev + 1);
            }
            return;
          }
        } catch (error) {
          appLogger.error("[RouteGuard] Session restore failed:", error);
        }

        // Null principal or thrown error both terminate cleanly with redirect + cache cleanup
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          forceLogout();
          qClient.clear();
          navRouter.push(buildLoginRedirectUrl(normalizedPath));
        }
        commitOutcome({ kind: "loading" });
        return;
      }

      // 7. Case 1: Authenticated with token
      // 7a. PendingPayment lock wall
      if (subscriptionStatus === "PendingPayment") {
        if (normalizedPath !== "/activate-workspace") {
          appLogger.debug("[RouteGuard] Pending payment status → /activate-workspace");
          hasRedirected.current = true;
          navRouter.replace("/activate-workspace");
          commitOutcome({ kind: "loading" });
          return;
        }
        commitOutcome({ kind: "allow" });
        return;
      }

      // 7b. Forced password change wall
      if (mustChangePassword && normalizedPath !== "/change-password") {
        appLogger.debug("[RouteGuard] Must change password → /change-password");
        hasRedirected.current = true;
        navRouter.replace("/change-password");
        commitOutcome({ kind: "loading" });
        return;
      }

      // 7c. Shell-authenticated routes (non-module pages mapped to `[]` in PAGE_PERMISSIONS)
      if (manifestEntry.binding === "shell_authenticated") {
        if (!checkPagePermission(normalizedPath)) {
          hasRedirected.current = true;
          navRouter.push("/not-authorized");
          commitOutcome({ kind: "loading" });
          return;
        }
        commitOutcome({ kind: "allow" });
        return;
      }

      // 7d. Dynamic navigation synchronization gate for menu_bound routes (NEVER fail-open)
      if (USE_DYNAMIC_NAVIGATION) {
        if (routesError) {
          commitOutcome({ kind: "nav_error", error: routesError });
          return;
        }

        if (!checkNavSynced(contextKey)) {
          commitOutcome({ kind: "loading" });
          return;
        }
      }

      // 7e. Fail-closed PBAC check (`canAccessPage` returns false on missing/unmatched entries)
      if (!checkPagePermission(normalizedPath)) {
        appLogger.debug("[RouteGuard] Access denied by fail-closed PBAC");
        const fallback = findAlternativeWorkspaceRoute(
          normalizedPath,
          manifestEntry.menuRouteKey,
          checkPagePermission,
          checkNavRoute,
          true
        );
        if (fallback) {
          hasRedirected.current = true;
          navRouter.replace(fallback);
          commitOutcome({ kind: "loading" });
          return;
        }
        hasRedirected.current = true;
        navRouter.push("/not-authorized");
        commitOutcome({ kind: "loading" });
        return;
      }

      // 7f. Context & Feature Entitlement gates (rendered in DashboardLayout WITHOUT mounting children)
      if (USE_DYNAMIC_NAVIGATION) {
        const descriptor = useNavigationStore.getState().getRouteDescriptor(normalizedPath);

        if (
          descriptor?.accessState === "tenant_context_required" ||
          (!descriptor && manifestEntry.requiresTenantContext && !activeTenantId)
        ) {
          commitOutcome({
            kind: "tenant_context_required",
            routePattern: descriptor?.route ?? manifestEntry.pattern,
          });
          return;
        }

        if (descriptor?.accessState === "platform_context_required") {
          commitOutcome({
            kind: "platform_context_required",
            routePattern: descriptor?.route ?? manifestEntry.pattern,
          });
          return;
        }

        if (descriptor?.accessState === "feature_disabled") {
          commitOutcome({
            kind: "feature_disabled",
            featureKey: descriptor.requiredFeature ?? null,
          });
          return;
        }

        // 7g. Navigation Store menu membership gate (menu_bound route must be authorized)
        if (!checkNavRoute(normalizedPath)) {
          appLogger.debug("[RouteGuard] Access denied by navigation store");
          const fallback = findAlternativeWorkspaceRoute(
            normalizedPath,
            manifestEntry.menuRouteKey,
            checkPagePermission,
            checkNavRoute,
            true
          );
          if (fallback) {
            hasRedirected.current = true;
            navRouter.replace(fallback);
            commitOutcome({ kind: "loading" });
            return;
          }
          hasRedirected.current = true;
          navRouter.push("/not-authorized");
          commitOutcome({ kind: "loading" });
          return;
        }
      }

      commitOutcome({ kind: "allow" });
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [
    isMounted,
    authLoading,
    targetKey,
    normalizedPath,
    manifestEntry,
    isDevBlockedInProd,
    isPublicRoute,
    isUnknownRoute,
    contextKey,
    activeTenantId,
    isAuthenticated,
    subscriptionStatus,
    mustChangePassword,
    routesError,
  ]);

  const handleRetryNavigation = useCallback(() => {
    setCheckTrigger((prev) => prev + 1);
    refreshNavigation();
  }, [refreshNavigation]);

  // SSR & client pre-mount gate: NEVER render protected routes before hydration/check settles
  if (!isMounted) {
    if (isPublicRoute || isUnknownRoute) {
      return <>{children}</>;
    }
    return renderLoadingScreen();
  }

  if (authLoading) {
    if (isPublicRoute || isUnknownRoute) {
      return <>{children}</>;
    }
    return renderLoadingScreen();
  }

  // Synchronous transition gate: if targetKey changed since last settled outcome, block 1-frame flash
  const effectiveOutcome: GuardOutcome =
    settled.targetKey === targetKey ? settled.outcome : { kind: "loading" };

  switch (effectiveOutcome.kind) {
    case "allow":
      return <>{children}</>;

    case "nav_error":
      return (
        <NavigationErrorRecovery
          error={effectiveOutcome.error}
          onRetry={handleRetryNavigation}
        />
      );

    case "tenant_context_required":
      return (
        <DashboardLayout>
          <TenantContextRequiredGate routePattern={effectiveOutcome.routePattern} />
        </DashboardLayout>
      );

    case "platform_context_required":
      return (
        <DashboardLayout>
          <PlatformContextRequiredGate routePattern={effectiveOutcome.routePattern} />
        </DashboardLayout>
      );

    case "feature_disabled":
      return (
        <DashboardLayout>
          <FeatureUnavailableGate featureKey={effectiveOutcome.featureKey} />
        </DashboardLayout>
      );

    case "loading":
    default:
      return renderLoadingScreen();
  }
}
