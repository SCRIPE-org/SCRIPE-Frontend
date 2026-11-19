import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Detects whether a thrown error represents an HTTP 409 optimistic-concurrency conflict.
 */
export function isConcurrencyConflictError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as {
    status?: unknown;
    response?: { status?: unknown };
    details?: { statusCode?: unknown; status?: unknown; errorCode?: unknown };
  };
  return (
    err.status === 409 ||
    err.response?.status === 409 ||
    err.details?.statusCode === 409 ||
    err.details?.status === 409 ||
    err.details?.errorCode === "CONCURRENCY_CONFLICT"
  );
}

/**
 * Invalidates the specified TanStack Query key when a mutation fails with an HTTP 409 conflict,
 * refreshing cached `rowVersion` tokens before the user retries.
 */
export function invalidateOnConcurrencyConflict(
  queryClient: QueryClient,
  queryKey: QueryKey,
  error: unknown
): boolean {
  if (!isConcurrencyConflictError(error)) return false;
  void queryClient.invalidateQueries({ queryKey });
  return true;
}

/** Extracts detailed backend validation / ProblemDetails text from structured API errors. */
function extractBackendErrorDetail(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const err = error as {
    message?: unknown;
    details?: {
      detail?: unknown;
      message?: unknown;
      title?: unknown;
      errors?: Record<string, unknown> | unknown[];
    };
  };

  if (typeof err.details?.detail === "string" && err.details.detail.trim()) {
    return err.details.detail.trim();
  }
  if (typeof err.details?.message === "string" && err.details.message.trim()) {
    return err.details.message.trim();
  }

  const rawErrors = err.details?.errors;
  if (Array.isArray(rawErrors)) {
    const first = rawErrors.find((item) => typeof item === "string" && item.trim());
    if (typeof first === "string") return first.trim();
  } else if (rawErrors && typeof rawErrors === "object") {
    for (const val of Object.values(rawErrors)) {
      if (Array.isArray(val) && typeof val[0] === "string" && val[0].trim()) {
        return val[0].trim();
      }
      if (typeof val === "string" && val.trim()) {
        return val.trim();
      }
    }
  }

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message.trim();
  }
  if (typeof err.details?.title === "string" && err.details.title.trim()) {
    return err.details.title.trim();
  }
  return null;
}

/**
 * Resolves a localized user-facing error message for profile/account save mutations,
 * prioritizing explicit optimistic-concurrency conflict guidance on HTTP 409.
 */
export function resolveProfileSaveErrorMessage(
  error: unknown,
  t: (key: string) => string
): string {
  if (isConcurrencyConflictError(error)) {
    return t("profile.common.concurrencyConflict");
  }
  return extractBackendErrorDetail(error) ?? t("profile.common.saveFailed");
}
