/**
 * redirect-safety — Guards against open-redirect attacks in auth & onboarding flows.
 *
 * The `?redirect=` query param (and similar backend-echoed paths) is
 * attacker-controlled: a phishing link like
 * `/login?redirect=https://evil.com` must never cause the app to navigate
 * a freshly-authenticated user off-origin.
 *
 * Allows:
 *  - Strict same-app relative paths starting with a single `/`
 *  - Same-origin absolute HTTP(S) URLs (normalized to `${pathname}${search}${hash}`)
 *  - Explicit backend OIDC/SAML resume endpoints (`/connect/authorize`, `/oidc/login`,
 *    `/api/v1/auth/saml/sso`) on the configured backend API origin ONLY.
 */

import { normalizeRoutePath } from "@core/config/app-route-manifest";

const ENCODED_BACKSLASH_PATTERN = /%5c/i;

const EXCLUDED_DEEP_LINK_ROUTES = new Set([
  "/",
  "/login",
  "/logout",
  "/not-authorized",
  "/change-password",
  "/activate-workspace",
  "/magic-link",
  "/qr-approve",
  "/forgot-password",
  "/reset-password",
  "/setup-account",
  "/api",
]);

const EXCLUDED_DEEP_LINK_PREFIXES = ["/api/", "/signup", "/sso/"];

const ALLOWED_BACKEND_RESUME_PATHS = new Set([
  "/connect/authorize",
  "/oidc/login",
  "/api/v1/auth/saml/sso",
]);

function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

function getConfiguredBackendOrigin(): string | null {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5035/api").trim();
  try {
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Returns true when `path` is safe to navigate to: either a strict same-app
 * relative path starting with a single "/", an absolute HTTP(S) URL whose
 * origin matches the current page's origin, or an allow-listed backend
 * OIDC/SAML resume endpoint (`/connect/authorize`, `/oidc/login`,
 * `/api/v1/auth/saml/sso`) on the configured API origin.
 */
export function isSafeRedirectTarget(path: string | null | undefined): boolean {
  if (!path) return false;
  const trimmed = path.trim();
  if (!trimmed || hasControlChar(trimmed)) return false;

  // Never allow backslashes or encoded backslashes anywhere in a redirect target.
  if (trimmed.includes("\\") || ENCODED_BACKSLASH_PATTERN.test(trimmed)) {
    return false;
  }

  // Decode once to catch %2f%2f or %5c obfuscation attempts when checking leading sequence.
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return false;
  }
  if (
    hasControlChar(decoded) ||
    decoded.includes("\\") ||
    decoded.startsWith("//") ||
    decoded.startsWith("/\\")
  ) {
    return false;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  const baseOrigin = typeof window !== "undefined" ? window.location.origin : null;

  try {
    const target = baseOrigin ? new URL(trimmed, baseOrigin) : new URL(trimmed);
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return false;
    }

    if (baseOrigin && target.origin === baseOrigin) {
      return true;
    }

    // Permit validated backend OIDC/SAML resume flows on the configured API origin only.
    const backendOrigin = getConfiguredBackendOrigin();
    if (
      backendOrigin &&
      target.origin === backendOrigin &&
      ALLOWED_BACKEND_RESUME_PATHS.has(target.pathname)
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Returns a safe navigation path when `path` passes `isSafeRedirectTarget`,
 * normalizing same-origin absolute URLs to `${target.pathname}${target.search}${target.hash}`.
 * Otherwise falls back to `fallback` (default `/overview`).
 */
export function getSafeRedirectPath(
  path: string | null | undefined,
  fallback = "/overview"
): string {
  if (!isSafeRedirectTarget(path)) return fallback;

  const trimmed = (path as string).trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  const baseOrigin = typeof window !== "undefined" ? window.location.origin : null;
  try {
    const target = baseOrigin ? new URL(trimmed, baseOrigin) : new URL(trimmed);
    if (baseOrigin && target.origin === baseOrigin) {
      return `${target.pathname}${target.search}${target.hash}`;
    }
    return target.toString();
  } catch {
    return fallback;
  }
}

/**
 * Validates and unwraps an optional post-login deep-link target.
 * Rejects root "/", auth/gate routes, and "/api/*" paths while preserving
 * relative query strings and allow-listed OIDC/SAML API resume URLs.
 */
export function extractEligibleDeepLink(path: string | null | undefined): string | null {
  if (!isSafeRedirectTarget(path)) return null;

  const safeTarget = getSafeRedirectPath(path, "");
  if (!safeTarget) return null;

  if (safeTarget.startsWith("http://") || safeTarget.startsWith("https://")) {
    return safeTarget;
  }

  const normalized = normalizeRoutePath(safeTarget).toLowerCase();
  if (EXCLUDED_DEEP_LINK_ROUTES.has(normalized)) {
    return null;
  }
  if (EXCLUDED_DEEP_LINK_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return null;
  }

  return safeTarget;
}

/**
 * Resolves the post-authentication destination across all admin sign-in channels.
 * Enforces Tier 0 gates (`mustChangePassword`, `PendingPayment`) first,
 * preserves allow-listed OIDC/SAML external resume targets directly, and routes
 * relative destinations through `"/"` (`/?redirect=...` or `"/"`) so the entry
 * resolver runs single-pass navigation bootstrap and Tier 1–5 resolution cleanly.
 */
export function buildPostAuthEntryUrl(params: {
  mustChangePassword?: boolean | null;
  subscriptionStatus?: string | null;
  redirect?: string | null;
}): string {
  if (params.mustChangePassword) {
    return "/change-password";
  }
  if (params.subscriptionStatus === "PendingPayment") {
    return "/activate-workspace";
  }

  const eligible = extractEligibleDeepLink(params.redirect);
  if (!eligible) {
    return "/";
  }
  if (eligible.startsWith("http://") || eligible.startsWith("https://")) {
    return eligible;
  }

  return `/?redirect=${encodeURIComponent(eligible)}`;
}
