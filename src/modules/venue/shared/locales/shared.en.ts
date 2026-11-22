export const en = {
  venueShared: {
    status: {
      draft: "Draft",
      held: "Held",
      requested: "Requested",
      confirmed: "Confirmed",
      checkedIn: "Checked In",
      completed: "Completed",
      cancelled: "Cancelled",
      expired: "Expired",
      conflict: "Conflict",
    },
    countdown: {
      expiresIn: "Expires in {{time}}",
      expired: "Hold Expired",
      holdingCourt: "Holding Court",
    },
    quickLookup: {
      searchPlaceholder: "Search player by name, phone or email...",
      createPlayer: "+ Quick Add Player",
      individual: "Player / Individual",
      organization: "Corporate / Org",
      noResults: "No players found",
    },
    errors: {
      general: "An unexpected venue operational error occurred.",
      unexpectedTryAgain: "An unexpected error occurred. Please try again.",
      operationFailedTryLater: "An error occurred while processing the request.",
      concurrencyConflict:
        "This reservation was modified by another user. Please refresh and review.",
      conflict:
        "Booking or time slot was modified in another session. Please refresh and try again.",
      resourceUnavailable: "The selected court is unavailable for the requested timeframe.",
      holdExpired: "The temporary reservation hold has expired.",
      quotaExceeded:
        "Branch limit reached for your current subscription. Upgrade your plan to add more branches.",
      upgradePlan: "Upgrade Plan",
      courtNotReady:
        "This court or space is not ready for bookings. Please complete configuration first.",
      completeSetup: "Complete Setup",
      setupContextMissing:
        "Could not complete action because branch profile configuration is incomplete.",
      setupContextMissingShort:
        "Could not complete action because branch profile configuration is incomplete.",
      forbidden: "You do not have permission to perform this action.",
      notFound: "The requested item was not found or has been removed.",
      networkError: "Could not connect to the server. Please check your network connection and retry.",
    },
  },
};
