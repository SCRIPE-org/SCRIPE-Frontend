import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "🏗️",
        titleKey: "commercial.entitlementsTenantPlans.visualPlanBuilderTitle",
        descriptionKey: "commercial.entitlementsTenantPlans.visualPlanBuilderDesc",
      },
      {
        icon: "🔑",
        titleKey: "commercial.entitlementsTenantPlans.featureBundlingTitle",
        descriptionKey: "commercial.entitlementsTenantPlans.featureBundlingDesc",
      },
      {
        icon: "💰",
        titleKey: "commercial.entitlementsTenantPlans.flexiblePricingTitle",
        descriptionKey: "commercial.entitlementsTenantPlans.flexiblePricingDesc",
      },
      {
        icon: "👥",
        titleKey: "commercial.entitlementsTenantPlans.userLimitsTitle",
        descriptionKey: "commercial.entitlementsTenantPlans.userLimitsDesc",
      },
      {
        icon: "⏳",
        titleKey: "commercial.entitlementsTenantPlans.freeTrialsTitle",
        descriptionKey: "commercial.entitlementsTenantPlans.freeTrialsDesc",
      },
      {
        icon: "🔒",
        titleKey: "commercial.entitlementsTenantPlans.tenantScopedTitle",
        descriptionKey: "commercial.entitlementsTenantPlans.tenantScopedDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.entitlementsTenantPlans.whatArePlansTitle",
    id: "what-are-tenant-plans",
  },
  {
    type: "table",
    headers: ["Tier", "Who Subscribes", "What They Subscribe To", "Managed By"],
    rows: [
      [
        "Tier 1",
        "Tenants",
        "Platform Editions (Free, Pro, Enterprise)",
        "SCRIPE Platform Operator",
      ],
      ["Tier 2", "End Users", "Tenant Plans (created by the tenant)", "Tenant Administrators"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.entitlementsTenantPlans.planConfigTitle",
    id: "plan-config",
  },
  {
    type: "table",
    headers: ["Setting", "Options"],
    rows: [
      ["Billing Cycle", "Monthly, Yearly, Lifetime, Free"],
      ["Price", "Any decimal amount in the tenant's configured currency"],
      ["Max Users", "-1 (unlimited) or a specific number"],
      ["Trial Days", "0 (no trial) or any number of days"],
      ["Feature Flags", "Unlimited key/value pairs (e.g. maxProjects=50, apiAccess=true)"],
    ],
  },
];

registerPage({
  slug: "commercial/entitlements-tenant-plans",
  titleKey: "commercial.entitlementsTenantPlans.title",
  descriptionKey: "commercial.entitlementsTenantPlans.description",
  category: "commercial-modules",
  order: 21,
  sections,
  relatedSlugs: [
    "commercial/entitlements-overview",
    "commercial/billing-payments",
    "commercial/entitlements-user-subscriptions",
  ],
  lastUpdated: "2026-04-18",
});
