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
                  { method: "GET", path: "/api/tenants", description: "List all tenants", auth: "Required", permission: "Tenants.View" },
                  { method: "POST", path: "/api/tenants", description: "Create new tenant", auth: "Required", permission: "Tenants.Create" },
                  { method: "PUT", path: "/api/tenants/{id}", description: "Update tenant settings", auth: "Required", permission: "Tenants.Update" },
                  { method: "POST", path: "/api/tenants/{id}/activate", description: "Activate tenant", auth: "Required", permission: "Tenants.Update" },
                  { method: "POST", path: "/api/tenants/{id}/deactivate", description: "Deactivate tenant", auth: "Required", permission: "Tenants.Update" },
            ],
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
      lastUpdated: "2026-02-20",
});
