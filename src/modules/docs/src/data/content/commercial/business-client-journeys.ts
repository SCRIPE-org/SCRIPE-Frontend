import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.businessClientJourneys.intro" },

  // ═══ Journey 1: Small Business ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.businessClientJourneys.j1Title",
    id: "small-business",
  },
  { type: "paragraph", contentKey: "commercial.businessClientJourneys.j1Intro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "zap",
        titleKey: "commercial.businessClientJourneys.j1SelfService",
        descriptionKey: "commercial.businessClientJourneys.j1SelfServiceDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.businessClientJourneys.j1TeamSetup",
        descriptionKey: "commercial.businessClientJourneys.j1TeamSetupDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.businessClientJourneys.j1Roles",
        descriptionKey: "commercial.businessClientJourneys.j1RolesDesc",
      },
      {
        icon: "settings",
        titleKey: "commercial.businessClientJourneys.j1Modules",
        descriptionKey: "commercial.businessClientJourneys.j1ModulesDesc",
      },
      {
        icon: "bar-chart-2",
        titleKey: "commercial.businessClientJourneys.j1Analytics",
        descriptionKey: "commercial.businessClientJourneys.j1AnalyticsDesc",
      },
      {
        icon: "message-square",
        titleKey: "commercial.businessClientJourneys.j1Support",
        descriptionKey: "commercial.businessClientJourneys.j1SupportDesc",
      },
    ],
  },

  // ═══ Journey 2: Enterprise ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.businessClientJourneys.j2Title",
    id: "enterprise",
  },
  { type: "paragraph", contentKey: "commercial.businessClientJourneys.j2Intro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "building",
        titleKey: "commercial.businessClientJourneys.j2Hierarchy",
        descriptionKey: "commercial.businessClientJourneys.j2HierarchyDesc",
      },
      {
        icon: "palette",
        titleKey: "commercial.businessClientJourneys.j2Branding",
        descriptionKey: "commercial.businessClientJourneys.j2BrandingDesc",
      },
      {
        icon: "key",
        titleKey: "commercial.businessClientJourneys.j2SSO",
        descriptionKey: "commercial.businessClientJourneys.j2SSODesc",
      },
      {
        icon: "lock",
        titleKey: "commercial.businessClientJourneys.j2RBAC",
        descriptionKey: "commercial.businessClientJourneys.j2RBACDesc",
      },
      {
        icon: "globe",
        titleKey: "commercial.businessClientJourneys.j2MultiRegion",
        descriptionKey: "commercial.businessClientJourneys.j2MultiRegionDesc",
      },
      {
        icon: "file-text",
        titleKey: "commercial.businessClientJourneys.j2Audit",
        descriptionKey: "commercial.businessClientJourneys.j2AuditDesc",
      },
    ],
  },

  // ═══ Journey 3: B2B2C Operator ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.businessClientJourneys.j3Title",
    id: "b2b2c-operator",
  },
  { type: "paragraph", contentKey: "commercial.businessClientJourneys.j3Intro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "users",
        titleKey: "commercial.businessClientJourneys.j3CustomerMgmt",
        descriptionKey: "commercial.businessClientJourneys.j3CustomerMgmtDesc",
      },
      {
        icon: "layout",
        titleKey: "commercial.businessClientJourneys.j3WhiteLabel",
        descriptionKey: "commercial.businessClientJourneys.j3WhiteLabelDesc",
      },
      {
        icon: "credit-card",
        titleKey: "commercial.businessClientJourneys.j3Billing",
        descriptionKey: "commercial.businessClientJourneys.j3BillingDesc",
      },
      {
        icon: "bell",
        titleKey: "commercial.businessClientJourneys.j3Notifications",
        descriptionKey: "commercial.businessClientJourneys.j3NotificationsDesc",
      },
      {
        icon: "trending-up",
        titleKey: "commercial.businessClientJourneys.j3Telemetry",
        descriptionKey: "commercial.businessClientJourneys.j3TelemetryDesc",
      },
      {
        icon: "plug",
        titleKey: "commercial.businessClientJourneys.j3API",
        descriptionKey: "commercial.businessClientJourneys.j3APIDesc",
      },
    ],
  },

  // ═══ Tier Comparison Table ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.businessClientJourneys.comparisonTitle",
    id: "tier-comparison",
  },
  { type: "paragraph", contentKey: "commercial.businessClientJourneys.comparisonIntro" },
  {
    type: "table",
    headers: [
      "Capability",
      "Small Business (50-200 users)",
      "Enterprise (500+ users)",
      "B2B2C Operator",
    ],
    rows: [
      ["Tenant Hierarchy", "Flat workspace", "Multi-department hierarchy", "Multi-tier (operator + end customers)"],
      ["User Limit", "Up to 200", "Unlimited", "Unlimited + customer accounts"],
      ["Branding", "Shared platform branding", "Per-department custom branding", "Full white-label + custom domain"],
      ["SSO / Identity", "Email + 2FA", "SSO (SAML, OIDC, Azure AD)", "SSO + customer identity federation"],
      ["RBAC Complexity", "Role-based (5–10 roles)", "Advanced RBAC + field-level security", "Operator roles + end-user permission matrix"],
      ["Modules Available", "Up to 10 modules", "All modules", "All modules + customer-facing portals"],
      ["API Access", "Standard REST API", "Full API + webhooks + audit", "Full API + embedded SDKs + reseller APIs"],
      ["Support Level", "Standard (email)", "Dedicated SLA + 4h response", "White-glove + on-site incubation"],
      ["Compliance", "Basic audit trail", "GDPR, SOX, HIPAA-ready", "Full compliance suite + DPA agreements"],
      ["Custom Domain", "Optional add-on", "Included", "Mandatory (own branding)"],
    ],
  },

  // ═══ Onboarding Flowchart ═══
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.businessClientJourneys.flowTitle",
    id: "onboarding-flow",
  },
  { type: "paragraph", contentKey: "commercial.businessClientJourneys.flowIntro" },
  {
    type: "flowchart",
    title: "Business Client Onboarding Journey",
    direction: "vertical",
    nodes: [
      { id: "signup", label: "Subscribe to SCRIPE Plan", type: "primary" },
      { id: "workspace", label: "Workspace Provisioned (auto)", type: "success" },
      { id: "admin", label: "Admin Account & First Login", type: "default" },
      { id: "modules", label: "Select & Configure Modules", type: "info" },
      { id: "users", label: "Invite Team / Import Users", type: "default" },
      { id: "roles", label: "Assign Roles & Permissions", type: "warning" },
      { id: "branding", label: "Configure Branding & Domain", type: "info" },
      { id: "golive", label: "Go Live — Production Ready!", type: "success" },
    ],
    connections: [
      { from: "signup", to: "workspace" },
      { from: "workspace", to: "admin" },
      { from: "admin", to: "modules" },
      { from: "modules", to: "users" },
      { from: "users", to: "roles" },
      { from: "roles", to: "branding" },
      { from: "branding", to: "golive" },
    ],
  },

  {
    type: "info",
    variant: "tip",
    contentKey: "commercial.businessClientJourneys.closingTip",
  },
];

registerPage({
  slug: "commercial/business-client-journeys",
  titleKey: "commercial.businessClientJourneys.title",
  descriptionKey: "commercial.businessClientJourneys.description",
  category: "commercial-why-scripe",
  order: 10,
  sections,
  relatedSlugs: ["commercial/why-scripe-overview", "commercial/multi-tenancy", "commercial/workspace-tours"],
  lastUpdated: "2026-06-28",
});
