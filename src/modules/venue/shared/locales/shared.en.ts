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
      concurrencyConflict:
        "This reservation was modified by another user. Please refresh and review.",
      resourceUnavailable: "The selected court is unavailable for the requested timeframe.",
      holdExpired: "The temporary reservation hold has expired.",
    },
  },
};
