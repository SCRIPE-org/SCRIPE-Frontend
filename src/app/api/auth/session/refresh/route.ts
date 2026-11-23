import { NextRequest } from "next/server";
import {
  buildSignedRelayHeaders,
  clearRelayCookies,
  extractRelaySessionTokens,
  methodNotAllowedResponse,
  noStoreJson,
  readRelayCookie,
  resolveUpstreamUrl,
  sanitizeRelayJsonPayload,
  setRelayCookie,
  validateRelayRequest,
} from "@core/services/session-relay-hmac";

export async function POST(request: NextRequest) {
  const validation = validateRelayRequest(request);
  if (!validation.ok) return validation.response;

  const parsedCookie = readRelayCookie(request, validation.ctx.isSecureTransport);
  if (!parsedCookie) {
    const unauthorized = noStoreJson({ error: "missing_refresh_session" }, 401);
    clearRelayCookies(unauthorized, validation.ctx.isSecureTransport);
    return unauthorized;
  }

  const canonicalPath =
    parsedCookie.principalType === "user"
      ? "/api/v1/auth/user/refresh"
      : "/api/v1/auth/admin/refresh";
  const forwardBody = JSON.stringify({ refreshToken: parsedCookie.refreshToken });
  const headers = buildSignedRelayHeaders({
    request,
    ctx: validation.ctx,
    canonicalPath,
    bodyJson: forwardBody,
  });

  try {
    const upstreamResponse = await fetch(resolveUpstreamUrl(canonicalPath), {
      method: "POST",
      headers,
      body: forwardBody,
      cache: "no-store",
    });

    const text = await upstreamResponse.text();
    let rawJson: unknown = {};
    if (text) {
      try {
        rawJson = JSON.parse(text);
      } catch {
        rawJson = { error: "invalid_upstream_response" };
      }
    }

    const sanitized = sanitizeRelayJsonPayload(rawJson);
    const response = noStoreJson(sanitized, upstreamResponse.status);

    if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
      clearRelayCookies(response, validation.ctx.isSecureTransport);
      return response;
    }

    if (upstreamResponse.ok) {
      const { refreshToken, principalType, maxAgeSeconds } = extractRelaySessionTokens(
        upstreamResponse,
        rawJson
      );
      if (refreshToken) {
        setRelayCookie(response, {
          principalType: principalType ?? parsedCookie.principalType,
          refreshToken,
          isSecureTransport: validation.ctx.isSecureTransport,
          maxAgeSeconds,
        });
      }
    }

    return response;
  } catch {
    return noStoreJson({ error: "upstream_relay_unreachable" }, 502);
  }
}

export function GET() {
  return methodNotAllowedResponse();
}
export function PUT() {
  return methodNotAllowedResponse();
}
export function PATCH() {
  return methodNotAllowedResponse();
}
export function DELETE() {
  return methodNotAllowedResponse();
}
export function HEAD() {
  return methodNotAllowedResponse();
}
export function OPTIONS() {
  return methodNotAllowedResponse();
}
