export const reportsEn = {
  title: "Academy Dashboards & Operational Analytics",
  subtitle: "Authoritative real-time reporting across enrollments, multi-sport athletes, effective-dated capacity fill, and governed exports",
  asOf: "As of",
  refresh: "Refresh",
  exportData: "Export Operational Data",
  sourceNotice: "Authoritative SCRIPE Academy operational metrics. Financial figures are projected exclusively from SCRIPE Finance. S5/S6 attendance metrics are frozen under contract.",

  // Filter Bar
  filters: {
    allBranches: "All Branches",
    allPrograms: "All Programs",
    allSeasons: "All Seasons",
    filterByBranch: "Filter by Branch",
    filterByProgram: "Filter by Program",
    filterBySeason: "Filter by Season",
    apply: "Apply Filters",
    reset: "Reset"
  },

  // KPI Summary
  kpi: {
    uniqueAthletes: "Active Unique Athletes",
    uniqueAthletesSub: "Deduplicated across multi-sport programs",
    registeredAthletes: "Registered Athletes",
    withEnrollments: "with enrollments",
    activeEnrollments: "Active Enrollments",
    activeEnrollmentsSub: "Current active program seats",
    multiSport: "Multi-Sport Athletes",
    multiSportSub: "Athletes active in >= 2 sports",
    groupCapacity: "Avg Group Fill Rate",
    groupCapacitySub: "Effective active roster vs max capacity",
    trialConversion: "Trial Conversion Rate",
    trialConversionSub: "Accepted trials vs evaluated"
  },

  // Group Capacity Table
  groupTable: {
    title: "Training Group Capacity & Effective Roster Fill",
    groupName: "Group Name",
    offering: "Program / Offering",
    branch: "Branch",
    capacity: "Capacity (Min • Max)",
    minMaxFormat: "Min {min} • Max {max}",
    activeMembers: "Active Members",
    fillRate: "Fill Rate",
    status: "Status",
    statusActive: "Active (Open)",
    statusFull: "Active (At Capacity)",
    statusUncapped: "Open (Uncapped)",
    empty: "No training groups found for current filter.",
    zeroCapacityWarning: "Capacity Not Set (0.0%)"
  },

  // Trial Funnel
  trialFunnel: {
    title: "Trial Pipeline & Conversion Funnel",
    totalTrials: "Total Trials",
    requested: "Requested",
    scheduled: "Scheduled",
    attendedEvaluated: "Attended / Evaluated",
    accepted: "Accepted",
    rejected: "Rejected",
    conversionRate: "Conversion Rate",
    conversionNote: "Calculated as Accepted / Attended. Unattended trials excluded from denominator."
  },

  // Financial Snapshot
  finance: {
    title: "Authoritative Receivables Snapshot",
    sourceBadge: "SCRIPE Finance Source of Truth",
    currency: "Currency",
    invoiced: "Total Invoiced",
    paid: "Total Paid",
    outstanding: "Outstanding Balance",
    overdue: "Overdue Amount",
    noData: "No financial receivables recorded for this scope.",
    governanceNote: "Read directly from Finance CustomerInvoice ledger. Academy never infers payment state."
  },

  // Codex Deferred Metrics
  deferredNotice: {
    title: "Codex S5/S6 Metrics — Deferred Integration Seam",
    badge: "DEFERRED_PENDING_CODEX_S5_S6",
    attendanceRate: "Attendance Rate",
    coachWorkload: "Coach Session Workload",
    sessionUtilization: "Session Utilization Rate",
    pendingValue: "Awaiting S5/S6 Merge",
    contractTitle: "Awaiting Verified Modules:",
    description: "Attendance and session operational metrics depend on Codex S5 Training Sessions and S6 Attendance modules currently in development. Per SCRIPE architecture rules, metrics are explicitly withheld until Codex contracts are delivered. No fabricated values are shown."
  },

  // Export Dialog
  exportDialog: {
    title: "Governed Operational CSV Export",
    description: "Export operational datasets with server-enforced tenant/branch boundaries, CSV formula sanitization, and child safeguarding PII masking.",
    datasetLabel: "Select Dataset",
    datasetAthletes: "Athletes (Deduplicated, Protected PII)",
    datasetEnrollments: "Enrollments (Active & Historical)",
    datasetGroups: "Training Groups & Capacity Fill",
    datasetTrials: "Trial Funnel & Evaluations",
    piiNotice: "Safeguarding Policy Active: Minor guardian phone, personal email, and confidential medical clearance notes are strictly redacted from exports.",
    csvSanitizationNotice: "Formula injection protection active: values starting with =, +, -, @, \\t, \\r are safely prefixed with single quote.",
    cancel: "Cancel",
    download: "Download Governed CSV"
  },

  // Status & Error
  loading: "Loading authoritative operational analytics...",
  error: "An error occurred while loading analytics.",
  retry: "Retry"
};
