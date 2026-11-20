/**
 * SCRIPE CRM Module Permissions.
 *
 * Authority: CRMPermissionProvider.cs (CRM.Infrastructure).
 * Total Active Definitions: 32 (27 Route/Action + 5 Polymorphic Bridge).
 */
export const CRM_PERMISSIONS = {
  // ── Overview (1) ────────────────────────────────────────────────
  OVERVIEW_READ: "crm.overview.read",

  // ── Leads (5) ──────────────────────────────────────────────────
  LEADS_READ: "crm.leads.read",
  LEADS_CREATE: "crm.leads.create",
  LEADS_UPDATE: "crm.leads.update",
  LEADS_QUALIFY: "crm.leads.qualify",
  LEADS_VIEW: "crm.leads.view",

  // ── Accounts (4) ───────────────────────────────────────────────
  ACCOUNTS_READ: "crm.accounts.read",
  ACCOUNTS_CREATE: "crm.accounts.create",
  ACCOUNTS_UPDATE: "crm.accounts.update",
  ACCOUNTS_VIEW: "crm.accounts.view",

  // ── Contacts (4) ───────────────────────────────────────────────
  CONTACTS_READ: "crm.contacts.read",
  CONTACTS_CREATE: "crm.contacts.create",
  CONTACTS_UPDATE: "crm.contacts.update",
  CONTACTS_VIEW: "crm.contacts.view",

  // ── Opportunities / Deals (8) ──────────────────────────────────
  OPPORTUNITIES_READ: "crm.opportunities.read",
  OPPORTUNITIES_CREATE: "crm.opportunities.create",
  OPPORTUNITIES_UPDATE: "crm.opportunities.update",
  OPPORTUNITIES_STAGE: "crm.opportunities.stage",
  OPPORTUNITIES_CLOSE: "crm.opportunities.close",
  OPPORTUNITIES_STAGE_OVERRIDE: "crm.opportunities.stage.override",
  OPPORTUNITIES_REOPEN: "crm.opportunities.reopen",
  OPPORTUNITIES_VIEW: "crm.opportunities.view",

  // ── Administration & Records (1) ───────────────────────────────
  RECORDS_ASSIGN: "crm.records.assign",

  // ── Activities (3) ─────────────────────────────────────────────
  ACTIVITIES_READ: "crm.activities.read",
  ACTIVITIES_CREATE: "crm.activities.create",
  ACTIVITIES_FOLLOWUP: "crm.activities.followup",

  // ── Communications (1) ─────────────────────────────────────────
  COMMUNICATIONS_SEND: "crm.communications.send",

  // ── Pipelines (2) ──────────────────────────────────────────────
  PIPELINES_READ: "crm.pipelines.read",
  PIPELINES_MANAGE: "crm.pipelines.manage",

  // ── Settings & Decoupled Pipeline/Workflow Roles (3) ───────────
  SETTINGS_MANAGE: "crm.settings.manage",
  WORKFLOW_ROLES_MANAGE: "crm.workflow_roles.manage",
  ROLES_MANAGE_SCOPED: "crm.roles.manage_scoped",

  // ── Reports (2) ────────────────────────────────────────────────
  REPORTS_READ: "crm.reports.read",
  REPORTS_EXPORT: "crm.reports.export",

  // ── Platform Operations (1) ────────────────────────────────────
  SALES_FULFILLMENT_REQUEST: "provider.sales.fulfillment.request",
} as const;

/** Union type of all CRM permission string constants. */
export type CrmPermission = (typeof CRM_PERMISSIONS)[keyof typeof CRM_PERMISSIONS];
