import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { noStoreJson, resolveRequestAuthority } from "./session-relay-hmac";

/** Production HTTPS-only first-party host-locked SSO login CSRF binding cookie name. */
export const SSO_BINDING_COOKIE_PROD = "__Host-scripe_sso_nonce";

/** Local HTTP-only development fallback cookie name for SSO login CSRF binding. */
export const SSO_BINDING_COOKIE_DEV_HTTP = "scripe_sso_nonce";

/** Lifetime in seconds for the short-lived SSO login browser binding cookie (10 minutes). */
export const SSO_BINDING_MAX_AGE_SECONDS = 600;

const SSO_NONCE_BYTE_LENGTH = 32;
const SSO_BINDING_TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

/** Validated same-origin browser request context for SSO nonce bind/consume routes. */
export interface SameOriginBrowserContext {
  clientOrigin: string;
  isSecureTransport: boolean;
}

/**
 * Generates a fresh 32-byte CSPRNG browser-binding nonce and its 43-character
 * base64url SHA-256 digest (`browserBindingHash`) for ASVS V10.2.2 SSO Login CSRF defense.
 */
export function generateSsoBrowserBinding(): { nonce: string; browserBindingHash: string } {
  const nonce = randomBytes(SSO_NONCE_BYTE_LENGTH).toString("base64url");
  const browserBindingHash = createHash("sha256").update(nonce, "utf8").digest("base64url");
  return { nonce, browserBindingHash };
}

/**
 * Validates same-origin browser metadata (`Sec-Fetch-Site` and `Origin === authority`)
 * without requiring `SCRIPE_SESSION_RELAY_HMAC_SECRET`, so canonical platform origins and
 * custom domains share uniform first-party SSO nonce binding endpoints.
 */
export function validateSameOriginBrowserRequest(
  request: NextRequest,
  options: { requireSecFetchSite?: boolean } = {}
): { ok: true; ctx: SameOriginBrowserContext } | { ok: false; response: NextResponse } {
  const secFetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (options.requireSecFetchSite && secFetchSite !== "same-origin") {
    return { ok: false, response: noStoreJson({ error: "cross_site_request_forbidden" }, 403) };
  }
  if (secFetchSite && secFetchSite !== "same-origin") {
    return { ok: false, response: noStoreJson({ error: "cross_site_request_forbidden" }, 403) };
  }

  const originHeader = request.headers.get("origin")?.trim();
  if (!originHeader) {
    return { ok: false, response: noStoreJson({ error: "missing_origin" }, 403) };
  }

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(originHeader);
  } catch {
    return { ok: false, response: noStoreJson({ error: "invalid_origin" }, 403) };
  }

  if (
    (parsedOrigin.protocol !== "http:" && parsedOrigin.protocol !== "https:") ||
    parsedOrigin.username ||
    parsedOrigin.password
  ) {
    return { ok: false, response: noStoreJson({ error: "invalid_origin" }, 403) };
  }

  const authority = resolveRequestAuthority(request);
  if (!authority || parsedOrigin.origin !== authority.authorityOrigin) {
    return { ok: false, response: noStoreJson({ error: "origin_mismatch" }, 403) };
  }

  const isProd = process.env.NODE_ENV === "production";
  return {
    ok: true,
    ctx: {
      clientOrigin: parsedOrigin.origin,
      isSecureTransport: isProd || authority.isHttps,
    },
  };
}

/**
 * Returns true if any SSO browser-binding cookie is present on the request.
 */
export function hasSsoBindingCookie(
  request: NextRequest,
  isSecureTransport: boolean
): boolean {
  const isProd = process.env.NODE_ENV === "production";
  return Boolean(
    request.cookies.get(SSO_BINDING_COOKIE_PROD)?.value ||
      (!isProd && !isSecureTransport && request.cookies.get(SSO_BINDING_COOKIE_DEV_HTTP)?.value)
  );
}

/**
 * Reads and format-validates the first-party SSO login browser-binding nonce cookie.
 */
export function readSsoBindingNonce(
  request: NextRequest,
  isSecureTransport: boolean
): string | null {
  const isProd = process.env.NODE_ENV === "production";
  const raw =
    request.cookies.get(SSO_BINDING_COOKIE_PROD)?.value ??
    (!isProd && !isSecureTransport
      ? request.cookies.get(SSO_BINDING_COOKIE_DEV_HTTP)?.value
      : undefined);

  if (!raw) return null;
  const trimmed = raw.trim();
  return SSO_BINDING_TOKEN_RE.test(trimmed) ? trimmed : null;
}

/**
 * Sets the host-only `HttpOnly; SameSite=Lax; Path=/` SSO login browser-binding cookie.
 */
export function setSsoBindingCookie(
  response: NextResponse,
  nonce: string,
  isSecureTransport: boolean
): void {
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd || isSecureTransport;
  const cookieName = secure ? SSO_BINDING_COOKIE_PROD : SSO_BINDING_COOKIE_DEV_HTTP;

  response.cookies.set(cookieName, nonce, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: SSO_BINDING_MAX_AGE_SECONDS,
  });
}

/**
 * Expires the first-party SSO login browser-binding cookies immediately (`Max-Age=0`).
 */
export function clearSsoBindingCookie(
  response: NextResponse,
  isSecureTransport: boolean
): void {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(SSO_BINDING_COOKIE_PROD, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
    maxAge: 0,
  });

  if (!isProd && !isSecureTransport) {
    response.cookies.set(SSO_BINDING_COOKIE_DEV_HTTP, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      maxAge: 0,
    });
  }
}
