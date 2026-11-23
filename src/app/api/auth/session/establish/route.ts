import { NextRequest } from "next/server";
import {
  buildSignedRelayHeaders,
  extractRelaySessionTokens,
  methodNotAllowedResponse,
  noStoreJson,
  resolveUpstreamUrl,
  sanitizeRelayJsonPayload,
  setRelayCookie,
  validateRelayRequest,
} from "@core/services/session-relay-hmac";

const CANONICAL_HANDOFF_PATH = "/api/v1/auth/sso/handoff";

export async function POST(request: NextRequest) {
  const validation = validateRelayRequest(request);
  if (!validation.ok) return validation.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "invalid_json_body" }, 400);
  }

  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  const code = typeof payload?.code === "string" ? payload.code.trim() : "";
  const state = typeof payload?.state === "string" ? payload.state.trim() : "";
  if (!code || !state) {
    return noStoreJson({ error: "missing_handoff_credentials" }, 400);
  }

  const forwardBody = JSON.stringify({ code, state });
  const headers = buildSignedRelayHeaders({
    request,
    ctx: validation.ctx,
    canonicalPath: CANONICAL_HANDOFF_PATH,
    bodyJson: forwardBody,
  });

  try {
    const upstreamResponse = await fetch(resolveUpstreamUrl(CANONICAL_HANDOFF_PATH), {
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

    if (upstreamResponse.ok) {
      const { refreshToken, principalType, maxAgeSeconds } = extractRelaySessionTokens(
        upstreamResponse,
        rawJson
      );
      if (refreshToken) {
        if (!principalType) {
          return noStoreJson({ error: "invalid_principal_type" }, 502);
        }
        setRelayCookie(response, {
          principalType,
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
