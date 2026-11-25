/**
 * recovery-helpers — Pure URL extraction, credential scrubbing, multi-tenant
 * password-policy merging, and recovery API error formatting utilities.
 *
 * @module auth/password-reset/presentation/utils
 */

import { buildAuthContextUrl, isSafeRedirectTarget } from "@core/common/redirect-safety";
import {
  DEFAULT_PASSWORD_MAX_LENGTH,
  mapPasswordPolicyDto,
  type PasswordPolicyDto,
  type PasswordPolicyModel,
} from "@core/common/password-policy";
import type { PasswordResetMethod } from "@modules/auth/core/domain/interfaces/IPasswordResetRepository";

/** Delivery channel for password recovery. */
export type ResetMethod = PasswordResetMethod;

/** Extracted recovery URL context + credential-scrubbed safe URL. */
export interface RecoveryUrlContext {
  token: string;
  otp: string;
  email: string;
  method: ResetMethod | null;
  tenantCode?: string;
  redirect: string | null;
  hasSensitiveParams: boolean;
  cleanRelativeUrl: string;
}

/** Classified API/network error returned from password recovery endpoints. */
export interface RecoveryApiErrorInfo {
  kind: "rate-limit" | "validation" | "network" | "api";
  status?: number;
  retryAfterSeconds?: number;
  message?: string;
}

const SENSITIVE_QUERY_KEYS = ["token", "otp", "code", "method"];
const SENSITIVE_HASH_KEYS = ["token", "otp", "code", "method", "email"];

/** Re-exported context-preserving auth URL builder from `@core/common/redirect-safety`. */
export const buildRecoveryNavigationUrl = buildAuthContextUrl;

/**
 * Normalizes a `PasswordPolicyDto` or `PasswordPolicyModel` into a canonical model.
 */
export function normalizePolicyInput(
  policy: PasswordPolicyDto | PasswordPolicyModel | null | undefined
): PasswordPolicyModel | null {
  if (!policy) return null;
  if ("requireUppercase" in policy && "minLength" in policy) {
    return mapPasswordPolicyDto(policy as PasswordPolicyDto);
  }
  return null;
}

/**
 * Merges multiple workspace password policies into the strictest combined policy
 * so multi-workspace resets satisfy every selected tenant simultaneously.
 */
export function mergePasswordPolicies(
  policies: Array<PasswordPolicyDto | PasswordPolicyModel | null | undefined>
): PasswordPolicyModel | null {
  const normalized = policies
    .map((p) => normalizePolicyInput(p))
    .filter((p): p is PasswordPolicyModel => p !== null);

  if (normalized.length === 0) return null;

  return normalized.reduce<PasswordPolicyModel>(
    (acc, cur) => ({
      minLength: Math.max(acc.minLength, cur.minLength),
      maxLength: Math.min(
        acc.maxLength || DEFAULT_PASSWORD_MAX_LENGTH,
        cur.maxLength || DEFAULT_PASSWORD_MAX_LENGTH
      ),
      requireUppercase: acc.requireUppercase || cur.requireUppercase,
      requireLowercase: acc.requireLowercase || cur.requireLowercase,
      requireNumber: acc.requireNumber || cur.requireNumber,
      requireSpecial: acc.requireSpecial || cur.requireSpecial,
      historyCount: Math.max(acc.historyCount, cur.historyCount),
      checkBreachedPasswords: acc.checkBreachedPasswords || cur.checkBreachedPasswords,
      expiryDays:
        acc.expiryDays !== null && cur.expiryDays !== null
          ? Math.min(acc.expiryDays, cur.expiryDays)
          : acc.expiryDays ?? cur.expiryDays,
    }),
    normalized[0]
  );
}

/**
 * Extracts `#token=` fragments and query fallback params (`?token=`, `?otp=`, `?code=`,
 * `?email=`, `?_tenant=`, `?redirect=`) and returns a scrubbed URL safe for `replaceState`.
 */
