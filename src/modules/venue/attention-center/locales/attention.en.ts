export const en = {
  attention: {
    eyebrow: "Venue operations",
    title: "Attention Center",
    description: "Current, source-truth operational issues visible within your Venue data scope.",
    refresh: "Refresh",
    asOf: "Evaluated at {value}. Signals disappear when their authoritative source is corrected.",
    openBooking: "Open booking",
    openAvailability: "Open availability",
    permission: {
      title: "Attention Center is unavailable",
      description: "You do not have permission to view Venue operational attention.",
    },
    error: {
      title: "Attention could not be loaded",
      description: "The source-truth projection is temporarily unavailable.",
      retry: "Try again",
    },
    empty: {
      title: "No visible attention signals",
      description:
        "There are no current signals within the resources and source categories you can view.",
    },
    severity: { High: "High", Warning: "Warning" },
    signal: {
      PublishedResourceWithoutUsableBaseCalendar: {
        title: "Published resource needs a base calendar",
        description:
          "This published resource has no active usable recurring availability calendar.",
      },
      HardBlackoutOverlapsLiveAllocation: {
        title: "Hard blackout overlaps a live allocation",
        description:
          "A hard safety closure overlaps a reservation that currently occupies capacity.",
      },
      HardMaintenanceBlockOverlapsLiveAllocation: {
        title: "Hard maintenance closure overlaps a live allocation",
        description:
          "A hard maintenance closure overlaps a reservation that currently occupies capacity.",
      },
    },
  },
};
