import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "🏗️",
        titleKey: "Visual Plan Builder",
        descriptionKey:
          "Tenant admins build subscription plans through a clean UI — no code required.",
      },
      {
        icon: "🔑",
        titleKey: "Feature Bundling",
        descriptionKey:
          "Attach unlimited key/value feature flags to each plan to control user capabilities.",
      },
      {
        icon: "💰",
        titleKey: "Flexible Pricing",
        descriptionKey:
          "Monthly, Yearly, Lifetime, and Free billing cycles with per-plan currency control.",
      },
      {
        icon: "👥",
        titleKey: "User Limits",
        descriptionKey:
          "Set maximum subscribers per plan or allow unlimited growth with -1 configuration.",
      },
      {
        icon: "⏳",
        titleKey: "Free Trials",
        descriptionKey:
          "Configure trial periods per plan — users get a trial before committing to a paid plan.",
      },
      {
        icon: "🔒",
        titleKey: "Tenant-Scoped",
        descriptionKey: "Plans are fully isolated per tenant — no visibility across tenants.",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "What are Tenant Plans?",
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
        "NEXORA Platform Operator",
      ],
      ["Tier 2", "End Users", "Tenant Plans (created by the tenant)", "Tenant Administrators"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "Plan Configuration",
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
  titleKey: "Tenant Plans",
  descriptionKey:
    "B2B2C plan builder enabling tenants to create subscription plans for their end-users with feature bundling, pricing, and lifecycle management.",
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
