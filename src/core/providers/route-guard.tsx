"use client";

/**
 * RouteGuard (v3.1 — Synchronous Fail-Closed Security & Zero-Blank-Flash Gate)
 *
 * Enforces unified fail-closed route security & contextual access control:
 *  1. SSR + client pre-mount gate: never renders protected `{children}` before
 *     client mount or store hydration (`!isMounted || authLoading`).
 *  2. Synchronous route authorization during render (`resolveRouteAccessSync`):
 *     intra-context navigations between authorized routes (e.g. `/account/integrations`
 *     -> `/account/integrations/new` or `/overview` -> `/crm`) resolve `"allow"` on the
 *     very first render without resetting to `loading` or unmounting persistent layouts,
 *     while unauthorized transitions still block children synchronously (zero flash).
 *  3. Authoritative manifest (`APP_ROUTE_MANIFEST`): zero `SYSTEM_PAGES` or module
 *     prefix bypasses, production blocking for `devOnly` routes, and clean 404
 *     pass-through for unknown paths.
 *  4. Auth matrix (token x store state) with `?redirect=` preservation validated
 *     by `isSafeRedirectTarget`, non-leaking principal restoration, and complete
 *     `forceLogout()` cleanup (`app-storage` + nav store + tokens).
 *  5. Fail-closed PBAC (`canAccessPage`) + synced navigation (`isNavSyncedForContext`)
 *     + explicit `NavigationErrorRecovery` (never fail-open).
 *  6. Backend/manifest context & entitlement gates (`TenantContextRequiredGate`,
 *     `PlatformContextRequiredGate`, `FeatureUnavailableGate`) rendered inside
 *     `<DashboardLayout>` without mounting the blocked page component.
 */

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
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
  type AppRouteManifestEntry,
} from "@core/config/app-route-manifest";
import type { AuthorizedRouteDescriptor } from "@core/navigation/domain/interfaces/INavigationRepository";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
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
import { isSafeRedirectTarget, buildPostAuthEntryUrl } from "@core/common/redirect-safety";

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

type RedirectReason =
  | "dev_blocked"
  | "auth_to_workspace"
  | "login"
  | "pending_payment"
  | "must_change_password"
  | "require_mfa_enrollment"
  | "shell_pbac_denied"
  | "menu_pbac_denied"
  | "nav_denied";

type RouteResolution =
  | { kind: "settled"; outcome: GuardOutcome }
  | { kind: "redirect"; reason: RedirectReason }
  | { kind: "async_refresh_token"; isAuthPage: boolean }
  | { kind: "async_restore_principal" };

interface ResolveRouteAccessParams {
  normalizedPath: string;
  manifestEntry: AppRouteManifestEntry | null;
  isDevBlockedInProd: boolean;
  isPublicRoute: boolean;
  isUnknownRoute: boolean;
  contextKey: string;
  activeTenantId: string | null;
  isAuthenticated: boolean;
  isAuthTransitioning?: boolean;
  hasUser?: boolean;
  hasToken: boolean;
  subscriptionStatus: string | null;
  mustChangePassword: boolean;
  requireMfaEnrollment?: boolean;
  routesError: string | null;
  canAccessPage: (path: string) => boolean;
  isNavSyncedForContext: (expectedKey?: string | null) => boolean;
  getRouteDescriptor: (path: string) => AuthorizedRouteDescriptor | null;
  hasRouteAccess: (path: string) => boolean;
}

const STANDARD_AUTH_PAGES = new Set(["/login", "/signup"]);

const MFA_ENROLL_ALLOWED_ROUTES = new Set(["/account/security", "/logout", "/change-password"]);

const ALL_AUTH_PAGES = new Set([
  ...STANDARD_AUTH_PAGES,
  "/forgot-password",
  "/reset-password",
  "/magic-link",
  "/qr-approve",
  "/sso/callback",
  "/sso/saml/callback",
]);

function forceLogout() {
  secureTokenService.clearTokens();
  useNavigationStore.getState().reset();
  useSudoStore.getState().reset();
  usePatOneTimeSecretStore.getState().clearPendingReceipt();
  useAppStore.getState().logout();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.APP_STORE);
    } catch {
      // Ignore storage access errors in restricted browsing contexts
    }
  }
  appLogger.debug("[RouteGuard] Forced logout — cleared tokens, nav store, sudo/pat stores, and app-storage");
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

