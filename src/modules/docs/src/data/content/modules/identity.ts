import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "modules.identity.intro" },

      // ─ Architecture
      {
            type: "heading", level: 2,
            titleKey: "modules.identity.architectureTitle", id: "architecture",
      },
      { type: "paragraph", contentKey: "modules.identity.architectureDesc" },
      {
            type: "table",
            headers: ["Layer", "Path", "Purpose"],
            rows: [
                  ["Domain", "Identity.Domain/", "Entities, interfaces, domain events"],
                  ["Application", "Identity.Application/", "Commands, queries, DTOs (CQRS)"],
                  ["Infrastructure", "Identity.Infrastructure/", "Repositories, services, seeders, background jobs"],
            ],
      },

      // ─ Multi-Tenancy
      {
            type: "heading", level: 2,
            titleKey: "modules.identity.multiTenancyTitle", id: "multi-tenancy",
      },
      { type: "paragraph", contentKey: "modules.identity.multiTenancyDesc" },
      {
            type: "table",
            headers: ["Component", "Description"],
            rows: [
                  ["HierarchyPath", "Materialized path for O(1) ancestor checks — /{guid}/{guid}/"],
                  ["BFS Cascade", "Breadth-first propagation of permissions through tenant tree"],
                  ["Guardian Service", "9 safety rules protecting admins and roles (A-001 to A-005, R-001 to R-005)"],
                  ["Cascading Suspension", "Parent suspend/cancel automatically cascades to descendants"],
            ],
      },

      // ─ Authentication
      {
            type: "heading", level: 2,
            titleKey: "modules.identity.authTitle", id: "authentication",
      },
      { type: "paragraph", contentKey: "modules.identity.authDesc" },
      {
            type: "table",
            headers: ["Feature", "Implementation"],
            rows: [
                  ["JWT Tokens", "15-minute access tokens + 7-day refresh tokens"],
                  ["2FA", "TOTP-based with backup codes and anti-replay"],
                  ["Password Policies", "Min length, complexity, expiry, lockout"],
                  ["Session Management", "Concurrent session limits, device tracking"],
            ],
      },

      // ─ Authorization
      {
            type: "heading", level: 2,
            titleKey: "modules.identity.authzTitle", id: "authorization",
      },
      { type: "paragraph", contentKey: "modules.identity.authzDesc" },
      {
            type: "table",
            headers: ["Model", "Description"],
            rows: [
                  ["RBAC", "Role-based with resource/action permission model"],
                  ["ABAC", "ScopeOverride and RestrictedFieldsJson on RolePermission"],
                  ["GBAC", "Group-based access control via UserGroup"],
                  ["Caching", "AdminPermissionCache with O(1) HashSet lookup"],
            ],
      },

      // ─ Entities
      {
            type: "heading", level: 2,
            titleKey: "modules.identity.entitiesTitle", id: "entities",
      },
      {
            type: "table",
            headers: ["Entity", "Purpose"],
            rows: [
                  ["Tenant", "Organization node in hierarchical tree"],
                  ["TenantSettings", "Security config + branding per tenant"],
                  ["Admin", "Authenticated user within a tenant"],
                  ["Role", "Named permission set with priority"],
                  ["Permission", "Resource/Action pair with RequiredModule tag"],
                  ["TenantPermission", "Tenant-level permission pool"],
                  ["RolePermission", "Role ↔ Permission junction with ABAC fields"],
                  ["UserGroup", "Group for GBAC"],
            ],
      },
];

registerPage({
      slug: "modules/identity",
      titleKey: "modules.identity.title",
      descriptionKey: "modules.identity.description",
      category: "modules",
      order: 1,
      sections,
      relatedSlugs: ["modules/entitlements", "features/authentication", "features/multi-tenancy"],
      lastUpdated: "2026-03-02",
});
