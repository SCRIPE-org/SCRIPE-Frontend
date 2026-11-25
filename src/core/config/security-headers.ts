/**
 * Centralized Browser Security Headers & Content Security Policy Builder
 *
 * Single source of truth shared between `src/proxy.ts` (per-request nonce CSP
 * and SSR caching policy on HTML routes) and `next.config.ts` (non-CSP baseline
 * headers, static `/offline.html` & `/api/*` CSP, preview framing overrides,
 * and `CORP: cross-origin` for static public assets).
 *
 * ARCHITECTURAL INVARIANTS:
 * - Page routes receive ONE authoritative `Content-Security-Policy` from `src/proxy.ts`
 *   (no dual-header CSP intersection from `next.config.ts`).
 * - `script-src` uses `'self' 'nonce-<base64>'` WITHOUT `'strict-dynamic'` so both
 *   Next.js SSR chunks and static `'self'` scripts remain allowed while inline
 *   script injection without the per-request nonce is blocked.
 * - `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN` are scoped strictly
 *   to Customization Studio preview routes (`/studio-preview`, `/dashboard-preview`).
 */

export interface SecurityHeaderEntry {
  key: string;
  value: string;
}

export interface PageSecurityHeaderOptions {
  nonce: string;
  pathname: string;
  isDev: boolean;
  isHttps: boolean;
}

const PREVIEW_FRAMEABLE_PREFIXES = ["/studio-preview", "/dashboard-preview"] as const;

const PERMISSIONS_POLICY_VALUE =
  "camera=(self), microphone=(), geolocation=(), publickey-credentials-get=(self), publickey-credentials-create=(self)";

/**
 * Extract an HTTP(S) origin from a configured URL candidate, discarding paths,
 * query strings, and non-HTTP(S) schemes.
 */
export function extractOrigin(rawUrl: string | undefined | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Determine whether Vercel Analytics / Speed Insights scripts are explicitly enabled.
 */
export function isVercelTelemetryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true";
}

/**
 * Return true strictly for same-origin Customization Studio iframe preview routes.
 */
export function isFrameablePreviewPath(pathname: string): boolean {
  return PREVIEW_FRAMEABLE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Resolve configured backend HTTP(S) and WebSocket origins for CSP `connect-src`,
 * `img-src`, `media-src`, `frame-src`, and `form-action` directives.
 */
export function resolveConfiguredBackendOrigins(isDev: boolean): {
  httpOrigins: string[];
  wsOrigins: string[];
} {
  const httpOrigins = new Set<string>();
  const wsOrigins = new Set<string>();

  for (const candidate of [
    process.env.NEXT_PUBLIC_API_URL || (isDev ? "http://localhost:5035/api" : undefined),
    process.env.NEXT_PUBLIC_IDENTITY_API_URL,
  ]) {
    const origin = extractOrigin(candidate);
    if (origin) {
      httpOrigins.add(origin);
      wsOrigins.add(origin.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:"));
    }
  }

  if (isDev) {
    httpOrigins.add("http://localhost:*");
    httpOrigins.add("http://127.0.0.1:*");
    wsOrigins.add("ws://localhost:*");
    wsOrigins.add("wss://localhost:*");
    wsOrigins.add("ws://127.0.0.1:*");
  }

  return {
    httpOrigins: Array.from(httpOrigins),
    wsOrigins: Array.from(wsOrigins),
  };
}

/**
 * Generate a 128-bit cryptographically random base64 nonce compatible with both
 * Edge Runtime Web Crypto and Node.js runtimes, matching Next.js 16's CSP header parser.
 */
export function generateCspNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Build the strict per-request Content Security Policy for SSR/App Router pages.
 */
export function buildPageCsp(options: {
  nonce: string;
  isDev: boolean;
  allowSelfFraming: boolean;
  isHttps?: boolean;
}): string {
  const { nonce, isDev, allowSelfFraming, isHttps = false } = options;
  const { httpOrigins, wsOrigins } = resolveConfiguredBackendOrigins(isDev);
  const telemetryEnabled = isVercelTelemetryEnabled();

  const extraHttp = httpOrigins.length > 0 ? ` ${httpOrigins.join(" ")}` : "";
  const extraWs = wsOrigins.length > 0 ? ` ${wsOrigins.join(" ")}` : "";
  const telemetryScript = telemetryEnabled ? " https://va.vercel-scripts.com" : "";
  const telemetryConnect = telemetryEnabled
    ? " https://va.vercel-scripts.com https://vitals.vercel-insights.com"
    : "";

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${telemetryScript}${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `img-src 'self' data: blob: https:${extraHttp}`,
    `media-src 'self' blob: https:${extraHttp}`,
    `connect-src 'self'${extraHttp}${extraWs}${telemetryConnect}`,
    `frame-src 'self' https:${extraHttp}`,
    `frame-ancestors ${allowSelfFraming ? "'self'" : "'none'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self'${extraHttp}`,
    "worker-src 'self'",
    "manifest-src 'self'",
  ];

  // Upgrade insecure requests only over real HTTPS so local `next start` HTTP E2E stays intact.
  if (!isDev && isHttps) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

/**
 * Build the Report-Only Trusted Types policy for progressive DOM XSS telemetry.
 */
export function buildTrustedTypesReportOnlyCsp(): string {
  return "require-trusted-types-for 'script'; trusted-types default dompurify nextjs#bundler nextjs";
}

/**
 * Build static Content Security Policies for non-proxied static or API endpoints.
 */
export function buildStaticResourceCsp(kind: "offline" | "api"): string {
  if (kind === "api") {
    return "default-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  }

  return "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'none'";
}

/**
 * Build non-CSP baseline security headers shared across proxy responses and Next.js config rules.
 */
export function buildCommonSecurityHeaders(options: {
  isDev: boolean;
  frameAncestorsMode: "DENY" | "SAMEORIGIN";
}): SecurityHeaderEntry[] {
  const { isDev, frameAncestorsMode } = options;

  const headers: SecurityHeaderEntry[] = [
    { key: "X-Frame-Options", value: frameAncestorsMode },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY_VALUE },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ];

  if (!isDev) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }

  return headers;
}

/**
 * Apply the full browser security header suite (including single-header nonce CSP,
 * Trusted Types Report-Only, framing, COOP, HSTS, and SSR no-store caching) to a response.
 */
export function applyPageSecurityHeaders<T extends { headers: Headers }>(
  response: T,
  options: PageSecurityHeaderOptions
): T {
  const allowSelfFraming = isFrameablePreviewPath(options.pathname);
  const frameAncestorsMode = allowSelfFraming ? "SAMEORIGIN" : "DENY";
  const csp = buildPageCsp({
    nonce: options.nonce,
    isDev: options.isDev,
    allowSelfFraming,
    isHttps: options.isHttps,
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Content-Security-Policy-Report-Only", buildTrustedTypesReportOnlyCsp());

  for (const header of buildCommonSecurityHeaders({
    isDev: options.isDev,
    frameAncestorsMode,
  })) {
    response.headers.set(header.key, header.value);
  }

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate"
  );
  response.headers.set("Pragma", "no-cache");

  return response;
}
