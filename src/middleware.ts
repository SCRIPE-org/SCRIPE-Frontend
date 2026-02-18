import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * P5.5: Next.js Server-Side Route Guard Middleware
 *
 * Runs on the Edge Runtime BEFORE any page renders.
 * Prevents unauthenticated users from accessing protected routes
 * at the server level — no HTML/JS leakage.
 *
 * Strategy:
 * - Public paths (login, docs) → always allow
 * - Protected paths (modules, settings, profile) → require refresh token cookie
 * - Static assets (_next, favicons, etc.) → skip entirely via matcher
 *
 * The refresh token cookie is the server-side auth signal.
 * Access tokens live in memory (Zustand) and aren't available server-side.
 */

// Routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/verify-email"];

// Routes that explicitly require authentication
// Everything under (modules) is protected by the layout, but this adds server-level guard
const PROTECTED_PREFIXES = ["/admin", "/profile", "/settings", "/recycle-bin"];

const REFRESH_TOKEN_COOKIE = "nexora_refresh_token";

export function middleware(request: NextRequest) {
      const { pathname } = request.nextUrl;

      // Allow public paths
      if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
            return NextResponse.next();
      }

      // Check if route is protected (starts with known module prefixes or is at root level)
      const isProtected =
            PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
            pathname === "/"; // Home/dashboard is protected

      if (!isProtected) {
            return NextResponse.next();
      }

      // Check for refresh token cookie as auth signal
      const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);

      if (!hasRefreshToken) {
            // Build login URL with redirect parameter
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
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
