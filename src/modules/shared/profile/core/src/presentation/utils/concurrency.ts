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
  return error instanceof Error && error.message.trim()
    ? error.message
    : t("profile.common.saveFailed");
}
