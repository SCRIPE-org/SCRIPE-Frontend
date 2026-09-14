export const en = {
  venueOverview: {
    title: "Venue Overview",
    subtitle: "Live operational view of today’s venue activity.",
    header: {
      today: "Today",
      timezone: "Timezone",
      facility: "Facility",
      allFacilities: "All Facilities",
      refresh: "Refresh overview",
      refreshing: "Refreshing...",
    },
    kpis: {
      todayReservations: "Today’s Reservations",
      todayReservationsSubtext: "{{confirmed}} confirmed · {{checkedIn}} checked in",
      activeHolds: "Active Holds",
      nearestExpiry: "Nearest expiry in {{mins}}m",
      noActiveHolds: "No active holds",
      checkedInNow: "Checked In Now",
      checkedInNowSubtext: "Currently in operation",
      activeResources: "Active Resources Today",
      activeResourcesSubtext: "Featured in today’s schedule",
    },
    operationalLoad: {
      title: "Today’s Operational Load",
      subtitle: "Hourly distribution of scheduled booking blocks across today’s operating timeline.",
      noLoad: "No operational load scheduled for today.",
      legend: {
        checkedIn: "Checked In",
        confirmed: "Confirmed",
        held: "Held",
        completed: "Completed",
        other: "Other",
      },
      hourLabel: "{{hour}}:00",
    },
    atAGlance: {
      title: "Today at a Glance",
      subtitle: "Summary of booking lifecycle statuses represented in today’s schedule.",
      noBookings: "No booking activity recorded for today.",
    },
    upNext: {
      title: "Up Next",
      subtitle: "Chronological schedule of upcoming reservations remaining today.",
      noUpcoming: "No upcoming reservations scheduled for today.",
      columns: {
        time: "Time",
        resource: "Resource",
        customer: "Customer",
        reference: "Reference",
        status: "Status",
      },
      customerUnavailable: "Customer name unavailable",
      customerRestricted: "Restricted",
    },
    resourceActivity: {
      title: "Resource Activity",
      subtitle: "Quick operational scan of resources involved in today’s schedule.",
      noResources: "No schedulable resources configured.",
      status: {
        checkedIn: "Checked in · until {{time}}",
        nextBooking: "Next booking · {{time}}",
        noActiveBooking: "No active booking",
      },
    },
    quickActions: {
      title: "Quick Operator Actions",
      newBooking: "New booking",
      openCalendar: "Open calendar",
      viewBookings: "View all bookings",
    },
    deferred: {
      recentActivity: "Recent operational activity feed deferred: no bounded cross-reservation feed projection exists.",
    },
    empty: {
      noFacilityTitle: "No facilities configured",
      noFacilityDescription: "Create a facility before using the Venue Overview.",
    },
    errors: {
      loadFailed: "Operational data unavailable for Venue Overview.",
      retry: "Retry loading overview",
    },
  },
};
