import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.tenantPlans.intro" },

  // ─── B2B2C Concept ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.tenantPlans.conceptTitle",
    id: "b2b2c-model",
  },
  { type: "paragraph", contentKey: "modules.tenantPlans.conceptIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "NEXORA Platform (Operator)", type: "primary" },
      { id: "B", label: "Tier 1: Editions → Tenants", type: "info" },
      { id: "C", label: "Tenant Admin", type: "default" },
      { id: "D", label: "Tier 2: TenantPlans → Users", type: "info" },
      { id: "E", label: "End Users (UserSubscription)", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
    ],
  },

  // ─── TenantPlan Entity ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.tenantPlans.entityTitle",
    id: "tenantplan-entity",
  },
  { type: "paragraph", contentKey: "modules.tenantPlans.entityIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Name", "string(200)", "Plan display name (e.g. 'Basic', 'Pro', 'Enterprise')"],
      ["Description", "string?", "Human-readable plan description"],
      ["Price", "decimal(18,2)", "Monthly or annual price"],
      ["Currency", "Currency", "ISO currency code"],
      ["BillingCycle", "BillingCycle", "Monthly | Yearly | Lifetime | Free"],
      ["MaxUsers", "int?", "Max subscribers (-1 = unlimited)"],
      ["TrialDays", "int", "Trial period length in days (0 = no trial)"],
      ["IsActive", "bool", "Whether new subscribers can join this plan"],
      ["TenantId", "Guid", "Owning tenant — rows are isolated per tenant"],
    ],
  },

  // ─── TenantPlanFeature ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.tenantPlans.featureEntityTitle",
    id: "plan-features",
  },
  { type: "paragraph", contentKey: "modules.tenantPlans.featureEntityIntro" },
  {
    type: "code",
    language: "json",
    code: `// Example TenantPlanFeature records for a "Pro" plan
[
  { "Key": "maxProjects", "Value": "50" },
  { "Key": "apiAccess", "Value": "true" },
  { "Key": "supportLevel", "Value": "priority" },
  { "Key": "storageGb", "Value": "100" }
]`,
  },

  // ─── Plan Lifecycle ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.tenantPlans.lifecycleTitle",
    id: "plan-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.tenantPlans.lifecycleIntro" },

  // ─── Tenant Context Required ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.tenantPlans.contextTitle",
    id: "tenant-context",
  },
  { type: "paragraph", contentKey: "modules.tenantPlans.contextIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "modules.tenantPlans.contextIntro",
  },

  // ─── API Endpoints ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.tenantPlans.endpointsTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.tenantPlans.endpointsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/tenant-plans",
        descriptionKey: "modules.tenantPlans.ep.list",
        auth: "JWT",
        permission: "tenant_plans.view",
      },
      {
        method: "GET",
        path: "/api/v1/tenant-plans/{id}",
        descriptionKey: "modules.tenantPlans.ep.get",
        auth: "JWT",
        permission: "tenant_plans.view",
      },
      {
        method: "POST",
        path: "/api/v1/tenant-plans",
        descriptionKey: "modules.tenantPlans.ep.create",
        auth: "JWT",
        permission: "tenant_plans.create",
      },
      {
        method: "PUT",
        path: "/api/v1/tenant-plans/{id}",
        descriptionKey: "modules.tenantPlans.ep.update",
        auth: "JWT",
        permission: "tenant_plans.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/tenant-plans/{id}",
        descriptionKey: "modules.tenantPlans.ep.delete",
        auth: "JWT",
        permission: "tenant_plans.delete",
      },
    ],
  },

  // ─── Permissions ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.tenantPlans.permissionsTitle",
    id: "permissions",
  },
  { type: "paragraph", contentKey: "modules.tenantPlans.permissionsIntro" },
  {
    type: "table",
    headers: ["Permission", "Action"],
    rows: [
      ["tenant_plans.view", "View plan list and details"],
      ["tenant_plans.create", "Create new plans"],
      ["tenant_plans.update", "Edit plan name, price, features"],
      ["tenant_plans.delete", "Soft-delete a plan"],
    ],
  },
];

registerPage({
  slug: "modules/tenant-plans",
  titleKey: "modules.tenantPlans.title",
  descriptionKey: "modules.tenantPlans.description",
  category: "modules",
  order: 9,
  sections,
  relatedSlugs: [
    "modules/user-subscriptions",
    "modules/entitlements-overview",
    "features/tenant-context-gate",
  ],
  lastUpdated: "2026-04-18",
});
