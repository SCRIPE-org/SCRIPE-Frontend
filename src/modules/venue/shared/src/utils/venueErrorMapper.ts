/**
 * Client-Safe Error Mapper for SCRIPE Venue
 * Maps domain codes, ASP.NET validation messages, and HTTP status codes
 * to client-friendly localized messages without exposing internal IDs,
 * DB exceptions, or dev overlay error strings.
 */

import { en as sharedEn } from "../../locales/shared.en";
import { ar as sharedAr } from "../../locales/shared.ar";

export interface VenueMappedError {
  code: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export function mapVenueError(error: unknown, language = "en"): VenueMappedError {
  const errorsDict = (language === "ar" ? sharedAr : sharedEn).venueShared.errors;

  if (!error) {
    return {
      code: "UNKNOWN",
      message: errorsDict.unexpectedTryAgain,
    };
  }

  // Handle strings directly
  if (typeof error === "string") {
    return mapCodeOrMessage(error, language);
  }

  // Handle standard Error / Axios-like Error objects
  const errObj = error as Record<string, any>;
  const status = errObj.status ?? errObj.response?.status;
  const data = errObj.response?.data ?? errObj.data ?? {};
  const code = (data.code ?? data.errorCode ?? errObj.code ?? "").toString();
  const rawMessage = (data.message ?? data.title ?? data.detail ?? errObj.message ?? "").toString();

  // 1. Quota Exceeded (e.g. Branch limit reached on Starter)
  if (
    code.toLowerCase().includes("quota") ||
    rawMessage.toLowerCase().includes("quota") ||
    code === "facility.quotaExceeded" ||
    rawMessage.includes("facility.quotaExceeded")
  ) {
    return {
      code: "QUOTA_EXCEEDED",
      message: errorsDict.quotaExceeded,
      action: {
        label: errorsDict.upgradePlan,
        href: "/billing",
      },
    };
  }

  // 2. Resource Readiness / Not Published
  if (
    code === "resource.notPublished" ||
    rawMessage.includes("resource.notPublished") ||
    rawMessage.includes("resourceNotPublished")
  ) {
    return {
      code: "COURT_NOT_READY",
      message: errorsDict.courtNotReady,
      action: {
        label: errorsDict.completeSetup,
        href: "/venue/resources",
      },
    };
  }

  // 3. Technical Model Validation Leak (e.g. VenueProfileId required)
  if (
    rawMessage.includes("VenueProfileId") ||
    rawMessage.includes("facilityProfile") ||
    rawMessage.includes("schedulableResource")
  ) {
    return {
      code: "SETUP_CONTEXT_MISSING",
      message: errorsDict.setupContextMissing,
    };
  }

  // 4. HTTP Status Code specific handling
  if (status === 403 || code === "Forbidden" || rawMessage.includes("permissionDenied")) {
    return {
      code: "FORBIDDEN",
      message: errorsDict.forbidden,
    };
  }

  if (status === 404 || code === "NotFound") {
    return {
      code: "NOT_FOUND",
      message: errorsDict.notFound,
    };
  }

  if (
    status === 409 ||
    code === "OperationConflict" ||
    rawMessage.toLowerCase().includes("conflict")
  ) {
    return {
      code: "CONFLICT",
      message: errorsDict.conflict,
    };
  }

  // 5. Network Failure / Offline
  if (
    code === "ERR_NETWORK" ||
    rawMessage.toLowerCase().includes("network error") ||
    rawMessage.toLowerCase().includes("failed to fetch")
  ) {
    return {
      code: "NETWORK_ERROR",
      message: errorsDict.networkError,
    };
  }

  // If there's a clean user message, use it; otherwise provide client-safe fallback
  if (
    rawMessage &&
    !rawMessage.includes("{") &&
    !rawMessage.includes("Exception") &&
    !rawMessage.includes("Error:")
  ) {
    return {
      code: code || "VALIDATION_ERROR",
      message: rawMessage,
    };
  }

  return {
    code: "GENERIC_ERROR",
    message: errorsDict.unexpectedTryAgain,
  };
}

function mapCodeOrMessage(text: string, language: string): VenueMappedError {
  const errorsDict = (language === "ar" ? sharedAr : sharedEn).venueShared.errors;

  if (text.includes("quota") || text.includes("facility.quotaExceeded")) {
    return {
      code: "QUOTA_EXCEEDED",
      message: errorsDict.quotaExceeded,
      action: {
        label: errorsDict.upgradePlan,
        href: "/billing",
      },
    };
  }

  if (text.includes("VenueProfileId")) {
    return {
      code: "SETUP_CONTEXT_MISSING",
      message: errorsDict.setupContextMissingShort,
    };
  }

  return {
    code: "ERROR",
    message: errorsDict.operationFailedTryLater,
  };
}
