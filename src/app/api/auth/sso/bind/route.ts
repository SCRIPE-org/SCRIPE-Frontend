import { NextRequest } from "next/server";
import { methodNotAllowedResponse, noStoreJson } from "@core/services/session-relay-hmac";
import {
  generateSsoBrowserBinding,
  setSsoBindingCookie,
  validateSameOriginBrowserRequest,
} from "@core/services/session-relay-sso-binding";

/**
 * Generates a CSPRNG first-party SSO login browser-binding nonce, sets it in an
 * `HttpOnly; SameSite=Lax` cookie, and returns its SHA-256 `browserBindingHash`.
 */
export async function POST(request: NextRequest) {
  const validation = validateSameOriginBrowserRequest(request, { requireSecFetchSite: false });
  if (!validation.ok) return validation.response;

  const { nonce, browserBindingHash } = generateSsoBrowserBinding();
  const response = noStoreJson({ browserBindingHash }, 200);
  setSsoBindingCookie(response, nonce, validation.ctx.isSecureTransport);
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
