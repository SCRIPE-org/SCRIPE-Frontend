import { NextResponse, type NextRequest } from "next/server";
import {
  clearRelayCookies,
  noStoreJson,
  readRelayCookie,
  type RelayPrincipalType,
  type ValidatedRelayContext,
} from "./session-relay-hmac";
import { hasSsoBindingCookie, readSsoBindingNonce } from "./session-relay-sso-binding";

const SAFE_TARGET_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;

/** Supported first-party custom-domain session establish relay modes. */
export type SessionEstablishMode =
  | "sso-handoff"
  | "admin-login"
  | "admin-2fa"
  | "user-2fa"
  | "magic-link-verify"
  | "phone-otp-verify"
  | "passkey-verify"
  | "workspace-selection"
  | "qr-status"
  | "force-change-password"
  | "change-password"
  | "impersonate"
  | "stop-impersonation"
  | "revoke-other-sessions";

interface StaticModeConfig {
  canonicalPath: string;
  method: "POST";
  defaultPrincipalType: RelayPrincipalType | null;
  requiresRefreshInjection?: boolean;
  forwardAuth?: boolean;
  forwardSudo?: boolean;
}

const STATIC_MODES: Partial<Record<SessionEstablishMode, StaticModeConfig>> = {
  "admin-login": {
    canonicalPath: "/api/v1/auth/admin/login",
    method: "POST",
    defaultPrincipalType: "admin",
  },
  "admin-2fa": {
    canonicalPath: "/api/v1/auth/admin/2fa/verify",
    method: "POST",
    defaultPrincipalType: "admin",
  },
  "user-2fa": {
    canonicalPath: "/api/v1/auth/user/2fa/verify",
    method: "POST",
    defaultPrincipalType: "user",
  },
  "magic-link-verify": {
    canonicalPath: "/api/v1/auth/magic-link/verify",
    method: "POST",
    defaultPrincipalType: "admin",
  },
  "phone-otp-verify": {
    canonicalPath: "/api/v1/auth/phone-otp/verify",
    method: "POST",
    defaultPrincipalType: "admin",
  },
  "passkey-verify": {
    canonicalPath: "/api/v1/auth/passkeys/authentication/verify",
    method: "POST",
    defaultPrincipalType: "admin",
  },
  "workspace-selection": {
    canonicalPath: "/api/v1/auth/oidc/complete-workspace-selection",
    method: "POST",
    defaultPrincipalType: "admin",
  },
  "force-change-password": {
    canonicalPath: "/api/v1/auth/admin/force-change-password",
    method: "POST",
    defaultPrincipalType: "admin",
    requiresRefreshInjection: true,
    forwardAuth: true,
  },
  "stop-impersonation": {
    canonicalPath: "/api/v1/auth/admin/stop-impersonation",
    method: "POST",
    defaultPrincipalType: "admin",
    requiresRefreshInjection: true,
    forwardAuth: true,
  },
  "revoke-other-sessions": {
    canonicalPath: "/api/v1/auth/admin/sessions/revoke-all",
    method: "POST",
    defaultPrincipalType: "admin",
    requiresRefreshInjection: true,
    forwardAuth: true,
    forwardSudo: true,
  },
};

/** Resolved upstream dispatch plan for `/api/auth/session/establish`. */
export interface EstablishDispatchPlan {
  mode: SessionEstablishMode;
  canonicalPath: string;
  method: "POST" | "GET";
  bodyJson: string;
  defaultPrincipalType: RelayPrincipalType | null;
  forwardAuth: boolean;
  forwardSudo: boolean;
  consumeSsoNonce: boolean;
}

function stripEnvelopeKeys(
  payload: Record<string, unknown>,
  extraKeys: readonly string[] = []
): Record<string, unknown> {
  const clone = { ...payload };
  delete clone.mode;
  delete clone.refreshToken;
  delete clone.RefreshToken;
  for (const key of extraKeys) {
    delete clone[key];
  }
  return clone;
}

function readSafeTargetId(payload: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const raw = payload[key];
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (SAFE_TARGET_ID_RE.test(trimmed)) {
        return trimmed;
      }
    }
  }
  return null;
}

/**
 * Resolves and strictly validates the allowlisted custom-domain `/api/auth/session/establish`
 * mode, target upstream path, HTTP method, cookie injection, and header forwarding rules.
 */
