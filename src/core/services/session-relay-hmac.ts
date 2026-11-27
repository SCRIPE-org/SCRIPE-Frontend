import { createHash, createHmac, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export {
  clearRelayCookies,
  extractRelaySessionTokens,
  isValidPrincipalType,
  readRelayCookie,
  RELAY_COOKIE_DEV_HTTP,
  RELAY_COOKIE_PROD,
  sanitizeRelayJsonPayload,
  setRelayCookie,
  type ParsedRelayCookie,
  type RelayPrincipalType,
} from "./session-relay-cookies";

export interface ValidatedRelayContext {
  clientOrigin: string;
  clientIp: string;
  isSecureTransport: boolean;
  hmacSecret: string;
}

/** Standard no-store security headers attached to all BFF session and SSO binding responses. */
export const SECURITY_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  Vary: "Origin, Sec-Fetch-Site",
} as const;

export function methodNotAllowedResponse(): NextResponse {
  return NextResponse.json(
    { error: "method_not_allowed" },
    {
      status: 405,
      headers: {
        Allow: "POST",
        ...SECURITY_RESPONSE_HEADERS,
      },
    }
  );
}

export function noStoreJson(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { ...SECURITY_RESPONSE_HEADERS },
  });
}

const VALID_IP_RE = /^[\da-fA-F.:]+$/;

function isPrivateOrLoopbackIp(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) {
    return true;
  }
  const v4 = lower.startsWith("::ffff:") ? lower.slice(7) : lower;
  const parts = v4.split(".");
  if (parts.length !== 4) return false;
  const a = Number.parseInt(parts[0], 10);
  const b = Number.parseInt(parts[1], 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function resolveClientIp(request: NextRequest): string {
  const trustCf = process.env.SCRIPE_TRUST_CF_CONNECTING_IP === "true";
  const singleHeaders = trustCf
    ? ["x-vercel-forwarded-for", "x-real-ip", "cf-connecting-ip"]
    : ["x-vercel-forwarded-for", "x-real-ip"];

  for (const singleHeader of singleHeaders) {
    const val = request.headers.get(singleHeader)?.split(",")[0]?.trim();
    if (val && VALID_IP_RE.test(val)) {
      return val;
    }
  }
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor
      .split(",")
      .map((s) => s.trim())
      .filter((s) => Boolean(s) && VALID_IP_RE.test(s));
    for (let i = hops.length - 1; i >= 0; i -= 1) {
      if (!isPrivateOrLoopbackIp(hops[i])) {
        return hops[i];
      }
    }
    if (hops.length > 0) {
      return hops[hops.length - 1];
    }
  }
  return "127.0.0.1";
}

/**
 * Resolves the authoritative origin and HTTPS transport flag for an incoming Next.js BFF request,
 * giving strict precedence to the `Host` header over `X-Forwarded-Host` (`#256` #1).
 */
export function resolveRequestAuthority(request: NextRequest): {
  authorityOrigin: string;
  isHttps: boolean;
} | null {
  let fallbackUrl: URL;
  try {
    fallbackUrl = new URL(request.url);
  } catch {
    return null;
  }

  const hostHeader = request.headers.get("host")?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const rawHost = hostHeader || forwardedHost || fallbackUrl.host;
  if (!rawHost || /[\s\\/@]/.test(rawHost)) {
    return null;
  }

  const rawProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ??
    fallbackUrl.protocol.replace(":", "").toLowerCase();
  const proto = rawProto === "https" || rawProto === "http" ? rawProto : "https";

  try {
    const parsed = new URL(`${proto}://${rawHost}`);
    return { authorityOrigin: parsed.origin, isHttps: proto === "https" };
  } catch {
    return null;
  }
}

function isKnownPlaceholderOrDevSecret(secret: string): boolean {
  const lower = secret.toLowerCase();
  return (
    lower.startsWith("change-this") ||
    lower.startsWith("scripe_dev_") ||
    lower.includes("not_for_production") ||
    lower.includes("dev-secret") ||
    lower.includes("placeholder")
  );
}

