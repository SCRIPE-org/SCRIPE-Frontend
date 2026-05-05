/**
 * Compliance — DSR sub-module locale (English)
 */
export const en = {
  compliance: {
    dsrTitle: "Data Subject Requests",
    dsr: "Data Subject Request",
    dsrId: "DSR ID",
    requestType: "Request Type",
    status: "Status",
    subject: "Data Subject",
    subjectEmail: "Subject Email",
    subjectType: "Subject Type",
    deadline: "Deadline",
    daysRemaining: "Days Remaining",
    remaining: "remaining",
    sla: "SLA",
    slaProgress: "SLA Progress",
    submittedAt: "Submitted",
    completedAt: "Completed",
    reviewedBy: "Reviewed By",
    notes: "Notes",
    resolution: "Resolution",
    requesterNotes: "Requester Notes",
    overdue: "Overdue",
    completed: "Completed",
    allTypes: "All Types",
    total: "total",

    // DSR Types
    export: "Data Export",
    erasure: "Data Erasure",
    rectification: "Rectification",
    restriction: "Processing Restriction",

    requestTypes: {
      export: "Export",
      erasure: "Erasure",
      rectification: "Rectification",
      restriction: "Restriction",
    },
    regulations: {
      gdpr: "GDPR",
      ccpa: "CCPA",
      pdpa: "PDPA",
    },

    // DSR Status (flat — used by DsrView filter pills via dynamic key construction)
    pending: "Pending",
    inReview: "In Review",
    approved: "Approved",
    processing: "Processing",
    partiallyCompleted: "Partially Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",

    // DSR Status labels (nested — used by DsrDetailView STATUS_META.labelKey)
    statusLabels: {
      pending: "Pending",
      inReview: "In Review",
      approved: "Approved",
      processing: "Processing",
      partiallyCompleted: "Partially Completed",
      completed: "Completed",
      rejected: "Rejected",
      cancelled: "Cancelled",
    },

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
    
    // Detail View Keys
    dsrDetailTitle: "DSR Details",
    confirmErasureBtn: "Confirm Erasure",
    downloadExportBtn: "Download Export",
    details: "Details",
    records: "records",
    statusHistory: "Status History",
    noHistory: "No history available.",
    erasureStatusTitle: "Erasure Status",
    erasureScheduledDesc: "Erasure confirmed. Execution scheduled.",
    erasurePendingDesc: "Awaiting final erasure confirmation.",
    confirmErasureDialogTitle: "Confirm Data Erasure",
    confirmErasureDialogDesc: "This action is irreversible. All associated personal data across all modules will be permanently anonymized or deleted according to retention policies.",
    typeConfirmToContinue: "Type CONFIRM to execute the erasure:",
    executeErasureBtn: "Execute Erasure",
    columns: {
      requestType: "Request Type",
      status: "Status",
      deadline: "Deadline",
      regulation: "Regulation",
      subjectEmail: "Subject",
    },

    // Empty states & errors
    noDsrs: "No data subject requests",
    noDsrsDesc: "DSR submissions will appear here",
    dsrNotFound: "DSR not found",
    invalidStatus: "Action not available in current DSR status",
    gracePeriodActive: "Erasure is still within the grace period",

    // Messages
    dsrSubmitted: "Data subject request submitted",
    dsrApproved: "DSR approved",
    dsrRejected: "DSR rejected",
    dsrCancelled: "DSR cancelled",
    erasureConfirmed: "Erasure confirmed — grace period started",

    // Dialog / form extras
    submitDsrDesc: "Submit a new data subject request on behalf of the subject.",
    resolutionPlaceholder: "Add resolution notes…",
    notesPlaceholder: "Optional notes for the requester…",

    // Shared labels
    active: "Active",
    inactive: "Inactive",
    regulation: "Regulation",
  },
};
