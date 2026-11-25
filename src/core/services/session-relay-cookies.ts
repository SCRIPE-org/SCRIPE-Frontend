import { NextResponse, type NextRequest } from "next/server";

export const RELAY_COOKIE_PROD = "__Host-scripe_refresh_token";
export const RELAY_COOKIE_DEV_HTTP = "scripe_custom_refresh_token";

export type RelayPrincipalType = "admin" | "user";

export interface ParsedRelayCookie {
  principalType: RelayPrincipalType;
  refreshToken: string;
}

export function isValidPrincipalType(value: unknown): value is RelayPrincipalType {
  return value === "admin" || value === "user";
}

export function readRelayCookie(
  request: NextRequest,
  isSecureTransport: boolean
): ParsedRelayCookie | null {
  const isProd = process.env.NODE_ENV === "production";
  const raw =
    request.cookies.get(RELAY_COOKIE_PROD)?.value ??
    (!isProd && !isSecureTransport ? request.cookies.get(RELAY_COOKIE_DEV_HTTP)?.value : undefined);
  if (!raw) return null;

  const sepIdx = raw.indexOf("|");
  if (sepIdx <= 0) return null;
  const principalType = raw.slice(0, sepIdx);
  const refreshToken = raw.slice(sepIdx + 1);
  if (!isValidPrincipalType(principalType) || !refreshToken.trim()) {
    return null;
  }
  return { principalType, refreshToken };
}

export function setRelayCookie(
  response: NextResponse,
  params: {
    principalType: RelayPrincipalType;
    refreshToken: string;
    isSecureTransport: boolean;
    maxAgeSeconds?: number | null;
  }
): void {
  const isProd = process.env.NODE_ENV === "production";
  const cookieName =
    isProd || params.isSecureTransport ? RELAY_COOKIE_PROD : RELAY_COOKIE_DEV_HTTP;
  const maxAge =
    params.maxAgeSeconds && Number.isFinite(params.maxAgeSeconds) && params.maxAgeSeconds > 0
      ? Math.floor(params.maxAgeSeconds)
      : undefined;

  response.cookies.set(cookieName, `${params.principalType}|${params.refreshToken}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProd || params.isSecureTransport,
    ...(maxAge !== undefined ? { maxAge } : {}),
  });
}

export function clearRelayCookies(response: NextResponse, isSecureTransport: boolean): void {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(RELAY_COOKIE_PROD, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
    maxAge: 0,
  });
  if (!isProd && !isSecureTransport) {
    response.cookies.set(RELAY_COOKIE_DEV_HTTP, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      maxAge: 0,
    });
  }
}

function stripRefreshKeys(record: Record<string, unknown>): Record<string, unknown> {
  const clone = { ...record };
  delete clone.refreshToken;
  delete clone.RefreshToken;
  delete clone.staySignedIn;
  delete clone.StaySignedIn;
  return clone;
}

export function sanitizeRelayJsonPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  const clone = stripRefreshKeys(payload as Record<string, unknown>);
  if (clone.data && typeof clone.data === "object" && !Array.isArray(clone.data)) {
    clone.data = stripRefreshKeys(clone.data as Record<string, unknown>);
  }
  return clone;
}

export function extractRelaySessionTokens(
  upstreamResponse: Response,
  rawJson: unknown
): {
  refreshToken: string | null;
  principalType: RelayPrincipalType | null;
  maxAgeSeconds: number | null;
} {
  const refreshToken = upstreamResponse.headers.get("x-scripe-relay-refresh-token")?.trim() || null;
  const headerPrincipal = upstreamResponse.headers.get("x-scripe-relay-principal-type")?.trim();
  const bodyObj =
    rawJson && typeof rawJson === "object" && !Array.isArray(rawJson)
      ? (rawJson as Record<string, unknown>)
      : null;
  const unwrapped =
    bodyObj?.data && typeof bodyObj.data === "object" && !Array.isArray(bodyObj.data)
      ? (bodyObj.data as Record<string, unknown>)
      : bodyObj;

  const candidateType = headerPrincipal ?? unwrapped?.principalType ?? unwrapped?.type;
  const principalType = isValidPrincipalType(candidateType) ? candidateType : null;

  const rawMaxAge = upstreamResponse.headers.get("x-scripe-relay-refresh-maxage");
  const parsedMaxAge = rawMaxAge ? Number.parseInt(rawMaxAge, 10) : NaN;
  const maxAgeSeconds = Number.isFinite(parsedMaxAge) && parsedMaxAge > 0 ? parsedMaxAge : null;

  return { refreshToken, principalType, maxAgeSeconds };
}
