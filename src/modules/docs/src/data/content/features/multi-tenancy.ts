import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.multiTenancy.intro" },
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "Multi-Tenant Data Isolation",
            direction: "vertical",
            nodes: [
                  { id: "req", label: "Incoming Request", type: "default" },
                  { id: "jwt", label: "Extract TenantId from JWT", type: "primary" },
                  { id: "filter", label: "EF Core Global Query Filter", type: "warning" },
                  { id: "db", label: "SELECT * WHERE TenantId = @tid", type: "success" },
            ],
            connections: [
                  { from: "req", to: "jwt" },
                  { from: "jwt", to: "filter" },
                  { from: "filter", to: "db" },
            ],
      },
      {
            type: "table",
            headers: ["Isolation Level", "Implementation", "Use Case"],
            rows: [
                  ["Row-Level (Current)", "EF Core Global Query Filters on TenantId", "Single database, all tenants share tables"],
                  ["Schema-Level (Planned)", "Separate schema per tenant", "Higher isolation, same database"],
                  ["Database-Level (Planned)", "Separate database per tenant", "Maximum isolation, regulatory compliance"],
            ],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.featuresTitle", id: "features",
      },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "shield", titleKey: "features.multiTenancy.featureIsolation", descriptionKey: "features.multiTenancy.featureIsolationDesc" },
                  { icon: "settings", titleKey: "features.multiTenancy.featureSettings", descriptionKey: "features.multiTenancy.featureSettingsDesc" },
                  { icon: "image", titleKey: "features.multiTenancy.featureBranding", descriptionKey: "features.multiTenancy.featureBrandingDesc" },
                  { icon: "users", titleKey: "features.multiTenancy.featureUserScoping", descriptionKey: "features.multiTenancy.featureUserScopingDesc" },
                  { icon: "key", titleKey: "features.multiTenancy.featureRoleScoping", descriptionKey: "features.multiTenancy.featureRoleScopingDesc" },
                  { icon: "database", titleKey: "features.multiTenancy.featureDataScoping", descriptionKey: "features.multiTenancy.featureDataScopingDesc" },
            ],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.multiTenancy.endpointsTitle", id: "endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/tenants", description: "List all tenants (admin only)", auth: "Admin" },
                  { method: "POST", path: "/api/v1/tenants", description: "Create a new tenant", auth: "Admin" },
                  { method: "GET", path: "/api/v1/tenants/{id}", description: "Get tenant details", auth: "Admin" },
                  { method: "PUT", path: "/api/v1/tenants/{id}", description: "Update tenant settings", auth: "Admin/TenantAdmin" },
                  { method: "PUT", path: "/api/v1/tenants/{id}/logo", description: "Upload tenant logo", auth: "Admin/TenantAdmin" },
                  { method: "DELETE", path: "/api/v1/tenants/{id}", description: "Soft-delete tenant (preserves data)", auth: "Admin" },
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "features.multiTenancy.logoTip",
      },
];

registerPage({
      slug: "features/multi-tenancy",
      titleKey: "features.multiTenancy.title",
      descriptionKey: "features.multiTenancy.description",
      category: "features",
      order: 2,
      sections,
      relatedSlugs: ["features/authentication", "features/role-permissions"],
      lastUpdated: "2026-02-19",
});