export function resolveSessionEstablishPlan(
  payload: Record<string, unknown> | null,
  request: NextRequest,
  ctx: ValidatedRelayContext
): { ok: true; plan: EstablishDispatchPlan } | { ok: false; response: NextResponse } {
  if (!payload) {
    return { ok: false, response: noStoreJson({ error: "invalid_json_body" }, 400) };
  }

  const rawMode = payload.mode;
  if (rawMode !== undefined && typeof rawMode !== "string") {
    return { ok: false, response: noStoreJson({ error: "invalid_establish_mode" }, 400) };
  }

  const mode = (rawMode?.trim() || "sso-handoff") as string;

  if (mode === "sso-handoff") {
    const code = typeof payload.code === "string" ? payload.code.trim() : "";
    const state = typeof payload.state === "string" ? payload.state.trim() : "";
    if (!code || !state) {
      return { ok: false, response: noStoreJson({ error: "missing_handoff_credentials" }, 400) };
    }
    const browserBindingNonce = readSsoBindingNonce(request, ctx.isSecureTransport);
    return {
      ok: true,
      plan: {
        mode: "sso-handoff",
        canonicalPath: "/api/v1/auth/sso/handoff",
        method: "POST",
        bodyJson: JSON.stringify({
          code,
          state,
          ...(browserBindingNonce ? { browserBindingNonce } : {}),
        }),
        defaultPrincipalType: null,
        forwardAuth: false,
        forwardSudo: false,
        consumeSsoNonce: hasSsoBindingCookie(request, ctx.isSecureTransport),
      },
    };
  }

  if (mode === "qr-status") {
    const sessionId = readSafeTargetId(payload, ["sessionId", "id"]);
    if (!sessionId) {
      return { ok: false, response: noStoreJson({ error: "invalid_target_identifier" }, 400) };
    }
    return {
      ok: true,
      plan: {
        mode: "qr-status",
        canonicalPath: `/api/v1/auth/qr-login/session/${sessionId}/status`,
        method: "GET",
        bodyJson: "",
        defaultPrincipalType: "admin",
        forwardAuth: false,
        forwardSudo: false,
        consumeSsoNonce: false,
      },
    };
  }

  if (mode === "change-password") {
    const adminId = readSafeTargetId(payload, ["adminId", "id"]);
    if (!adminId) {
      return { ok: false, response: noStoreJson({ error: "invalid_target_identifier" }, 400) };
    }
    const parsedCookie = readRelayCookie(request, ctx.isSecureTransport);
    if (!parsedCookie) {
      const unauthorized = noStoreJson({ error: "missing_refresh_session" }, 401);
      clearRelayCookies(unauthorized, ctx.isSecureTransport);
      return { ok: false, response: unauthorized };
    }
    const cleanBody = stripEnvelopeKeys(payload, ["adminId", "id"]);
    cleanBody.refreshToken = parsedCookie.refreshToken;
    return {
      ok: true,
      plan: {
        mode: "change-password",
        canonicalPath: `/api/v1/admins/${adminId}/change-password`,
        method: "POST",
        bodyJson: JSON.stringify(cleanBody),
        defaultPrincipalType: "admin",
        forwardAuth: true,
        forwardSudo: true,
        consumeSsoNonce: false,
      },
    };
  }

  if (mode === "impersonate") {
    const adminId = readSafeTargetId(payload, ["adminId", "id"]);
    if (!adminId) {
      return { ok: false, response: noStoreJson({ error: "invalid_target_identifier" }, 400) };
    }
    return {
      ok: true,
      plan: {
        mode: "impersonate",
        canonicalPath: `/api/v1/auth/admin/impersonate/${adminId}`,
        method: "POST",
        bodyJson: JSON.stringify({}),
        defaultPrincipalType: "admin",
        forwardAuth: true,
        forwardSudo: true,
        consumeSsoNonce: false,
      },
    };
  }

  const staticSpec = Object.prototype.hasOwnProperty.call(STATIC_MODES, mode)
    ? STATIC_MODES[mode as SessionEstablishMode]
    : undefined;
  if (!staticSpec) {
    return { ok: false, response: noStoreJson({ error: "invalid_establish_mode" }, 400) };
  }

  const cleanBody = stripEnvelopeKeys(
    payload,
    mode === "admin-2fa" || mode === "user-2fa" ? ["principalType"] : []
  );

  if (staticSpec.requiresRefreshInjection) {
    const parsedCookie = readRelayCookie(request, ctx.isSecureTransport);
    if (!parsedCookie) {
      const unauthorized = noStoreJson({ error: "missing_refresh_session" }, 401);
      clearRelayCookies(unauthorized, ctx.isSecureTransport);
      return { ok: false, response: unauthorized };
    }
    cleanBody.refreshToken = parsedCookie.refreshToken;
  }

  return {
    ok: true,
    plan: {
      mode: mode as SessionEstablishMode,
      canonicalPath: staticSpec.canonicalPath,
      method: staticSpec.method,
      bodyJson: JSON.stringify(cleanBody),
      defaultPrincipalType: staticSpec.defaultPrincipalType,
      forwardAuth: Boolean(staticSpec.forwardAuth),
      forwardSudo: Boolean(staticSpec.forwardSudo),
      consumeSsoNonce: false,
    },
  };
}
