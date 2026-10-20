/**
 * Client-Safe Error Mapper for SCRIPE Venue
 * Maps domain codes, ASP.NET validation messages, and HTTP status codes
 * to client-friendly localized messages without exposing internal IDs,
 * DB exceptions, or dev overlay error strings.
 */

export interface VenueMappedError {
  code: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export function mapVenueError(error: unknown, language = "en"): VenueMappedError {
  const isAr = language === "ar";

  if (!error) {
    return {
      code: "UNKNOWN",
      message: isAr ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "An unexpected error occurred. Please try again.",
    };
  }

  // Handle strings directly
  if (typeof error === "string") {
    return mapCodeOrMessage(error, isAr);
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
      message: isAr
        ? "تم الوصول إلى الحد الأقصى للفروع في باقتك الحالية. يمكنك ترقية الخطة لإضافة فروع جديدة."
        : "Branch limit reached for your current subscription. Upgrade your plan to add more branches.",
      action: {
        label: isAr ? "ترقية الباقة" : "Upgrade Plan",
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
      message: isAr
        ? "هذا الملعب أو المساحة غير جاهز للحجوزات بعد. يرجى استكمال الإعداد أولاً."
        : "This court or space is not ready for bookings. Please complete configuration first.",
      action: {
        label: isAr ? "إكمال الإعداد" : "Complete Setup",
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
      message: isAr
        ? "تعذر إكمال العملية بسبب نقص في إعدادات المنشأة الأساسية. جاري إعادة ضبط السياق."
        : "Could not complete action because branch profile configuration is incomplete.",
    };
  }

  // 4. HTTP Status Code specific handling
  if (status === 403 || code === "Forbidden" || rawMessage.includes("permissionDenied")) {
    return {
      code: "FORBIDDEN",
      message: isAr
        ? "ليس لديك الصلاحية لتنفيذ هذا الإجراء في المنشأة."
        : "You do not have permission to perform this action.",
    };
  }

  if (status === 404 || code === "NotFound") {
    return {
      code: "NOT_FOUND",
      message: isAr
        ? "العنصر المطلوب غير موجود أو تم حذفه."
        : "The requested item was not found or has been removed.",
    };
  }

  if (status === 409 || code === "OperationConflict" || rawMessage.toLowerCase().includes("conflict")) {
    return {
      code: "CONFLICT",
      message: isAr
        ? "تعارض في البيانات أو تم حجز هذا الموعد للتو في جلسة أخرى. يرجى التحديث والمحاولة ثانية."
        : "Booking or time slot was modified in another session. Please refresh and try again.",
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
      message: isAr
        ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة."
        : "Could not connect to the server. Please check your network connection and retry.",
    };
  }

  // If there's a clean user message, use it; otherwise provide client-safe fallback
  if (rawMessage && !rawMessage.includes("{") && !rawMessage.includes("Exception") && !rawMessage.includes("Error:")) {
    return {
      code: code || "VALIDATION_ERROR",
      message: rawMessage,
    };
  }

  return {
    code: "GENERIC_ERROR",
    message: isAr ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "An unexpected error occurred. Please try again.",
  };
}

function mapCodeOrMessage(text: string, isAr: boolean): VenueMappedError {
  if (text.includes("quota") || text.includes("facility.quotaExceeded")) {
    return {
      code: "QUOTA_EXCEEDED",
      message: isAr
        ? "تم الوصول إلى الحد الأقصى للفروع في باقتك الحالية. يمكنك ترقية الخطة لإضافة فروع جديدة."
        : "Branch limit reached for your current subscription. Upgrade your plan to add more branches.",
      action: {
        label: isAr ? "ترقية الباقة" : "Upgrade Plan",
        href: "/billing",
      },
    };
  }

  if (text.includes("VenueProfileId")) {
    return {
      code: "SETUP_CONTEXT_MISSING",
      message: isAr
        ? "تعذر إكمال العملية بسبب نقص في إعدادات المنشأة الأساسية."
        : "Could not complete action because branch profile configuration is incomplete.",
    };
  }

  return {
    code: "ERROR",
    message: isAr ? "حدث خطأ أثناء تنفيذ العملية. يرجى المحاولة لاحقاً." : "An error occurred while processing the request.",
  };
}
