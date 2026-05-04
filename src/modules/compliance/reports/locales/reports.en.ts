/**
 * Compliance — Reports sub-module locale (English)
 */
export const en = {
  compliance: {
    reportsTitle: "Compliance Reports",
    reportType: "Report Type",
    period: "Period",
    periodStart: "Period Start",
    periodEnd: "Period End",
    generateReport: "Generate Report",
    reportReady: "Ready",
    reportPending: "Generating...",
    downloadReport: "Download",
    reportDetail: "Report Detail",
    reportTypes: {
      gdprOverview: "GDPR Overview",
      dsrSummary: "DSR Activity Summary",
      consentAudit: "Consent Audit",
      retentionAnalysis: "Retention Analysis",
      dataInventory: "Data Inventory Export",
    },
    status: {
      ready: "Ready",
      generating: "Generating...",
      pending: "Pending",
      failed: "Failed",
    },

    // Messages
    reportQueued: "Report generation queued",
    reportQueuedDesc: "Refresh in a few minutes to see your report.",

    // Dialog
    generateReportDesc: "Select a report type and optional date range to generate a compliance report.",
    reportQueuedInfo: "Reports are generated asynchronously. Refresh the list after a few minutes to see your report.",

    // Empty states
    noReports: "No reports generated",
    noReportsDesc: "Generate your first compliance report to get started.",

    // Report detail actions
    mvpExportTitle: "MVP Export",
    mvpExportDesc: "Full OpenXML/PDF exports with charts are planned. For now, download as CSV or TSV.",

    // Download format labels
    downloadCsv: "Download CSV",
    downloadTsv: "Download Spreadsheet (TSV)",
    downloadJson: "Download JSON",
    downloadTxt: "Download Text Summary",
  },
};
