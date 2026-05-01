export const en = {
  compliance: {
    // Navigation / section titles
    title: "Compliance Center",
    subtitle: "GDPR, CCPA & Multi-Regulation Management",
    dashboard: "Dashboard",
    consent: "Consent Management",
    dsrQueue: "Data Subject Requests",
    retentionPolicies: "Retention Policies",
    dataInventory: "Data Inventory",
    reports: "Reports",

    // Dashboard KPIs
    openDsrs: "Open DSRs",
    pendingDsrs: "Pending Review",
    overdueDsrs: "Overdue",
    slaCompliance: "SLA Compliance",
    consentOptIn: "Consent Opt-In Rate",
    requiresReConsent: "Require Re-Consent",

    // Regulation
    regulations: "Regulations",
    regulation: "Regulation",
    gdpr: "GDPR",
    ccpa: "CCPA",
    active: "Active",
    inactive: "Inactive",
    deadlineDays: "Deadline (days)",
    purposes: "Consent Purposes",

    // Consent
    consentStatus: "Consent Status",
    granted: "Granted",
    withdrawn: "Withdrawn",
    lastUpdated: "Last Updated",
    recordConsent: "Record Consent",
    updateConsent: "Update Consent",
    consentVersion: "Consent Version",
    reConsentRequired: "Re-Consent Required",
    purposeKey: "Purpose",
    purposeName: "Purpose Name",
    legalBasis: "Legal Basis",
    required: "Required",
    optional: "Optional",

    // DSR
    dsr: "Data Subject Request",
    dsrId: "DSR ID",
    requestType: "Request Type",
    status: "Status",
    subject: "Data Subject",
    subjectEmail: "Subject Email",
    subjectType: "Subject Type",
    deadline: "Deadline",
    daysRemaining: "Days Remaining",
    slaProgress: "SLA Progress",
    submittedAt: "Submitted",
    completedAt: "Completed",
    reviewedBy: "Reviewed By",
    notes: "Notes",
    resolution: "Resolution",
    requesterNotes: "Requester Notes",

    // DSR Types
    export: "Data Export",
    erasure: "Data Erasure",
    rectification: "Rectification",
    restriction: "Processing Restriction",

    // DSR Status
    pending: "Pending",
    inReview: "In Review",
    approved: "Approved",
    processing: "Processing",
    partiallyCompleted: "Partially Completed",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",

    // DSR Actions
    approveDsr: "Approve DSR",
    rejectDsr: "Reject DSR",
    cancelDsr: "Cancel DSR",
    submitDsr: "Submit DSR",
    confirmErasure: "Confirm Erasure",
    downloadExport: "Download Export",
    viewDetail: "View Detail",
    moduleExecutions: "Module Executions",

    // Erasure gate
    erasureGate: "Erasure Confirmation Gate",
    erasureGateWarning: "This action is irreversible. All PII will be anonymized permanently.",
    erasureGraceNotice: "A grace period applies before execution.",
    confirmErasureTitle: "Confirm Irreversible Erasure",

    // Retention
    retentionCategory: "Category",
    retentionDays: "Retention Period",
    minRetention: "Min. Days",
    maxRetention: "Max. Days",
    expiryAction: "Expiry Action",
    anonymize: "Anonymize",
    delete: "Delete",
    nextEvaluation: "Next Evaluation",
    executionHistory: "Execution History",
    recordsProcessed: "Records Processed",
    recordsAnonymized: "Anonymized",
    recordsDeleted: "Deleted",
    updatePolicy: "Update Policy",

    // Data Inventory
    module: "Module",
    entity: "Entity",
    field: "Field",
    dataCategory: "Category",
    isAnonymized: "Anonymized on Erasure",
    isExported: "Included in Export",

    // Reports
    reportType: "Report Type",
    period: "Period",
    periodStart: "Period Start",
    periodEnd: "Period End",
    generateReport: "Generate Report",
    reportReady: "Ready",
    reportPending: "Generating...",
    downloadReport: "Download",

    // Messages
    consentRecorded: "Consent recorded successfully",
    dsrSubmitted: "Data subject request submitted",
    dsrApproved: "DSR approved",
    dsrRejected: "DSR rejected",
    dsrCancelled: "DSR cancelled",
    erasureConfirmed: "Erasure confirmed — grace period started",
    policyUpdated: "Retention policy updated",
    reportQueued: "Report generation queued",

    // Errors
    dsrNotFound: "DSR not found",
    regulationNotFound: "Regulation not found",
    invalidStatus: "Action not available in current DSR status",
    gracePeriodActive: "Erasure is still within the grace period",

    // Empty states
    noDsrs: "No data subject requests",
    noDsrsDesc: "DSR submissions will appear here",
    noPolicies: "No retention policies configured",
    noInventory: "No data inventory items",
    noReports: "No reports generated",
  },
};
