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

    // DSR Status
    pending: "Pending",
    inReview: "In Review",
    approved: "Approved",
    processing: "Processing",
    partiallyCompleted: "Partially Completed",
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
  },
};
