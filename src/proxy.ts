import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "./core/config/storage-keys";
import { isManifestPublicRoute, matchAppRoute } from "./core/config/app-route-manifest";
import {
  applyPageSecurityHeaders,
  buildPageCsp,
  generateCspNonce,
  isFrameablePreviewPath,
} from "./core/config/security-headers";
import { isSafeRedirectTarget } from "./modules/shared/auth/signin/src/presentation/utils/redirect-safety";

/**
 * Next.js Pre-Hydration UX Hint & Security Header Proxy
 *
 * Runs BEFORE page rendering to:
 * 1. Issue a per-request cryptographic CSP nonce (`x-nonce` + `Content-Security-Policy`)
 *    forwarded to both Next.js SSR (`getScriptNonceFromHeader`) and RootLayout (`headers()`),
 *    eliminating `'unsafe-inline'` in `script-src` while keeping preview framing scoped
 *    strictly to `/studio-preview` and `/dashboard-preview`.
 * 2. Avoid flashing protected shells to unauthenticated visitors before client hydration.
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

function isHttpsRequest(request: NextRequest): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    const firstProto = forwardedProto.split(",")[0]?.trim().toLowerCase();
    return firstProto === "https";
  }
  return request.nextUrl.protocol === "https:";
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const nonce = generateCspNonce();
  const isDev = process.env.NODE_ENV !== "production";
  const isHttps = isHttpsRequest(request);
  const pageCsp = buildPageCsp({
    nonce,
    isDev,
    allowSelfFraming: isFrameablePreviewPath(pathname),
    isHttps,
  });

  // Forward nonce & CSP on request headers so Next.js App Router auto-nonces internal scripts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", pageCsp);

  const finalize = (response: NextResponse) =>
    applyPageSecurityHeaders(response, { nonce, pathname, isDev, isHttps });

  const entry = matchAppRoute(pathname);

  // Unknown route → let Next.js App Router render not-found (404)
  if (!entry) {
    return finalize(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Public routes (respecting devOnly production gating)
  if (isManifestPublicRoute(pathname)) {
    return finalize(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Protected shell/devOnly/menu-bound routes → enforce server-side auth state cookie
  const hasAuthState = request.cookies.has(AUTH_STATE_COOKIE);

  if (!hasAuthState) {
    const loginUrl = new URL("/login", request.url);
    const candidateRedirect = search ? `${pathname}${search}` : pathname;
    if (isSafeRedirectTarget(candidateRedirect)) {
      loginUrl.searchParams.set("redirect", candidateRedirect);
    }
    return finalize(NextResponse.redirect(loginUrl));
  }

  return finalize(NextResponse.next({ request: { headers: requestHeaders } }));
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
