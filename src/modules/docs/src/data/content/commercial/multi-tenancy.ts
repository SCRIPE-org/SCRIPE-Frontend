import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.multiTenancy.intro" },

      { type: "heading", level: 2, titleKey: "commercial.multiTenancy.architectureTitle", id: "architecture" },
      { type: "paragraph", contentKey: "commercial.multiTenancy.architectureContent" },
      {
            type: "code",
            language: "text",
            filename: "Hierarchical Multi-Tenancy Model",
            code: `┌──────────────────────────────────────────────────┐
│               Root Tenant (Platform)             │
│                                                  │
│  ┌────────────────┐    ┌────────────────┐       │
│  │  Enterprise A  │    │  Enterprise B  │       │
│  │   (Parent)     │    │   (Parent)     │       │
│  │                │    │                │       │
│  │ ┌──────┐ ┌────┐│    │ ┌──────┐       │       │
│  │ │Dept 1│ │D. 2││    │ │Branch│       │       │
│  │ │(child)│ │    ││    │ │  1   │       │       │
│  │ └──────┘ └────┘│    │ └──────┘       │       │
│  └────────────────┘    └────────────────┘       │
└──────────────────────────────────────────────────┘`,
      },

      { type: "heading", level: 2, titleKey: "commercial.multiTenancy.isolationTitle", id: "isolation" },
      {
            type: "table",
            headers: ["Isolation Aspect", "Implementation", "Guarantee"],
            rows: [
                  ["Data isolation", "Row-level tenant filtering via global query filters", "Zero cross-tenant data leakage"],
                  ["Storage isolation", "Tenant-scoped file paths and blob containers", "Files inaccessible across tenants"],
                  ["Cache isolation", "Tenant-prefixed cache keys", "Cache entries never cross tenants"],
                  ["Session isolation", "JWT claims include TenantId", "API requests scoped to tenant"],
                  ["Audit isolation", "All audit entries tagged with TenantId", "Tenant-specific audit trails"],
                  ["Menu isolation", "Per-tenant menu overrides via MenuOverrideResolver", "Unique navigation per tenant"],
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.multiTenancy.settingsTitle", id: "per-tenant-settings" },
      { type: "paragraph", contentKey: "commercial.multiTenancy.settingsContent" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "globe", titleKey: "commercial.multiTenancy.settBranding", descriptionKey: "commercial.multiTenancy.settBrandingDesc" },
                  { icon: "shield", titleKey: "commercial.multiTenancy.settSecurity", descriptionKey: "commercial.multiTenancy.settSecurityDesc" },
                  { icon: "zap", titleKey: "commercial.multiTenancy.settFeatures", descriptionKey: "commercial.multiTenancy.settFeaturesDesc" },
                  { icon: "key", titleKey: "commercial.multiTenancy.settEntitlements", descriptionKey: "commercial.multiTenancy.settEntitlementsDesc" },
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.multiTenancy.whiteLabelTitle", id: "white-labeling" },
      { type: "paragraph", contentKey: "commercial.multiTenancy.whiteLabelContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Custom logo and branding per tenant",
                  "Custom color schemes and themes",
                  "Custom domain mapping (tenant-specific URLs)",
                  "Tenant-specific email templates and branding",
                  "Custom login page branding",
                  "Tenant-specific notification templates",
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.multiTenancy.managementTitle", id: "management" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/tenants", descriptionKey: "List all tenants", auth: "Required", permission: "Tenants.View" },
                  { method: "POST", path: "/api/tenants", descriptionKey: "Create new tenant", auth: "Required", permission: "Tenants.Create" },
                  { method: "PUT", path: "/api/tenants/{id}", descriptionKey: "Update tenant settings", auth: "Required", permission: "Tenants.Update" },
                  { method: "POST", path: "/api/tenants/{id}/activate", descriptionKey: "Activate tenant", auth: "Required", permission: "Tenants.Update" },
                  { method: "POST", path: "/api/tenants/{id}/deactivate", descriptionKey: "Deactivate tenant", auth: "Required", permission: "Tenants.Update" },
            ],
      },

      // ═ Custom Domain Management ═
      { type: "heading", level: 2, titleKey: "commercial.multiTenancy.domainTitle", id: "custom-domains" },
      { type: "paragraph", contentKey: "commercial.multiTenancy.domainIntro" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "globe", titleKey: "commercial.multiTenancy.domainAutoSub", descriptionKey: "commercial.multiTenancy.domainAutoSubDesc" },
                  { icon: "link", titleKey: "commercial.multiTenancy.domainCustom", descriptionKey: "commercial.multiTenancy.domainCustomDesc" },
                  { icon: "shield", titleKey: "commercial.multiTenancy.domainDns", descriptionKey: "commercial.multiTenancy.domainDnsDesc" },
                  { icon: "settings", titleKey: "commercial.multiTenancy.domainConfig", descriptionKey: "commercial.multiTenancy.domainConfigDesc" },
                  { icon: "zap", titleKey: "commercial.multiTenancy.domainPrimary", descriptionKey: "commercial.multiTenancy.domainPrimaryDesc" },
                  { icon: "key", titleKey: "commercial.multiTenancy.domainRebrand", descriptionKey: "commercial.multiTenancy.domainRebrandDesc" },
            ],
      },

      // White-Label Domain Architecture
      { type: "heading", level: 3, titleKey: "commercial.multiTenancy.domainWhiteLabelTitle", id: "white-label-domains" },
      { type: "paragraph", contentKey: "commercial.multiTenancy.domainWhiteLabelContent" },
      {
            type: "flowchart",
            title: "Custom Domain Setup",
            direction: "vertical",
            nodes: [
                  { id: "add", label: "Tenant Admin adds custom domain", type: "default" },
                  { id: "verify", label: "DNS Verification (CNAME + TXT)", type: "primary" },
                  { id: "active", label: "Domain Active & Verified ✓", type: "success" },
                  { id: "primary", label: "Set as Primary Domain", type: "info" },
            ],
            connections: [
                  { from: "add", to: "verify" },
                  { from: "verify", to: "active" },
                  { from: "active", to: "primary" },
            ],
      },

      // Domain API Endpoints
      { type: "heading", level: 3, titleKey: "commercial.multiTenancy.domainApiTitle", id: "domain-api" },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants/{id}/domains", descriptionKey: "List all tenant domains with DNS config metadata", auth: "Required", permission: "Tenants.View" },
                  { method: "POST", path: "/api/v1/tenants/{id}/domains", descriptionKey: "Add custom domain with auto verification token", auth: "Required", permission: "Tenants.Update" },
                  { method: "POST", path: "/api/v1/tenants/{id}/domains/{domainId}/verify", descriptionKey: "Trigger DNS verification check", auth: "Required", permission: "Tenants.Update" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/domains/{domainId}/set-primary", descriptionKey: "Set domain as primary for the tenant", auth: "Required", permission: "Tenants.Update" },
                  { method: "DELETE", path: "/api/v1/tenants/{id}/domains/{domainId}", descriptionKey: "Remove custom domain (auto domains protected)", auth: "Required", permission: "Tenants.Update" },
            ],
      },

      {
            type: "info",
            variant: "tip",
            contentKey: "commercial.multiTenancy.domainTip",
      },
];

registerPage({
      slug: "commercial/multi-tenancy",
      titleKey: "commercial.multiTenancy.title",
      descriptionKey: "commercial.multiTenancy.description",
      category: "commercial-enterprise",
      order: 1,
      sections,
      relatedSlugs: ["commercial/roles-permissions", "commercial/audit-compliance"],
      lastUpdated: "2026-03-16",
});