function findRoutesForWorkspace(
  workspaceRouteMap: Record<string, string[]>,
  workspaceKey: string
): string[] {
  if (Object.prototype.hasOwnProperty.call(workspaceRouteMap, workspaceKey)) {
    return workspaceRouteMap[workspaceKey] ?? [];
  }
  const lowerKey = workspaceKey.toLowerCase();
  for (const [key, routes] of Object.entries(workspaceRouteMap)) {
    if (key.toLowerCase() === lowerKey) {
      return routes ?? [];
    }
  }
  return [];
}

function resolveOwningWorkspaceKey(
  currentPath: string,
  currentMenuKey: string | undefined,
  routeDescriptors: Map<string, AuthorizedRouteDescriptor>,
  workspaceRouteMap: Record<string, string[]>,
  workspaceGroups: WorkspaceGroup[]
): string | null {
  // 1. Authoritative routeDescriptor ownership (exact path or manifest menuRouteKey)
  const exactDescriptor = routeDescriptors.get(currentPath);
  if (exactDescriptor?.workspaceKey) {
    return exactDescriptor.workspaceKey;
  }
  const normalizedMenuKey = currentMenuKey ? normalizeRoutePath(currentMenuKey) : null;
  if (normalizedMenuKey) {
    const menuDescriptor = routeDescriptors.get(normalizedMenuKey);
    if (menuDescriptor?.workspaceKey) {
      return menuDescriptor.workspaceKey;
    }
  }

  // 2. Exact membership in workspaceRouteMap
  for (const [wsKey, routes] of Object.entries(workspaceRouteMap)) {
    if (
      routes.some((r) => {
        const normR = normalizeRoutePath(r);
        return normR === currentPath || (normalizedMenuKey && normR === normalizedMenuKey);
      })
    ) {
      return wsKey;
    }
  }

  // 3. WorkspaceGroup homeRoute / platformHomeRoute / effectiveHomeRoute match
  //    (handles denied HomeRoutes such as /crm that are omitted from workspaceRouteMap)
  for (const ws of workspaceGroups) {
    const candidateHomes = [ws.effectiveHomeRoute, ws.platformHomeRoute, ws.homeRoute]
      .filter((r): r is string => Boolean(r && r.trim()))
      .map((r) => normalizeRoutePath(r));
    if (
      candidateHomes.includes(currentPath) ||
      (normalizedMenuKey && candidateHomes.includes(normalizedMenuKey))
    ) {
      return ws.workspaceKey;
    }
  }

  // 4. Segment/prefix ownership against known workspaces, routeMap, or descriptors
  const firstSeg = (normalizedMenuKey ?? currentPath).split("/").filter(Boolean)[0]?.toLowerCase();
  if (firstSeg) {
    const matchingGroup = workspaceGroups.find(
      (ws) => ws.workspaceKey.toLowerCase() === firstSeg
    );
    if (matchingGroup) {
      return matchingGroup.workspaceKey;
    }

    const prefix = `/${firstSeg}/`;
    for (const [wsKey, routes] of Object.entries(workspaceRouteMap)) {
      if (wsKey.toLowerCase() === firstSeg) {
        return wsKey;
      }
      if (routes.some((r) => normalizeRoutePath(r).toLowerCase().startsWith(prefix))) {
        return wsKey;
      }
    }

    for (const descriptor of routeDescriptors.values()) {
      if (
        descriptor.workspaceKey &&
        (descriptor.workspaceKey.toLowerCase() === firstSeg ||
          normalizeRoutePath(descriptor.route).toLowerCase().startsWith(prefix))
      ) {
        return descriptor.workspaceKey;
      }
    }
  }

  return null;
}

