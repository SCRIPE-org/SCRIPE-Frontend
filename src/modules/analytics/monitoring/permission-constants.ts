/**
 * Monitoring Module Permissions
 *
 * Covers: Audit, Dashboard, Security, Analytics
 */
export const MONITORING_PERMISSIONS = {
  // ── Audit ───────────────────────────────────────────────
  AUDIT_VIEW: "audit.view",
  AUDIT_EXPORT: "audit.export",
  AUDIT_VIEW_CHILDREN: "audit.view_children",
  AUDIT_EXPORT_PDF: "audit.export_pdf",

  // ── Dashboard ───────────────────────────────────────────
  DASHBOARD_VIEW: "dashboard.view",
  DASHBOARD_VIEW_SYSTEM: "dashboard.view_system",

  // ── Security Monitoring ────────────────────────────────
  SECURITY_VIEW: "security.view",
  SECURITY_MANAGE_SETTINGS: "security.manage_settings",

  // ── Analytics ──────────────────────────────────────────
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_VIEW_CHILDREN: "analytics.view_children",
  ANALYTICS_EXPORT: "analytics.export",

  // ── Observability & Platform Health ───────────────────────
  OBSERVABILITY_VIEW: "observability.view",
} as const;
