export const en = {
  analyticsEvents: {
    title: "Analytics Event Stream",
    description: "Read-only view of the metric-event stream recorded by the SCRIPE Analytics Event Foundation.",
    emptyTitle: "No analytics events yet",
    emptyDescription: "The Analytics Event Store is ready and running. Events will appear here once Wave 2B (Facility & Booking), 2C (Academy), or 2D (Football Intelligence) modules begin recording metric events.",
    awaitingModules: "Awaiting producing modules (Wave 2B+)",
    activeStatus: "Active — events recorded",
    totalEvents: "Total Events",
    statusLabel: "Status",
    loading: "Loading event stream...",
    columns: {
      name: "Event Name",
      module: "Source Module",
      occurredAt: "Occurred At",
      subjectType: "Subject Type",
      subjectId: "Subject ID",
      numericValue: "Numeric Value",
    },
  },
};
