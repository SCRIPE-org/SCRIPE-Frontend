import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

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
      { id: "A", label: "SCRIPE Platform (Operator)", type: "primary" },
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
      ["TenantId", "Guid", "The tenant that owns and manages this plan"],
      ["Name", "string(200)", "Internal name — unique per tenant"],
      [
        "DisplayNameEn / DisplayNameAr",
        "string?",
        "Localized display titles shown on pricing pages (up to 300 chars each)",
      ],
      [
        "Description",
        "string?",
        "Marketing description for the plan (pricing page copy, up to 2000 chars)",
      ],
      ["Tagline", "string?", "Short tagline (e.g. 'Best for growing teams', up to 200 chars)"],
      ["Status", "PlanStatus", "Draft | Published | Archived — plan lifecycle state"],
      ["IsPublic", "bool", "Whether this plan is visible on the tenant's public pricing page"],
      ["IsRetired", "bool", "When true, no new subscribers allowed"],
      ["IsActive", "bool", "Whether this plan is currently accepting subscribers"],
      ["SortOrder", "int", "Display order on pricing pages (ascending)"],
      ["BadgeText", "string?", "Pricing highlight badge text (e.g. 'Most Popular', 'Best Value')"],
      ["Color", "string?", "Hex color for plan card (e.g. '#6366f1')"],
      ["IconName", "string?", "Icon identifier for the plan card"],
      ["MaxSubscribers", "int?", "Max concurrent active subscribers per plan. Null = unlimited"],
      ["MaxUsers", "int", "Max users per subscription (-1 = unlimited)"],
      [
        "AllowMonthly / AllowYearly / AllowLifetime / AllowTrial",
        "bool",
        "Billing cycle configuration toggles",
      ],
      ["IsSelfServiceEnabled", "bool", "Whether end-users can self-subscribe to this plan"],
      [
        "IsContactSalesOnly",
        "bool",
        "Enterprise plan — requires contacting sales (no self-service)",
      ],
      ["TrialDays", "int", "Number of trial days before billing starts (0 = no trial)"],
      ["TrialIsFree", "bool", "Whether the trial is 100% free (true) or discounted (false)"],
      ["TrialDiscountPercent", "int", "Discount percentage during trial period (0–100)"],
      ["GracePeriodDays", "int", "Grace period days after expiry before subscription suspension"],
      [
        "FallbackPlanId",
        "Guid?",
        "Fallback plan when this plan is archived or a subscriber expires",
      ],
      ["TierLevel", "int", "Tier hierarchy (0 = Free, 1 = Basic, 2 = Pro, etc.)"],
      ["CurrentVersion", "int", "Published version number — incremented on each publish action"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.tenantPlans.entityNote",
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
      ["tenant_plans.update", "Edit plan name, status, features"],
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