export function extractRecoveryUrlContext(
  href: string,
  options?: { stripEmailFromQuery?: boolean }
): RecoveryUrlContext {
  const url = new URL(href, "http://localhost");
  const hashStr = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hashStr);
  const searchParams = url.searchParams;

  const rawToken = (hashParams.get("token") || searchParams.get("token") || "").trim();
  const rawOtp = (
    hashParams.get("otp") ||
    searchParams.get("otp") ||
    hashParams.get("code") ||
    searchParams.get("code") ||
    rawToken
  ).trim();
  const rawEmail = (hashParams.get("email") || searchParams.get("email") || "").trim();
  const rawMethod = (hashParams.get("method") || searchParams.get("method") || "").trim();
  const method: ResetMethod | null =
    rawMethod === "otp" || rawMethod === "magic-link" ? rawMethod : null;

  const rawTenant = (
    searchParams.get("_tenant") ||
    hashParams.get("_tenant") ||
    searchParams.get("tenant") ||
    ""
  ).trim();
  const tenantCode = rawTenant ? rawTenant.toUpperCase() : undefined;

  const rawRedirect = searchParams.get("redirect");
  const redirect = rawRedirect && isSafeRedirectTarget(rawRedirect) ? rawRedirect.trim() : null;

  let hasSensitiveParams = false;

  for (const key of SENSITIVE_QUERY_KEYS) {
    if (searchParams.has(key)) {
      searchParams.delete(key);
      hasSensitiveParams = true;
    }
  }
  if (options?.stripEmailFromQuery && searchParams.has("email")) {
    searchParams.delete("email");
    hasSensitiveParams = true;
  }

  for (const key of SENSITIVE_HASH_KEYS) {
    if (hashParams.has(key)) {
      hashParams.delete(key);
      hasSensitiveParams = true;
    }
  }
  if (rawRedirect && !redirect && searchParams.has("redirect")) {
    searchParams.delete("redirect");
  }

  const remainingHash = hashParams.toString();
  const cleanSearch = searchParams.toString();
  const cleanRelativeUrl = `${url.pathname}${cleanSearch ? `?${cleanSearch}` : ""}${
    remainingHash ? `#${remainingHash}` : ""
  }`;

  return {
    token: rawToken,
    otp: rawOtp,
    email: rawEmail,
    method,
    tenantCode,
    redirect,
    hasSensitiveParams,
    cleanRelativeUrl,
  };
}

/**
 * Classifies API/network errors thrown during password recovery so HTTP 429 rate-limits,
 * network outages, and 422 policy rejections are surfaced rather than swallowed.
 */
export function extractRecoveryApiError(err: unknown): RecoveryApiErrorInfo {
  const errRecord = (err && typeof err === "object" ? err : {}) as {
    status?: number;
    statusCode?: number;
    code?: string;
    message?: string;
    retryAfterSeconds?: number;
    details?: {
      retryAfterSeconds?: number;
      RetryAfterSeconds?: number;
      message?: string;
      errors?: Record<string, string[]> | string[];
    };
    response?: {
      status?: number;
      headers?: Record<string, unknown>;
      data?: {
        retryAfterSeconds?: number;
        RetryAfterSeconds?: number;
        message?: string;
        errors?: Record<string, string[]> | string[];
      };
    };
  };

  const status = errRecord.status ?? errRecord.statusCode ?? errRecord.response?.status;
  const details = errRecord.details ?? errRecord.response?.data;
  const message =
    (details && typeof details.message === "string" && details.message) ||
    (typeof errRecord.message === "string" ? errRecord.message : undefined);

  const headerRetry = errRecord.response?.headers?.["retry-after"];
  const parsedHeaderRetry =
    typeof headerRetry === "number"
      ? headerRetry
      : typeof headerRetry === "string" && /^\d+$/.test(headerRetry.trim())
        ? Number.parseInt(headerRetry.trim(), 10)
        : undefined;

  const rawRetryAfter =
    errRecord.retryAfterSeconds ??
    details?.retryAfterSeconds ??
    details?.RetryAfterSeconds ??
    parsedHeaderRetry;
  const retryAfterSeconds =
    typeof rawRetryAfter === "number" && Number.isFinite(rawRetryAfter) && rawRetryAfter > 0
      ? Math.ceil(rawRetryAfter)
      : undefined;

  if (status === 429) {
    return { kind: "rate-limit", status, retryAfterSeconds, message };
  }

  if (status === 422) {
    let validationMessage = message;
    if (details?.errors) {
      if (Array.isArray(details.errors) && details.errors.length > 0) {
        validationMessage = details.errors.join(". ");
      } else if (typeof details.errors === "object") {
        const flattened = Object.values(details.errors).flat().filter(Boolean);
        if (flattened.length > 0) {
          validationMessage = flattened.join(". ");
        }
      }
    }
    return { kind: "validation", status, message: validationMessage };
  }

  if (
    status === undefined &&
    (errRecord.code === "ERR_NETWORK" ||
      errRecord.code === "ECONNABORTED" ||
      errRecord.code === "ENOTFOUND" ||
      (message ? /network error|failed to fetch|timeout|econnrefused/i.test(message) : false))
  ) {
    return { kind: "network", message };
  }

  return { kind: "api", status, retryAfterSeconds, message };
}

/** Formats classified recovery errors into user-facing localized messages. */
export function formatRecoveryApiError(
  err: unknown,
  fallbackMessage: string,
  t: (key: string) => string
): { message: string; isRateLimitOrNetwork: boolean; retryAfter?: number } {
  const info = extractRecoveryApiError(err);
  if (info.kind === "rate-limit") {
    const msg = info.retryAfterSeconds
      ? t("auth.rateLimitedRetryAfter").replace("{{seconds}}", String(info.retryAfterSeconds))
      : info.message || t("auth.rateLimited");
    return { message: msg, isRateLimitOrNetwork: true, retryAfter: info.retryAfterSeconds };
  }
  if (info.kind === "network" || (info.status !== undefined && info.status >= 500)) {
    return {
      message: info.message || t("auth.recoveryNetworkError"),
      isRateLimitOrNetwork: true,
    };
  }
  return {
    message: info.message || fallbackMessage,
    isRateLimitOrNetwork: false,
  };
}
