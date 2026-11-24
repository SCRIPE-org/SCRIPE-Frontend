"use client";

import { appLogger } from "@core/common/logger";
import { secureTokenService } from "@core/common/secure-token-service";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useSudoStore } from "@core/store/useSudoStore";

/** Optional authentication & step-up sudo headers for custom-domain session relay calls. */
export interface CustomDomainRelayOptions {
  /** Forward active in-memory Bearer token (`Authorization`) on authenticated relay requests. */
  includeAuth?: boolean;
  /** Optional step-up Sudo ticket (`X-Sudo-Token`) for sudo-gated mutations. */
  sudoToken?: string | null;
  /** Internal retry guard preventing infinite step-up Sudo loops. */
  _sudoRetry?: boolean;
}

const AUTHENTICATED_ESTABLISH_MODES = new Set<string>([
  "force-change-password",
  "change-password",
  "impersonate",
  "stop-impersonation",
  "revoke-other-sessions",
]);

const SUDO_STEP_UP_ERROR_CODES = new Set<string>([
  "Identity.SudoRequired",
  "Identity.SudoExpired",
  "Identity.SudoSessionMismatch",
  "Identity.SudoRevokedOrExpired",
  "Identity.SudoPolicyDowngradeRefused",
  "Identity.SudoTokenInvalid",
]);

function readErrorCode(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.errorCode === "string" && obj.errorCode.trim()) return obj.errorCode.trim();
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const nested = (obj.data as Record<string, unknown>).errorCode;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return null;
}

function readTenantContextId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEYS.tenant_context);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as { id?: unknown };
    return typeof parsed?.id === "string" ? parsed.id : null;
  } catch {
    return null;
  }
}

function unwrapRelayPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const clone = { ...(payload as Record<string, unknown>) };
    delete clone.refreshToken;
    delete clone.RefreshToken;
    if ("data" in clone && clone.data !== undefined && !("accessToken" in clone)) {
      return clone.data as T;
    }
    return clone as T;
  }
  return payload as T;
}

/**
 * Generates and binds a first-party `HttpOnly` SSO login CSRF nonce (`__Host-scripe_sso_nonce`)
 * on the active browser origin and returns its 43-char SHA-256 `browserBindingHash`.
 */
export async function bindSsoBrowserNonce(): Promise<string> {
  const response = await fetch("/api/auth/sso/bind", {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to bind SSO login browser nonce (${response.status})`);
  }

  const data = (await response.json()) as { browserBindingHash?: unknown };
  if (typeof data?.browserBindingHash !== "string" || !data.browserBindingHash.trim()) {
    throw new Error("Invalid browserBindingHash returned from /api/auth/sso/bind");
  }
  return data.browserBindingHash.trim();
}

/**
 * Reads (and by default expires) the first-party SSO browser-binding nonce for canonical
 * origin callers before submitting `POST /api/v1/auth/sso/handoff`.
 */
export async function consumeSsoBrowserNonce(
  options: { clear?: boolean } = {}
): Promise<string | null> {
  try {
    const clear = options.clear !== false;
    const response = await fetch("/api/auth/sso/consume-binding", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ clear }),
    });
    if (!response.ok) {
      appLogger.warn(`Failed to consume SSO browser binding nonce (${response.status})`);
      return null;
    }
    const data = (await response.json()) as { browserBindingNonce?: unknown };
    return typeof data?.browserBindingNonce === "string" && data.browserBindingNonce.trim()
      ? data.browserBindingNonce.trim()
      : null;
  } catch (err) {
    appLogger.warn("Error consuming SSO browser binding nonce", err);
    return null;
  }
}

/**
 * Sends a same-origin session relay call through the Next.js first-party BFF micro-relay
 * (`/api/auth/session/{establish,refresh,logout}`) on verified external custom domains,
 * including automatic active Bearer/Sudo forwarding and one-shot `Identity.Sudo*` modal elevation.
 */
export async function postCustomDomainSessionRelay<T>(
  relayEndpoint:
    | "/api/auth/session/establish"
    | "/api/auth/session/refresh"
    | "/api/auth/session/logout",
  body: Record<string, unknown> = {},
  options: CustomDomainRelayOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const tenantId = readTenantContextId();
  if (tenantId) {
    headers["X-Tenant-Context"] = tenantId;
  }

  const mode = typeof body.mode === "string" ? body.mode : "";
  const shouldAttachAuth =
    options.includeAuth === true ||
    (options.includeAuth !== false &&
      (relayEndpoint === "/api/auth/session/logout" || AUTHENTICATED_ESTABLISH_MODES.has(mode)));
  if (shouldAttachAuth) {
    const accessToken = secureTokenService.getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const effectiveSudo =
    (typeof options.sudoToken === "string" && options.sudoToken.trim()) ||
    (shouldAttachAuth ? useSudoStore.getState().getValidSudoToken() : null);
  if (effectiveSudo) {
    headers["X-Sudo-Token"] = effectiveSudo;
  }

  const response = await fetch(relayEndpoint, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed: unknown = {};
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text };
    }
  }

  if (!response.ok) {
    const errRecord =
      parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    const message =
      (typeof errRecord.message === "string" && errRecord.message) ||
      (typeof errRecord.title === "string" && errRecord.title) ||
      (typeof errRecord.error === "string" && errRecord.error) ||
      `Session relay request failed (${response.status})`;

    const errorCode = readErrorCode(parsed);
    if (
      response.status === 403 &&
      errorCode &&
      SUDO_STEP_UP_ERROR_CODES.has(errorCode) &&
      !options._sudoRetry
    ) {
      try {
        const freshSudoToken = await useSudoStore
          .getState()
          .requestElevation({ forceChallenge: true });
        return postCustomDomainSessionRelay<T>(relayEndpoint, body, {
          ...options,
          sudoToken: freshSudoToken,
          _sudoRetry: true,
        });
      } catch (sudoErr) {
        const cancelError = sudoErr instanceof Error ? sudoErr : new Error(message);
        (cancelError as Error & { details?: unknown; status?: number }).details = parsed;
        (cancelError as Error & { details?: unknown; status?: number }).status = 403;
        throw cancelError;
      }
    }

    appLogger.warn(`Session relay error on ${relayEndpoint}: ${message}`);
    const err = new Error(message) as Error & { status?: number; details?: unknown };
    err.status = response.status;
    err.details = parsed;
    throw err;
  }

  return unwrapRelayPayload<T>(parsed);
}
