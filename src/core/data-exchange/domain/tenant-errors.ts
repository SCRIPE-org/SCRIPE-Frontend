interface ErrorPayloadLike {
  code?: unknown;
  errorCode?: unknown;
  error?: unknown;
  message?: unknown;
  title?: unknown;
  detail?: unknown;
}

interface HttpErrorLike extends ErrorPayloadLike {
  status?: unknown;
  details?: unknown;
  response?: {
    status?: unknown;
    data?: unknown;
  };
}

function payloadHasTenantRequiredCode(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    if (typeof payload === "string") {
      return (
        payload.includes("DataTransfer.TenantRequired") ||
        payload.includes("Tenant context is required")
      );
    }
    return false;
  }

  const record = payload as ErrorPayloadLike;
  const candidates = [
    record.errorCode,
    record.code,
    record.error,
    record.title,
    record.detail,
    record.message,
  ];

  return candidates.some((val) => {
    if (typeof val !== "string") return false;
    return (
      val === "DataTransfer.TenantRequired" ||
      val.includes("DataTransfer.TenantRequired") ||
      val.includes("Tenant context is required")
    );
  });
}

/**
 * Determines whether an error returned from ApiService or TanStack Query
 * represents the backend 422 `DataTransfer.TenantRequired` guard triggered
 * when a Platform Super Admin accesses tenant-scoped endpoints without an
 * active tenant workspace selected.
 */
export function isTenantRequiredError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "string") {
    return payloadHasTenantRequiredCode(error);
  }
  if (typeof error !== "object") return false;

  const err = error as HttpErrorLike;
  if (payloadHasTenantRequiredCode(err)) return true;
  if (payloadHasTenantRequiredCode(err.details)) return true;
  if (payloadHasTenantRequiredCode(err.response?.data)) return true;

  const status =
    typeof err.status === "number"
      ? err.status
      : typeof err.response?.status === "number"
        ? err.response.status
        : undefined;

  if (status === 422) {
    const rawDetail = JSON.stringify(err.details ?? err.response?.data ?? err.message ?? "");
    if (/tenant/i.test(rawDetail) && /required|context/i.test(rawDetail)) {
      return true;
    }
  }

  return false;
}
