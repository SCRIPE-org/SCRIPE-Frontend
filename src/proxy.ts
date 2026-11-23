import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "./core/config/storage-keys";
import { isManifestPublicRoute, matchAppRoute } from "./core/config/app-route-manifest";
import { isSafeRedirectTarget } from "./modules/shared/auth/signin/src/presentation/utils/redirect-safety";

/**
 * Next.js Pre-Hydration UX Hint Proxy
 *
 * Runs BEFORE page rendering to avoid flashing protected shells to unauthenticated
 * visitors before client-side hydration completes.
 *
 * SECURITY BOUNDARY NOTE:
 * `scr_auth_state` is strictly a client-managed UX optimization hint — NEVER an
 * authoritative authentication or authorization boundary. All protected API data,
 * tenant resolution, and session mutations are enforced by the backend via
 * short-lived in-memory JWT Bearer tokens and httpOnly refresh cookies, plus
 * client-side RouteGuard token validation.
 *
 * Strategy:
 * - Unknown routes (not in APP_ROUTE_MANIFEST) → pass through so Next renders clean 404
 * - Public routes (from APP_ROUTE_MANIFEST, excluding prod-disabled devOnly) → allow
 * - Protected routes (all remaining manifest routes) → redirect early if hint cookie absent
 * - Static assets (_next, favicons, etc.) → skip entirely via matcher
 */

const AUTH_STATE_COOKIE = STORAGE_KEYS.scr_auth_state;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const entry = matchAppRoute(pathname);

  // Unknown route → let Next.js App Router render not-found (404)
  if (!entry) {
    return NextResponse.next();
  }

  // Public routes (respecting devOnly production gating)
  if (isManifestPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Protected shell/devOnly/menu-bound routes → enforce server-side auth state cookie
  const hasAuthState = request.cookies.has(AUTH_STATE_COOKIE);

  if (!hasAuthState) {
    const loginUrl = new URL("/login", request.url);
    const candidateRedirect = search ? `${pathname}${search}` : pathname;
    if (isSafeRedirectTarget(candidateRedirect)) {
      loginUrl.searchParams.set("redirect", candidateRedirect);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Matcher: skip static assets, API routes, and _next internals
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (browser auto-request)
     * - api (API routes — handled by backend CORS/auth)
     * - Files with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|sw\\.js|offline\\.html|manifest\\.json|.*\\..*).*)",
  ],
};
