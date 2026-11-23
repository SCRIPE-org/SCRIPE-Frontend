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

export function methodNotAllowedResponse(): NextResponse {
  return NextResponse.json(
    { error: "method_not_allowed" },
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    }
  );
}

export function noStoreJson(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    },
  });
}

function resolveClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first && /^[\da-fA-F.:]+$/.test(first)) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && /^[\da-fA-F.:]+$/.test(realIp)) {
    return realIp;
  }
  return "127.0.0.1";
}

function resolveRequestAuthority(request: NextRequest): {
  authorityOrigin: string;
  isHttps: boolean;
} | null {
  let fallbackUrl: URL;
  try {
    fallbackUrl = new URL(request.url);
  } catch {
    return null;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = request.headers.get("host")?.trim();
  const rawHost = forwardedHost || hostHeader || fallbackUrl.host;
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
  if (!hmacSecret || (isProd && hmacSecret.length < 32)) {
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

export function buildSignedRelayHeaders(params: {
  request: NextRequest;
  ctx: ValidatedRelayContext;
  canonicalPath: string;
  bodyJson: string;
  method?: string;
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
    "Content-Type": "application/json",
    Accept: "application/json",
    Origin: params.ctx.clientOrigin,
    "X-Forwarded-For": params.ctx.clientIp,
    "X-Scripe-Session-Relay-Ts": ts,
    "X-Scripe-Session-Relay-Nonce": nonce,
    "X-Scripe-Session-Relay-Client-Ip": params.ctx.clientIp,
    "X-Scripe-Session-Relay-Sig": sig,
  };

  const acceptLang = params.request.headers.get("accept-language");
  if (acceptLang) headers["Accept-Language"] = acceptLang;

  const userAgent = params.request.headers.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent;

  const tenantContext = params.request.headers.get("x-tenant-context");
  if (tenantContext) headers["X-Tenant-Context"] = tenantContext;

  return headers;
}
