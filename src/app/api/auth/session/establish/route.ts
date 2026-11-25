import { NextRequest } from "next/server";
import {
  buildSignedRelayHeaders,
  extractRelaySessionTokens,
  methodNotAllowedResponse,
  noStoreJson,
  readRelayCookie,
  resolveUpstreamUrl,
  sanitizeRelayJsonPayload,
  setRelayCookie,
  validateRelayRequest,
} from "@core/services/session-relay-hmac";
import { resolveSessionEstablishPlan } from "@core/services/session-establish-modes";
import { clearSsoBindingCookie } from "@core/services/session-relay-sso-binding";

/**
 * First-party custom-domain session establishment & authenticated session mutation relay.
 * Routes allowlisted login, 2FA, SSO handoff, passkey, magic-link, phone-OTP, QR status,
 * password rotation, impersonation, and session revocation modes through HMAC-SHA256 S2S auth.
 */
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

  const resolvedPlan = resolveSessionEstablishPlan(payload, request, validation.ctx);
  if (!resolvedPlan.ok) return resolvedPlan.response;
  const { plan } = resolvedPlan;

  const headers = buildSignedRelayHeaders({
    request,
    ctx: validation.ctx,
    canonicalPath: plan.canonicalPath,
    bodyJson: plan.bodyJson,
    method: plan.method,
    forwardAuth: plan.forwardAuth,
    forwardSudo: plan.forwardSudo,
  });

  try {
    const upstreamResponse = await fetch(resolveUpstreamUrl(plan.canonicalPath), {
      method: plan.method,
      headers,
      ...(plan.method === "POST" ? { body: plan.bodyJson } : {}),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
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
    const bodyObj =
      rawJson && typeof rawJson === "object" && !Array.isArray(rawJson)
        ? (rawJson as Record<string, unknown>)
        : null;
    const unwrapped =
      bodyObj?.data && typeof bodyObj.data === "object" && !Array.isArray(bodyObj.data)
        ? (bodyObj.data as Record<string, unknown>)
        : bodyObj;
    const isPendingContinuation =
      Boolean(unwrapped?.requires2FA) ||
      Boolean(unwrapped?.requiresWorkspaceSelection) ||
      (plan.mode === "qr-status" && unwrapped?.status !== "approved");

    const response = noStoreJson(sanitized, upstreamResponse.status);
    if (plan.consumeSsoNonce && !(upstreamResponse.ok && isPendingContinuation)) {
      clearSsoBindingCookie(response, validation.ctx.isSecureTransport);
    }

    if (upstreamResponse.ok) {
      const { refreshToken, principalType, maxAgeSeconds } = extractRelaySessionTokens(
        upstreamResponse,
        rawJson
      );
      const hasAccessToken =
        typeof unwrapped?.accessToken === "string" && unwrapped.accessToken.trim().length > 0;

      if (!refreshToken && hasAccessToken && !isPendingContinuation) {
        const failRes = noStoreJson({ error: "missing_relay_refresh_token" }, 502);
        if (plan.consumeSsoNonce) {
          clearSsoBindingCookie(failRes, validation.ctx.isSecureTransport);
        }
        return failRes;
      }

      if (refreshToken) {
        const existingCookie = readRelayCookie(request, validation.ctx.isSecureTransport);
        const resolvedPrincipalType =
          principalType ?? plan.defaultPrincipalType ?? existingCookie?.principalType ?? null;
        if (!resolvedPrincipalType) {
          const failRes = noStoreJson({ error: "invalid_principal_type" }, 502);
          if (plan.consumeSsoNonce) {
            clearSsoBindingCookie(failRes, validation.ctx.isSecureTransport);
          }
          return failRes;
        }
        setRelayCookie(response, {
          principalType: resolvedPrincipalType,
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