function findAlternativeWorkspaceRoute(
  currentPath: string,
  currentMenuKey: string | undefined,
  canAccessPage: (path: string) => boolean,
  hasRouteAccess: (path: string) => boolean,
  requireNavAccess = true
): string | null {
  const navState = useNavigationStore.getState();
  const workspaceRouteMap = navState.workspaceRouteMap || {};
  const routeDescriptors =
    navState.routeDescriptors instanceof Map ? navState.routeDescriptors : new Map();
  const workspaceGroups = Array.isArray(navState.workspaceGroups) ? navState.workspaceGroups : [];

  const isValidFallback = (candidate: string): boolean => {
    const normalizedCandidate = normalizeRoutePath(candidate);
    if (normalizedCandidate === currentPath) return false;
    if (!canAccessPage(normalizedCandidate)) return false;
    if (requireNavAccess && USE_DYNAMIC_NAVIGATION && !hasRouteAccess(normalizedCandidate)) {
      return false;
    }
    return true;
  };

  const owningWorkspaceKey = resolveOwningWorkspaceKey(
    currentPath,
    currentMenuKey,
    routeDescriptors,
    workspaceRouteMap,
    workspaceGroups
  );

  if (owningWorkspaceKey) {
    const owningGroup = workspaceGroups.find(
      (ws) => ws.workspaceKey.toLowerCase() === owningWorkspaceKey.toLowerCase()
    );
    if (owningGroup?.effectiveHomeRoute && isValidFallback(owningGroup.effectiveHomeRoute)) {
      return normalizeRoutePath(owningGroup.effectiveHomeRoute);
    }

    const sameWorkspaceRoutes = findRoutesForWorkspace(workspaceRouteMap, owningWorkspaceKey);
    const sameWorkspaceFallback = sameWorkspaceRoutes.find(isValidFallback);
    if (sameWorkspaceFallback) {
      return sameWorkspaceFallback;
    }
  }

  // Never bounce into an unrelated workspace. When other authorized destinations exist
  // (e.g. another workspace or unlocked Hub access), route cleanly to /hub; otherwise fail closed.
  const hasAnyAuthorizedRoute =
    Object.values(workspaceRouteMap).flat().some(isValidFallback) ||
    workspaceGroups.some((ws) => !ws.isLocked && ws.accessibleItemCount > 0);
  if (hasAnyAuthorizedRoute && currentPath !== "/hub" && canAccessPage("/hub")) {
    return "/hub";
  }

  return null;
}

/**
 * Pure synchronous route authorization evaluator executed during render so valid
 * intra-context transitions resolve immediately without unmounting persistent shells.
 */
