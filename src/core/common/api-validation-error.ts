/**
 * API Validation Error Parser
 *
 * Normalizes ASP.NET Core RFC 7807/9110 Problem Details and API validation error
 * responses into structured field errors and a human-readable summary message.
 */

export interface ApiValidationErrorResult {
  fieldErrors: Record<string, string>;
  summaryMessage?: string;
  hasFieldErrors: boolean;
}

export function parseApiValidationError(
  error: unknown,
  knownFieldNames?: readonly string[]
): ApiValidationErrorResult {
  const err = error as Record<string, any> | null | undefined;
  const details = err?.details as Record<string, any> | undefined;
  const responseData = err?.response?.data as Record<string, any> | undefined;

  const rawErrors: unknown =
    details?.errors ?? responseData?.errors ?? err?.errors;

  const fieldErrors: Record<string, string> = {};

  if (rawErrors && typeof rawErrors === "object" && !Array.isArray(rawErrors)) {
    for (const [rawKey, val] of Object.entries(rawErrors as Record<string, unknown>)) {
      const cleanKey = rawKey.replace(/^\$\./, "");
      const matched = knownFieldNames?.find(
        (k) => k.toLowerCase() === cleanKey.toLowerCase()
      );
      const normalizedKey =
        matched || (cleanKey ? cleanKey.charAt(0).toLowerCase() + cleanKey.slice(1) : cleanKey);

      let msg: string | undefined;
      if (Array.isArray(val)) {
        msg = val.find((m) => typeof m === "string" && m.trim() !== "");
      } else if (typeof val === "string" && val.trim() !== "") {
        msg = val;
      }

      if (msg) {
        fieldErrors[normalizedKey] = msg;
      }
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const firstErrorMessage = Object.values(fieldErrors)[0];

  const summaryMessage =
    firstErrorMessage ||
    (typeof details?.detail === "string" && details.detail.trim() !== "" ? details.detail : undefined) ||
    (typeof details?.message === "string" && details.message.trim() !== "" ? details.message : undefined) ||
    (typeof details?.title === "string" && details.title.trim() !== "" ? details.title : undefined) ||
    (typeof responseData?.detail === "string" && responseData.detail.trim() !== "" ? responseData.detail : undefined) ||
    (typeof responseData?.message === "string" && responseData.message.trim() !== "" ? responseData.message : undefined) ||
    (typeof responseData?.title === "string" && responseData.title.trim() !== "" ? responseData.title : undefined) ||
    (typeof err?.message === "string" && err.message.trim() !== "" ? err.message : undefined);

  return {
    fieldErrors,
    summaryMessage,
    hasFieldErrors,
  };
}
