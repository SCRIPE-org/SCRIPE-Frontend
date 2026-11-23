"use client";

import { appLogger } from "@core/common/logger";
import { STORAGE_KEYS } from "@core/config/storage-keys";

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

export async function postCustomDomainSessionRelay<T>(
  relayEndpoint: "/api/auth/session/establish" | "/api/auth/session/refresh" | "/api/auth/session/logout",
  body: Record<string, unknown> = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const tenantId = readTenantContextId();
  if (tenantId) {
    headers["X-Tenant-Context"] = tenantId;
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
    appLogger.warn(`Session relay error on ${relayEndpoint}: ${message}`);
    const err = new Error(message) as Error & { status?: number; details?: unknown };
    err.status = response.status;
    err.details = parsed;
    throw err;
  }

  return unwrapRelayPayload<T>(parsed);
}
