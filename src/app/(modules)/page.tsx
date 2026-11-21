"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useNavigation } from "@core/providers/navigation-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { extractEligibleDeepLink, getSafeRedirectPath } from "@core/common/redirect-safety";
import { matchAppRoute, normalizeRoutePath } from "@core/config/app-route-manifest";
import { NavigationErrorRecovery } from "@core/components/tenant-context";
import { ModulesLoadingSkeleton } from "@core/ui/layout/modules-loading-skeleton";

function HomePageResolver() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshNavigation } = useNavigation();
  const { canAccessPage } = usePermissions();
  const { activeTenantId } = useAdminContext();
  const username = useAppStore((s) => s.user?.username ?? "");
  const contextKey = `${activeTenantId ?? "platform"}:${username}`;

  const routesError = useNavigationStore((s) => s.routesError);
  const routesLoaded = useNavigationStore((s) => s.routesLoaded);
  const routesContextKey = useNavigationStore((s) => s.routesContextKey);
  const isInitialLoading = useNavigationStore((s) => s.isInitialLoading);
  const landingResolution = useNavigationStore((s) => s.landingResolution);
  const hasRouteAccess = useNavigationStore((s) => s.hasRouteAccess);
  const getRouteDescriptor = useNavigationStore((s) => s.getRouteDescriptor);

  const isNavSynced =
    routesLoaded &&
    routesError === null &&
    routesContextKey === contextKey &&
    !isInitialLoading;

  const hasRedirectedRef = useRef(false);
  const lastRedirectKeyRef = useRef<string>("");

  useEffect(() => {
    if (routesError) {
      hasRedirectedRef.current = false;
      return;
    }

    if (!isNavSynced) return;

    const rawRedirect = searchParams.get("redirect");
    const resolveKey = `${contextKey}::${rawRedirect ?? ""}::${landingResolution?.route ?? ""}`;
    if (hasRedirectedRef.current && lastRedirectKeyRef.current === resolveKey) {
      return;
    }

    // Tier 1: Authorized explicit deep-link (?redirect=) takes precedence over Role IsLandingEnforced
    const eligible = extractEligibleDeepLink(rawRedirect);
    if (eligible && eligible.startsWith("/") && !eligible.startsWith("//")) {
      const normalizedTarget = normalizeRoutePath(eligible);
      const descriptor = getRouteDescriptor(normalizedTarget);
      const manifestEntry = matchAppRoute(normalizedTarget);
      const passesContext = !(manifestEntry?.requiresTenantContext && !activeTenantId);
      const isAuthorized =
        canAccessPage(normalizedTarget) &&
        hasRouteAccess(normalizedTarget) &&
        passesContext &&
        (!descriptor || descriptor.accessState === "authorized");

      if (isAuthorized) {
        hasRedirectedRef.current = true;
        lastRedirectKeyRef.current = resolveKey;
        if (normalizedTarget.toLowerCase() === "/hub") {
          useNavigationStore.getState().setActiveWorkspace(null);
        }
        router.replace(eligible);
        return;
      }
    }

    // Tiers 2–5: Backend-resolved landing destination (or safe /hub fallback)
    const rawLanding = landingResolution?.route;
    const safeLanding = rawLanding ? getSafeRedirectPath(rawLanding, "/hub") : "/hub";
    const finalTarget =
      !safeLanding || safeLanding === "/" || !safeLanding.startsWith("/")
        ? "/hub"
        : safeLanding;

    hasRedirectedRef.current = true;
    lastRedirectKeyRef.current = resolveKey;
    if (normalizeRoutePath(finalTarget).toLowerCase() === "/hub") {
      useNavigationStore.getState().setActiveWorkspace(null);
    }
    router.replace(finalTarget);
  }, [
    routesError,
    isNavSynced,
    searchParams,
    contextKey,
    landingResolution,
    activeTenantId,
    canAccessPage,
    hasRouteAccess,
    getRouteDescriptor,
    router,
  ]);

  if (routesError) {
    return (
      <NavigationErrorRecovery
        error={routesError}
        onRetry={() => void refreshNavigation()}
      />
    );
  }

  return <ModulesLoadingSkeleton />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<ModulesLoadingSkeleton />}>
      <HomePageResolver />
    </Suspense>
  );
}