function resolveRouteAccessSync({
  normalizedPath,
  manifestEntry,
  isDevBlockedInProd,
  isPublicRoute,
  isUnknownRoute,
  contextKey,
  activeTenantId,
  isAuthenticated,
  isAuthTransitioning = false,
  hasUser = true,
  hasToken,
  subscriptionStatus,
  mustChangePassword,
  requireMfaEnrollment = false,
  routesError,
  canAccessPage,
  isNavSyncedForContext,
  getRouteDescriptor,
  hasRouteAccess,
}: ResolveRouteAccessParams): RouteResolution {
  const isStandardAuthPage = STANDARD_AUTH_PAGES.has(normalizedPath);
  const isAuthPage = ALL_AUTH_PAGES.has(normalizedPath);

  // 0. Production gate for development-only routes (e.g., /sileo-playground)
  if (isDevBlockedInProd) {
    return { kind: "redirect", reason: "dev_blocked" };
  }

  // 0b. Identity swap / impersonation transition in progress -> hold loading until reload completes
  if (isAuthTransitioning) {
    return { kind: "settled", outcome: { kind: "loading" } };
  }

  // 1. Authenticated user landing on standard auth pages -> safe redirect or dashboard
  if (isStandardAuthPage && hasToken && isAuthenticated) {
    return { kind: "redirect", reason: "auth_to_workspace" };
  }

  // 2. Public manifest routes (always allowed without auth unless Case 2 silent refresh applies)
  if (isPublicRoute) {
    const needsSilentRefreshOnAuthPage = isStandardAuthPage && !hasToken && isAuthenticated;
    if (!needsSilentRefreshOnAuthPage) {
      return { kind: "settled", outcome: { kind: "allow" } };
    }
  }

  // 3. Unknown routes (not in APP_ROUTE_MANIFEST) pass through so Next.js renders 404 cleanly
  if (isUnknownRoute) {
    return { kind: "settled", outcome: { kind: "allow" } };
  }

  // 4. Case 2: No access token in memory, store still flagged authenticated -> silent refresh
  if (!hasToken && isAuthenticated) {
    return { kind: "async_refresh_token", isAuthPage };
  }

  // 5. Case 3: No token + not authenticated -> /login?redirect=... (or allow auth pages)
  if (!hasToken && !isAuthenticated) {
    if (isAuthPage) {
      return { kind: "settled", outcome: { kind: "allow" } };
    }
    return { kind: "redirect", reason: "login" };
  }

  // 6. Case 4: Token exists, store NOT authenticated (or principal cleared during identity transition) -> restore principal cleanly
  if (hasToken && (!isAuthenticated || !hasUser)) {
    return { kind: "async_restore_principal" };
  }

  // 7. Case 1: Authenticated with token
  // 7a. PendingPayment lock wall
  if (subscriptionStatus === "PendingPayment") {
    if (normalizedPath !== "/activate-workspace") {
      return { kind: "redirect", reason: "pending_payment" };
    }
    return { kind: "settled", outcome: { kind: "allow" } };
  }

  // 7b. Forced password change wall
  if (mustChangePassword && normalizedPath !== "/change-password") {
    return { kind: "redirect", reason: "must_change_password" };
  }

  // 7b2. Mandatory MFA enrollment wall (runs after mcp=true so forced rotation completes first)
  if (requireMfaEnrollment && !MFA_ENROLL_ALLOWED_ROUTES.has(normalizedPath)) {
    return { kind: "redirect", reason: "require_mfa_enrollment" };
  }

  // 7c. Shell-authenticated routes (non-module & Account World routes)
  if (manifestEntry?.binding === "shell_authenticated") {
    if (!canAccessPage(normalizedPath)) {
      return { kind: "redirect", reason: "shell_pbac_denied" };
    }
    if (manifestEntry.requiresTenantContext && !activeTenantId) {
      return {
        kind: "settled",
        outcome: {
          kind: "tenant_context_required",
          routePattern: manifestEntry.pattern,
        },
      };
    }
    return { kind: "settled", outcome: { kind: "allow" } };
  }

  // 7d. Dynamic navigation synchronization gate for menu_bound routes (NEVER fail-open)
  if (USE_DYNAMIC_NAVIGATION) {
    if (routesError) {
      return { kind: "settled", outcome: { kind: "nav_error", error: routesError } };
    }
    if (!isNavSyncedForContext(contextKey)) {
      return { kind: "settled", outcome: { kind: "loading" } };
    }
  }

  // 7e. Fail-closed PBAC check (`canAccessPage` returns false on missing/unmatched entries)
  if (!canAccessPage(normalizedPath)) {
    return { kind: "redirect", reason: "menu_pbac_denied" };
  }

  // 7f. Context & Feature Entitlement gates (rendered in DashboardLayout WITHOUT mounting children)
  if (USE_DYNAMIC_NAVIGATION) {
    const descriptor = getRouteDescriptor(normalizedPath);

    if (
      descriptor?.accessState === "tenant_context_required" ||
      (!descriptor && manifestEntry?.requiresTenantContext && !activeTenantId)
    ) {
      return {
        kind: "settled",
        outcome: {
          kind: "tenant_context_required",
          routePattern: descriptor?.route ?? manifestEntry?.pattern,
        },
      };
    }

    if (descriptor?.accessState === "platform_context_required") {
      return {
        kind: "settled",
        outcome: {
          kind: "platform_context_required",
          routePattern: descriptor?.route ?? manifestEntry?.pattern,
        },
      };
    }

    if (descriptor?.accessState === "feature_disabled") {
      return {
        kind: "settled",
        outcome: {
          kind: "feature_disabled",
          featureKey: descriptor.requiredFeature ?? null,
        },
      };
    }

    // 7g. Navigation Store menu membership gate (menu_bound route must be authorized)
    if (!hasRouteAccess(normalizedPath)) {
      return { kind: "redirect", reason: "nav_denied" };
    }
  }

  return { kind: "settled", outcome: { kind: "allow" } };
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
  const isAuthTransitioning = useAppStore((state) => state.isAuthTransitioning ?? false);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const subscriptionStatus = useAppStore((state) => state.subscriptionStatus);
  const mustChangePassword = useAppStore((state) => state.mustChangePassword);
  const requireMfaEnrollment = useAppStore((state) => state.requireMfaEnrollment);
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
  const routesLoadedAt = useNavigationStore((s) => s.routesLoadedAt);
  const isNavSyncedForContext = useCallback(
    (expectedKey?: string | null) =>
      useNavigationStore.getState().isNavSyncedForContext(expectedKey),
    []
  );
  const getRouteDescriptor = useCallback(
    (p: string) => useNavigationStore.getState().getRouteDescriptor(p),
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
  const [failedAuthPageRefreshKey, setFailedAuthPageRefreshKey] = useState<string | null>(null);

  const targetKey = [
    normalizedPath,
    contextKey,
    permissionsKey,
    isAuthenticated ? "1" : "0",
    subscriptionStatus ?? "",
    mustChangePassword ? "1" : "0",
    requireMfaEnrollment ? "1" : "0",
    routesLoaded ? "1" : "0",
    routesContextKey ?? "",
    routesError ?? "",
    String(routesLoadedAt ?? ""),
    String(checkTrigger),
  ].join("::");

  const hasRedirected = useRef(false);
  const isRefreshing = useRef(false);

  // Store callback/service helpers in a ref synced after commit so unstable hook
  // references (e.g., fresh provider objects or test mocks) never re-trigger effects.
  const latestDepsRef = useRef({
    canAccessPage,
    router,
    queryClient,
    authRepository,
    setAuth,
    setSubscriptionInfo,
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
      hasRouteAccess,
    };
  });

  // Reset redirect guard synchronously inside effect lifecycle on pathname or context switch
  useEffect(() => {
    hasRedirected.current = false;
  }, [normalizedPath, contextKey]);

  // Cross-tab token refresh and in-memory token store coordination
  useEffect(() => {
    authBroadcast.onTokenRefreshed(() => {
      appLogger.debug("[RouteGuard] Observed cross-tab token refresh — re-checking access");
      setCheckTrigger((prev) => prev + 1);
    });
    if (typeof secureTokenService.subscribe === "function") {
      return secureTokenService.subscribe(() => {
        setCheckTrigger((prev) => prev + 1);
      });
    }
  }, []);

  const tokenExpired =
    isMounted &&
    !authLoading &&
    typeof secureTokenService.isTokenExpired === "function" &&
    secureTokenService.isTokenExpired();

  const hasToken = isMounted && !authLoading && !tokenExpired ? secureTokenService.hasToken() : false;

  const resolution: RouteResolution =
    isMounted && !authLoading
      ? resolveRouteAccessSync({
          normalizedPath,
          manifestEntry,
          isDevBlockedInProd,
          isPublicRoute,
          isUnknownRoute,
          contextKey,
          activeTenantId,
          isAuthenticated,
          isAuthTransitioning,
          hasUser: Boolean(username),
          hasToken,
          subscriptionStatus,
          mustChangePassword,
          requireMfaEnrollment,
          routesError,
          canAccessPage,
          isNavSyncedForContext,
          getRouteDescriptor,
          hasRouteAccess,
        })
      : { kind: "settled", outcome: { kind: "loading" } };

  const resolutionKind = resolution.kind;
  const redirectReason = resolution.kind === "redirect" ? resolution.reason : null;
  const asyncIsAuthPage =
    resolution.kind === "async_refresh_token" ? resolution.isAuthPage : false;
  const menuRouteKey = manifestEntry?.menuRouteKey;

  useEffect(() => {
    if (!isMounted || authLoading) return;

    // Ensure expired tokens are cleared in effect scope rather than during render.
    if (tokenExpired) {
      secureTokenService.hasToken();
    }

    if (resolutionKind === "settled") return;

    let cancelled = false;
    const {
      canAccessPage: checkPagePermission,
      router: navRouter,
      queryClient: qClient,
      authRepository: authRepo,
      setAuth: commitAuth,
      setSubscriptionInfo: commitSubInfo,
      hasRouteAccess: checkNavRoute,
    } = latestDepsRef.current;

    const runSideEffects = async () => {
      if (hasRedirected.current) return;

      if (resolutionKind === "redirect" && redirectReason !== null) {
        hasRedirected.current = true;
        switch (redirectReason) {
          case "dev_blocked":
            navRouter.replace("/not-found");
            return;
          case "auth_to_workspace": {
            appLogger.debug("[RouteGuard] Authenticated user on auth page → workspace");
            const appState = useAppStore.getState();
            const redirectParam =
              typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("redirect")
                : null;
            const targetPath = buildPostAuthEntryUrl({
              mustChangePassword: appState.mustChangePassword,
              requireMfaEnrollment: appState.requireMfaEnrollment,
              subscriptionStatus: appState.subscriptionStatus,
              redirect: redirectParam,
            });

            if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
              window.location.href = targetPath;
            } else {
              navRouter.replace(targetPath);
            }
            return;
          }
          case "login":
            appLogger.debug("[RouteGuard] Not authenticated → /login");
            forceLogout();
            navRouter.push(buildLoginRedirectUrl(normalizedPath));
            return;
          case "pending_payment":
            appLogger.debug("[RouteGuard] Pending payment status → /activate-workspace");
            navRouter.replace("/activate-workspace");
            return;
          case "must_change_password":
            appLogger.debug("[RouteGuard] Must change password → /change-password");
            navRouter.replace("/change-password");
            return;
          case "require_mfa_enrollment":
            appLogger.debug("[RouteGuard] Mandatory MFA enrollment → /account/security");
            navRouter.replace("/account/security?mfa_enroll=true");
            return;
          case "shell_pbac_denied":
            navRouter.push("/not-authorized");
            return;
          case "menu_pbac_denied":
          case "nav_denied": {
            appLogger.debug(
              redirectReason === "menu_pbac_denied"
                ? "[RouteGuard] Access denied by fail-closed PBAC"
                : "[RouteGuard] Access denied by navigation store"
            );
            const fallback = findAlternativeWorkspaceRoute(
              normalizedPath,
              menuRouteKey,
              checkPagePermission,
              checkNavRoute,
              true
            );
            if (fallback) {
              navRouter.replace(fallback);
              return;
            }
            navRouter.push("/not-authorized");
            return;
          }
        }
      }

      if (resolutionKind === "async_refresh_token") {
        if (isRefreshing.current) return;
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
            const appStoreState = useAppStore.getState();
            appStoreState.setMustChangePassword(refreshData.mustChangePassword ?? false);
            appStoreState.setRequireMfaEnrollment?.(refreshData.requireMfaEnrollment ?? false);

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

        if (!asyncIsAuthPage && !hasRedirected.current) {
          hasRedirected.current = true;
          navRouter.push(buildLoginRedirectUrl(normalizedPath));
        } else if (!cancelled && asyncIsAuthPage) {
          setFailedAuthPageRefreshKey(targetKey);
        }
        return;
      }

      if (resolutionKind === "async_restore_principal") {
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

        if (!hasRedirected.current) {
          hasRedirected.current = true;
          forceLogout();
          qClient.clear();
          navRouter.push(buildLoginRedirectUrl(normalizedPath));
        }
      }
    };

    void runSideEffects();

    return () => {
      cancelled = true;
    };
  }, [
    isMounted,
    authLoading,
    tokenExpired,
    targetKey,
    resolutionKind,
    redirectReason,
    asyncIsAuthPage,
    normalizedPath,
    menuRouteKey,
  ]);

  const handleRetryNavigation = () => {
    setCheckTrigger((prev) => prev + 1);
    refreshNavigation();
  };

  // SSR & client pre-mount gate: NEVER render protected routes before hydration/check settles
  if (!isMounted || authLoading) {
    if (isPublicRoute || isUnknownRoute) {
      return <>{children}</>;
    }
    return renderLoadingScreen();
  }

  const effectiveOutcome: GuardOutcome =
    resolution.kind === "settled"
      ? resolution.outcome
      : resolution.kind === "async_refresh_token" &&
          resolution.isAuthPage &&
          failedAuthPageRefreshKey === targetKey
        ? { kind: "allow" }
        : { kind: "loading" };

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
