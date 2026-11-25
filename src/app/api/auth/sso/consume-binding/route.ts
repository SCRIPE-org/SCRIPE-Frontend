import { NextRequest } from "next/server";
import { methodNotAllowedResponse, noStoreJson } from "@core/services/session-relay-hmac";
import {
  clearSsoBindingCookie,
  readSsoBindingNonce,
  validateSameOriginBrowserRequest,
} from "@core/services/session-relay-sso-binding";

/**
 * Strictly same-origin endpoint that reads and (by default) expires the first-party
 * SSO browser-binding nonce cookie so canonical origin callers can include
 * `browserBindingNonce` on `POST /api/v1/auth/sso/handoff`.
 * Accepts optional `{ clear?: boolean }` (default `true`) to preserve the cookie across
 * pending workspace-selection / 2FA continuations.
 */
export async function POST(request: NextRequest) {
  const validation = validateSameOriginBrowserRequest(request, { requireSecFetchSite: true });
  if (!validation.ok) return validation.response;

  let shouldClear = true;
  try {
    const rawBody = await request.text();
    if (rawBody.trim()) {
      const parsed = JSON.parse(rawBody) as { clear?: unknown };
      if (parsed?.clear === false) {
        shouldClear = false;
      }
    }
  } catch {
    // Empty or non-JSON body defaults safely to single-use atomic clear=true
  }

  const browserBindingNonce = readSsoBindingNonce(request, validation.ctx.isSecureTransport);
  const response = noStoreJson({ browserBindingNonce }, 200);
  if (shouldClear) {
    clearSsoBindingCookie(response, validation.ctx.isSecureTransport);
  }
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
