import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.enterpriseMultiTenancy.intro" },
      { type: "heading", level: 2, titleKey: "commercial.enterpriseMultiTenancy.hierarchyTitle", id: "tenant-hierarchy" },
      { type: "paragraph", contentKey: "commercial.enterpriseMultiTenancy.hierarchyIntro" },
      {
            type: "table",
            headers: ["Feature", "Implementation"],
            rows: [
                  ["Materialized path", "/root-id/child-id/grandchild-id/ for O(1) ancestor queries"],
                  ["Hierarchy level", "Tracks depth (0 = root, 1 = child, 2 = grandchild)"],
                  ["Parent visibility", "Parent tenants can see all descendant data"],
                  ["Child isolation", "Child tenants cannot see sibling or parent data"],
                  ["Cascade operations", "Deleting a parent soft-deletes all children"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.enterpriseMultiTenancy.isolationTitle", id: "data-isolation" },
      { type: "paragraph", contentKey: "commercial.enterpriseMultiTenancy.isolationIntro" },
      {
            type: "code",
            language: "text",
            filename: "Automatic Tenant Query Filtering",
            code: `Admin in Tenant A queries /api/admins
  → SQL: SELECT * FROM Admins WHERE TenantId = 'tenant-a-id' AND IsDeleted = 0

System Admin queries /api/admins
  → SQL: SELECT * FROM Admins WHERE IsDeleted = 0  (sees ALL tenants)`,
      },
      { type: "info", variant: "warning", contentKey: "commercial.enterpriseMultiTenancy.isolationEnforced" },
      { type: "heading", level: 2, titleKey: "commercial.enterpriseMultiTenancy.configTitle", id: "per-tenant-config" },
      {
            type: "table",
            headers: ["Setting", "Example", "Purpose"],
            rows: [
                  ["Name", "\"ACME Corporation\"", "Display name"],
                  ["Code", "\"ACME\"", "URL-safe identifier"],
                  ["Max Admins", "50", "Quota enforcement"],
                  ["Max Users", "500", "Quota enforcement"],
                  ["Logo", "/uploads/acme/logo.png", "Custom branding"],
                  ["Primary Color", "#3b82f6", "Theme color"],
                  ["Subdomain", "acme.nexora.com", "White-label URL"],
                  ["Description", "\"Leading manufacturer\"", "Administrative note"],
                  ["Address", "\"123 Main St\"", "Physical location"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.enterpriseMultiTenancy.permissionTitle", id: "permission-scoping" },
      {
            type: "code",
            language: "text",
            filename: "Tiered Permission Model (SaaS Licensing)",
            code: `System: 40 permissions available
├── Enterprise Tenant: 40 granted (full access)
│   ├── Role "Super Admin": 40 permissions
│   └── Role "Manager": 25 permissions
└── Starter Tenant: 20 granted (limited)
    ├── Role "Admin": 20 permissions
    └── Role "Viewer": 5 permissions`,
      },
      { type: "heading", level: 2, titleKey: "commercial.enterpriseMultiTenancy.whiteLabelTitle", id: "white-labeling" },
      {
            type: "table",
            headers: ["Feature", "Detail"],
            rows: [
                  ["Custom logo", "Uploaded and served per tenant"],
                  ["Theme colors", "CSS custom properties applied dynamically"],
                  ["Custom domain", "Subdomain routing to tenant context"],
                  ["Branded emails", "Templates render with tenant logo and name"],
                  ["Menu customization", "Tenant admins can override menu labels, icons, ordering"],
            ],
      },
];

registerPage({
      slug: "commercial/enterprise-multi-tenancy",
      titleKey: "commercial.enterpriseMultiTenancy.title",
      descriptionKey: "commercial.enterpriseMultiTenancy.description",
      category: "commercial-enterprise",
      order: 1,
      sections,
      relatedSlugs: ["commercial/audit-compliance", "commercial/security-overview"],
      lastUpdated: "2026-02-19",
});
