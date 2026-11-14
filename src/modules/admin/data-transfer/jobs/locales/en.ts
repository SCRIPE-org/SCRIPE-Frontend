/**
 * English translations for data transfer jobs sub-module.
 */
export const en = {
  adminDataTransferJobs: {
    title: "Transfer Jobs & Executions",
    subtitle: "Real-time monitoring, progress telemetry, and artifact management for all background import, export, and migration pipelines.",
    searchPlaceholder: "Search by job ID, entity, or file name...",
    empty: {
      title: "No transfer jobs found",
      description: "No data transfer jobs match the selected filter criteria.",
    },
    kpis: {
      totalJobs: "Total Jobs",
      activeJobs: "Active / Running",
      completedJobs: "Completed",
      failedJobs: "Failed / Cancelled",
    },
    columns: {
      jobId: "Job ID",
      kind: "Type",
      entityKey: "Target Entity",
      status: "Execution Status",
      progress: "Progress",
      rowsSummary: "Processed / Total",
      metrics: "Committed / Rejected",
      createdAt: "Submitted",
      actions: "Actions",
    },
    kinds: {
      Import: "Import",
      Export: "Export",
      Migration: "Migration",
    },
    statuses: {
      Queued: "Queued",
      Pending: "Pending",
      Running: "Executing",
      Completed: "Completed",
      CompletedWithErrors: "Completed with Errors",
      Failed: "Failed",
      Cancelled: "Cancelled",
      Expired: "Expired",
    },
    actions: {
      cancel: "Cancel Job",
      cancelPrompt: "Cancel this job execution?",
      downloadRejected: "Download Rejections",
      downloadExport: "Download Export",
      launchStudio: "Launch Studio",
      refresh: "Refresh Telemetry",
    },
    tenantRequired: {
      title: "Tenant Context Required",
      description: "Data transfer background jobs and executions are scoped to a tenant. Please switch to an active tenant context to view and execute jobs.",
      switchHint: "Use the Tenant Workspace switcher in the top header bar or open Tenants to impersonate a tenant workspace.",
      goToTenants: "Go to Tenants",
      retry: "Check Context Again",
    },
    cancelDialog: {
      title: "Cancel Transfer Job",
      description: "Are you sure you want to request cancellation for job {jobId}? In-flight batches will be safely halted and committed records preserved.",
      confirm: "Yes, Cancel Job",
      cancelling: "Cancelling job...",
      success: "Cancellation requested successfully.",
      error: "Failed to cancel job.",
    },
    download: {
      starting: "Preparing download...",
      success: "Artifact downloaded successfully.",
      failed: "Failed to download artifact workbook.",
    },
    filters: {
      allStatuses: "All Statuses",
      allKinds: "All Types",
    },
  },
};
