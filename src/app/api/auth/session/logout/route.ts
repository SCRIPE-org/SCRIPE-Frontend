import { NextRequest } from "next/server";
import {
  buildSignedRelayHeaders,
  clearRelayCookies,
  methodNotAllowedResponse,
  noStoreJson,
  readRelayCookie,
  resolveUpstreamUrl,
  validateRelayRequest,
} from "@core/services/session-relay-hmac";

export async function POST(request: NextRequest) {
  const validation = validateRelayRequest(request);
  if (!validation.ok) return validation.response;

  let logoutScope: "app" | "central" = "app";
  try {
    const rawBody = await request.text();
    if (rawBody.trim()) {
      const parsed = JSON.parse(rawBody) as { logoutScope?: unknown };
      if (parsed?.logoutScope === "central") {
        logoutScope = "central";
      }
    }
  } catch {
    // Empty or malformed logout payload still revokes with safe "app" default
  }

  const parsedCookie = readRelayCookie(request, validation.ctx.isSecureTransport);
  if (!parsedCookie) {
    const response = noStoreJson({ success: true }, 200);
    clearRelayCookies(response, validation.ctx.isSecureTransport);
    return response;
  }

  const canonicalPath =
    parsedCookie.principalType === "user"
      ? "/api/v1/auth/user/logout"
      : "/api/v1/auth/admin/logout";
  const forwardBody = JSON.stringify({
    refreshToken: parsedCookie.refreshToken,
    logoutScope,
  });
  const headers = buildSignedRelayHeaders({
    request,
    ctx: validation.ctx,
    canonicalPath,
    bodyJson: forwardBody,
  });

  try {
    await fetch(resolveUpstreamUrl(canonicalPath), {
      method: "POST",
      headers,
      body: forwardBody,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Always expire local first-party relay cookie even if upstream fails
  }

  const response = noStoreJson({ success: true }, 200);
  clearRelayCookies(response, validation.ctx.isSecureTransport);
  return response;
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
