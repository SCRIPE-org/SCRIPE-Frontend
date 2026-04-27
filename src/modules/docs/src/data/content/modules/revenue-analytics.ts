import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.revenueAnalytics.intro" },

  // ─── KPI Overview ──────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.kpiTitle",
    id: "kpi-overview",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.kpiIntro" },
  {
    type: "table",
    headers: ["KPI", "Formula", "Description"],
    rows: [
      ["MRR", "Sum of active monthly-normalized revenue", "Monthly Recurring Revenue"],
      ["ARR", "MRR × 12", "Annual Recurring Revenue"],
      ["NRR", "(Start MRR + Expansion − Contraction − Churn) / Start MRR × 100", "Net Revenue Retention %"],
      ["ARPU", "MRR / Active Subscriptions", "Average Revenue Per User"],
      ["Churn Rate", "Cancelled Subs / Total Subs × 100", "Monthly subscription churn %"],
      ["Trial→Paid", "Converted Trials / Total Trials × 100", "Trial conversion rate"],
      ["Active Subs", "Count of Status=Active", "Total active subscriptions"],
      ["New Subs", "Count of subs created in period", "New subscriptions this period"],
    ],
  },

  // ─── 7-Tab Dashboard ──────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.tabsTitle",
    id: "dashboard-tabs",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.tabsIntro" },
  {
    type: "table",
    headers: ["Tab", "Key Visualizations", "Data Source"],
    rows: [
      ["Overview", "KPI cards, MRR sparkline, period selector", "AnalyticsSummary API"],
      ["MRR Waterfall", "Stacked bar chart: New, Expansion, Contraction, Churn, Reactivation", "MRR Movements API"],
      ["Cohort Retention", "Heatmap grid showing retention % by monthly cohort", "Cohort API"],
      ["LTV by Edition", "Bar chart comparing lifetime value per edition tier", "LTV API"],
      ["Revenue Forecast", "Line chart with 6-month linear regression + confidence bands", "Forecast API"],
      ["Health Scores", "Sortable table with risk badges (Healthy/At-Risk/Critical)", "Health Scores API"],
      ["Reports", "List of generated/scheduled reports with download links", "Reports API"],
    ],
  },

  // ─── AnalyticsSnapshot Entity ──────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.snapshotTitle",
    id: "analytics-snapshot",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.snapshotIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["SnapshotDate", "DateTime", "UTC date of the snapshot"],
      ["TenantId", "Guid?", "Null = aggregate row, non-null = tenant-specific"],
      ["Mrr", "decimal(18,2)", "Monthly Recurring Revenue at snapshot time"],
      ["Arr", "decimal(18,2)", "Annual Recurring Revenue (MRR × 12)"],
      ["ActiveSubscriptions", "int", "Count of active subscriptions"],
      ["NewSubscriptions", "int", "New subscriptions in the period"],
      ["ChurnedSubscriptions", "int", "Cancelled subscriptions in the period"],
      ["TrialSubscriptions", "int", "Active trial subscriptions"],
      ["ConvertedTrials", "int", "Trials that converted to paid"],
      ["TotalRevenue", "decimal(18,2)", "Cumulative revenue collected"],
    ],
  },

  // ─── Health Score Formula ──────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.healthTitle",
    id: "health-scores",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.healthIntro" },
  {
    type: "code", language: "text",
    code: `Health Score = (Payment × 0.40) + (Activity × 0.30) + (Growth × 0.30)

Payment Score (0-100):
  - 100 if no failed payments
  - Deduct 25 per failed payment in last 30 days
  - Minimum 0

Activity Score (0-100):
  - Based on admin login frequency in last 30 days
  - 100 = daily, 75 = weekly, 50 = biweekly, 25 = monthly, 0 = inactive

Growth Score (0-100):
  - 100 if user count grew > 20%
  - 75 if grew 10-20%
  - 50 if stable (±10%)
  - 25 if declined 10-20%
  - 0 if declined > 20%

Risk Classification:
  ≥ 70 → Healthy (green)
  40-69 → At-Risk (amber)
  < 40 → Critical (red)`,
  },

  // ─── Background Jobs Pipeline ─────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.jobsTitle",
    id: "background-jobs",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.jobsIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "snap", label: "AnalyticsSnapshotJob\n3:00 AM UTC", type: "primary" },
      { id: "health", label: "TenantHealthScoreJob\n4:00 AM UTC", type: "info" },
      { id: "report", label: "AnalyticsReportJob\n6:00 AM UTC", type: "success" },
    ],
    connections: [
      { from: "snap", to: "health", label: "Snapshots ready" },
      { from: "health", to: "report", label: "Scores updated" },
    ],
  },
  {
    type: "table",
    headers: ["Job", "Schedule", "Purpose", "Provider"],
    rows: [
      ["AnalyticsSnapshotJob", "Daily 3:00 AM", "Captures MRR/ARR/churn/trial metrics per tenant + aggregate", "Native / Hangfire / Quartz"],
      ["TenantHealthScoreJob", "Daily 4:00 AM", "Computes weighted health score for every active tenant", "Native / Hangfire / Quartz"],
      ["AnalyticsReportJob", "Daily 6:00 AM", "Generates and emails scheduled PDF reports", "Native / Hangfire / Quartz"],
    ],
  },
  {
    type: "info", variant: "note",
    contentKey: "modules.revenueAnalytics.jobsConfig",
  },

  // ─── API Endpoints ────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      { method: "GET", path: "/api/v1/analytics/summary", descriptionKey: "modules.revenueAnalytics.ep.summary", auth: "JWT", permission: "analytics.view" },
      { method: "GET", path: "/api/v1/analytics/mrr-movements", descriptionKey: "modules.revenueAnalytics.ep.mrr", auth: "JWT", permission: "analytics.view" },
      { method: "GET", path: "/api/v1/analytics/cohort-retention", descriptionKey: "modules.revenueAnalytics.ep.cohort", auth: "JWT", permission: "analytics.view" },
      { method: "GET", path: "/api/v1/analytics/ltv-by-edition", descriptionKey: "modules.revenueAnalytics.ep.ltv", auth: "JWT", permission: "analytics.view" },
      { method: "GET", path: "/api/v1/analytics/forecast", descriptionKey: "modules.revenueAnalytics.ep.forecast", auth: "JWT", permission: "analytics.view" },
      { method: "GET", path: "/api/v1/analytics/health-scores", descriptionKey: "modules.revenueAnalytics.ep.health", auth: "JWT", permission: "analytics.view_health" },
      { method: "GET", path: "/api/v1/analytics/snapshots", descriptionKey: "modules.revenueAnalytics.ep.snapshots", auth: "JWT", permission: "analytics.view" },
      { method: "GET", path: "/api/v1/analytics/export/{format}", descriptionKey: "modules.revenueAnalytics.ep.export", auth: "JWT", permission: "analytics.export" },
      { method: "GET", path: "/api/v1/analytics/reports", descriptionKey: "modules.revenueAnalytics.ep.reportList", auth: "JWT", permission: "analytics.manage_reports" },
      { method: "POST", path: "/api/v1/analytics/reports", descriptionKey: "modules.revenueAnalytics.ep.reportCreate", auth: "JWT", permission: "analytics.manage_reports" },
      { method: "PUT", path: "/api/v1/analytics/reports/{id}", descriptionKey: "modules.revenueAnalytics.ep.reportUpdate", auth: "JWT", permission: "analytics.manage_reports" },
      { method: "DELETE", path: "/api/v1/analytics/reports/{id}", descriptionKey: "modules.revenueAnalytics.ep.reportDelete", auth: "JWT", permission: "analytics.manage_reports" },
    ],
  },

  // ─── Export System ────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.exportTitle",
    id: "export-system",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.exportIntro" },
  {
    type: "table",
    headers: ["Format", "Extension", "Features"],
    rows: [
      ["CSV", ".csv", "Comma-separated values for spreadsheet import"],
      ["Excel", ".xlsx", "Multi-sheet workbook with charts and formatting"],
      ["PDF", ".pdf", "Branded report with KPI cards, charts, and tables"],
    ],
  },

  // ─── Scheduled Reports ────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.scheduledTitle",
    id: "scheduled-reports",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.scheduledIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["ReportName", "string(200)", "User-defined report name"],
      ["Cadence", "ReportCadence", "Daily | Weekly | Monthly"],
      ["Format", "ExportFormat", "CSV | Excel | PDF"],
      ["Recipients", "string[]", "Email addresses for delivery"],
      ["IncludeSections", "string[]", "Which KPI sections to include"],
      ["IsActive", "bool", "Whether the scheduled report is enabled"],
    ],
  },

  // ─── Permissions ──────────────────────────────────────────────
  {
    type: "heading", level: 2,
    titleKey: "modules.revenueAnalytics.permissionsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.revenueAnalytics.permissionsIntro" },
  {
    type: "table",
    headers: ["Permission", "Action"],
    rows: [
      ["analytics.view", "View analytics dashboard and KPI data"],
      ["analytics.view_health", "View tenant health scores"],
      ["analytics.export", "Export analytics data (CSV/Excel/PDF)"],
      ["analytics.manage_reports", "Create, edit, delete scheduled reports"],
    ],
  },
];

registerPage({
  slug: "modules/revenue-analytics",
  titleKey: "modules.revenueAnalytics.title",
  descriptionKey: "modules.revenueAnalytics.description",
  category: "modules",
  order: 11,
  sections,
  relatedSlugs: ["modules/billing-engine", "modules/subscriptions", "modules/entitlements-overview", "features/dashboard-hub"],
  lastUpdated: "2026-04-27",
});
