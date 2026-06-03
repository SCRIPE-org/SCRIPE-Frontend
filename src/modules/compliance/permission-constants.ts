/**
 * Compliance Module Permissions
 *
 * Covers: Compliance Dashboard, Regulations, Consent, DSR,
 * Retention Policies, Data Inventory, Reports
 */
export const COMPLIANCE_PERMISSIONS = {
  // ── Dashboard ──────────────────────────────────────────
  COMPLIANCE_DASHBOARD_VIEW: "compliance_dashboard.view",
  COMPLIANCE_DASHBOARD_EXPORT: "compliance_dashboard.export",

  // ── Regulation Profiles ────────────────────────────────
  COMPLIANCE_REGULATIONS_VIEW: "compliance_regulations.view",
  COMPLIANCE_REGULATIONS_MANAGE: "compliance_regulations.manage",

  // ── Consent Management ─────────────────────────────────
  COMPLIANCE_CONSENT_VIEW: "compliance_consent.view",
  COMPLIANCE_CONSENT_MANAGE: "compliance_consent.manage",
  COMPLIANCE_CONSENT_VIEW_ANALYTICS: "compliance_consent.view_analytics",

  // ── Data Subject Requests (DSR) ────────────────────────
  COMPLIANCE_DSR_VIEW: "compliance_dsr.view",
  COMPLIANCE_DSR_CREATE: "compliance_dsr.create",
  COMPLIANCE_DSR_REVIEW: "compliance_dsr.review",
  COMPLIANCE_DSR_EXECUTE: "compliance_dsr.execute",
  COMPLIANCE_DSR_CANCEL: "compliance_dsr.cancel",

  // ── Retention Policies ─────────────────────────────────
  COMPLIANCE_RETENTION_VIEW: "compliance_retention.view",
  COMPLIANCE_RETENTION_MANAGE: "compliance_retention.manage",

  // ── Data Inventory ─────────────────────────────────────
  COMPLIANCE_DATA_INVENTORY_VIEW: "compliance_data_inventory.view",
  COMPLIANCE_DATA_INVENTORY_MANAGE: "compliance_data_inventory.manage",

  // ── Reports ────────────────────────────────────────────
  COMPLIANCE_REPORTS_VIEW: "compliance_reports.view",
  COMPLIANCE_REPORTS_GENERATE: "compliance_reports.generate",
} as const;