export function validateRelayRequest(
  request: NextRequest
): { ok: true; ctx: ValidatedRelayContext } | { ok: false; response: NextResponse } {
  const secFetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
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
  const hmacSecret = process.env.SCRIPE_SESSION_RELAY_HMAC_SECRET?.trim() ?? "";
  if (!hmacSecret || hmacSecret.length < 32 || (isProd && isKnownPlaceholderOrDevSecret(hmacSecret))) {
    return {
      ok: false,
      response: noStoreJson({ error: "session_relay_not_configured" }, 503),
    };
  }

  return {
    ok: true,
    ctx: {
      clientOrigin: parsedOrigin.origin,
      clientIp: resolveClientIp(request),
      isSecureTransport: isProd || authority.isHttps,
      hmacSecret,
    },
  };
}

export function resolveUpstreamUrl(canonicalPath: string): string {
  const rawBase = (
    process.env.SCRIPE_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_IDENTITY_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5035/api"
  ).trim();
  const origin = new URL(rawBase).origin;
  return `${origin}${canonicalPath}`;
}

function sanitizeHeaderValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /[\r\n\0]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Builds canonical HMAC-SHA256 signed headers for server-to-server custom-domain relay requests,
 * optionally forwarding caller `Authorization` and `X-Sudo-Token` headers on authenticated routes.
 */
export function buildSignedRelayHeaders(params: {
  request: NextRequest;
  ctx: ValidatedRelayContext;
  canonicalPath: string;
  bodyJson: string;
  method?: "POST" | "GET";
  forwardAuth?: boolean;
  forwardSudo?: boolean;
  authorization?: string | null;
  sudoToken?: string | null;
}): Record<string, string> {
  const method = (params.method ?? "POST").toUpperCase();
  const bodySha256 = createHash("sha256").update(params.bodyJson, "utf8").digest("hex");
  const nonce = randomBytes(16).toString("hex");
  const ts = Math.floor(Date.now() / 1000).toString();
  const canonical = `${method}\n${params.canonicalPath}\n${bodySha256}\n${nonce}\n${ts}\n${params.ctx.clientIp}`;
  const sig = createHmac("sha256", params.ctx.hmacSecret)
    .update(canonical, "utf8")
    .digest("hex");

  const headers: Record<string, string> = {
    ...(method !== "GET" || params.bodyJson.length > 0
      ? { "Content-Type": "application/json" }
      : {}),
    Accept: "application/json",
    Origin: params.ctx.clientOrigin,
    "X-Forwarded-For": params.ctx.clientIp,
    "X-Scripe-Session-Relay-Ts": ts,
    "X-Scripe-Session-Relay-Nonce": nonce,
    "X-Scripe-Session-Relay-Client-Ip": params.ctx.clientIp,
    "X-Scripe-Session-Relay-Sig": sig,
  };

  const acceptLang = sanitizeHeaderValue(params.request.headers.get("accept-language"));
  if (acceptLang) headers["Accept-Language"] = acceptLang;

  const userAgent = sanitizeHeaderValue(params.request.headers.get("user-agent"));
  if (userAgent) headers["User-Agent"] = userAgent;

  const tenantContext = sanitizeHeaderValue(params.request.headers.get("x-tenant-context"));
  if (tenantContext) headers["X-Tenant-Context"] = tenantContext;

  if (params.forwardAuth || params.authorization) {
    const auth = sanitizeHeaderValue(
      params.authorization ?? params.request.headers.get("authorization")
    );
    if (auth) headers.Authorization = auth;
  }

  if (params.forwardSudo || params.sudoToken) {
    const sudo = sanitizeHeaderValue(
      params.sudoToken ?? params.request.headers.get("x-sudo-token")
    );
    if (sudo) headers["X-Sudo-Token"] = sudo;
  }

  return headers;
}
