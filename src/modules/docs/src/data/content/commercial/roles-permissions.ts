import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.rolesPermissions.intro" },

      { type: "heading", level: 2, titleKey: "commercial.rolesPermissions.rbacTitle", id: "rbac" },
      { type: "paragraph", contentKey: "commercial.rolesPermissions.rbacContent" },
      {
            type: "flowchart",
            direction: "vertical",
            title: "RBAC Authorization Flow",
            nodes: [
                  { id: "req", label: "API Request with JWT", type: "default" },
                  { id: "extract", label: "Extract User Permissions from Token", type: "info" },
                  { id: "check", label: "Check Required Permission", type: "primary" },
                  { id: "field", label: "Apply Field-Level Restrictions", type: "warning" },
                  { id: "allow", label: "Request Authorized ✓", type: "success" },
                  { id: "deny", label: "403 Forbidden ✗", type: "danger" },
            ],
            connections: [
                  { from: "req", to: "extract" }, { from: "extract", to: "check" },
                  { from: "check", to: "field", label: "Has permission" },
                  { from: "check", to: "deny", label: "No permission" },
                  { from: "field", to: "allow" },
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.rolesPermissions.categoriesTitle", id: "categories" },
      {
            type: "table",
            headers: ["Category", "Permissions", "Description"],
            rows: [
                  ["Users", "View, Create, Update, Delete, Export", "User account management"],
                  ["Roles", "View, Create, Update, Delete", "Role definition and assignment"],
                  ["Tenants", "View, Create, Update, Deactivate", "Tenant lifecycle management"],
                  ["Audit", "View, Export, Delete", "Audit trail access"],
                  ["Settings", "View, Update", "System configuration"],
                  ["HR", "View, Create, Update, Delete, Export", "Human resources module"],
                  ["User Groups", "View, Create, Update, Delete", "Group-based role and restriction batch assignment"],
                  ["Custom", "Dynamically registered per module", "Module-specific permissions"],
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.rolesPermissions.fieldTitle", id: "field-level" },
      { type: "paragraph", contentKey: "commercial.rolesPermissions.fieldContent" },
      {
            type: "code",
            language: "json",
            filename: "Field-Level Restriction Example",
            code: `{
  "role": "HR Manager",
  "restrictedFields": {
    "Employee": ["salary", "ssn", "bankAccount"],
    "User": ["passwordHash", "securityStamp"]
  },
  "effect": "Fields are automatically removed from API responses"
}`,
      },

      { type: "heading", level: 2, titleKey: "commercial.rolesPermissions.featuresTitle", id: "features" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "shield", titleKey: "commercial.rolesPermissions.roleHierarchy", descriptionKey: "commercial.rolesPermissions.roleHierarchyDesc" },
                  { icon: "users", titleKey: "commercial.rolesPermissions.roleCloning", descriptionKey: "commercial.rolesPermissions.roleCloningDesc" },
                  { icon: "building", titleKey: "commercial.rolesPermissions.tenantScoped", descriptionKey: "commercial.rolesPermissions.tenantScopedDesc" },
                  { icon: "zap", titleKey: "commercial.rolesPermissions.dynamicReg", descriptionKey: "commercial.rolesPermissions.dynamicRegDesc" },
            ],
      },

      // ─── User Groups ──────────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.rolesPermissions.userGroupsTitle", id: "user-groups" },
      { type: "paragraph", contentKey: "commercial.rolesPermissions.userGroupsContent" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "users", titleKey: "commercial.rolesPermissions.groupBatchAssign", descriptionKey: "commercial.rolesPermissions.groupBatchAssignDesc" },
                  { icon: "shield", titleKey: "commercial.rolesPermissions.groupRestrictions", descriptionKey: "commercial.rolesPermissions.groupRestrictionsDesc" },
                  { icon: "building", titleKey: "commercial.rolesPermissions.groupTenantScoped", descriptionKey: "commercial.rolesPermissions.groupTenantScopedDesc" },
                  { icon: "zap", titleKey: "commercial.rolesPermissions.groupAdditiveMerge", descriptionKey: "commercial.rolesPermissions.groupAdditiveMergeDesc" },
            ],
      },
];

registerPage({
      slug: "commercial/roles-permissions",
      titleKey: "commercial.rolesPermissions.title",
      descriptionKey: "commercial.rolesPermissions.description",
      category: "commercial-enterprise",
      order: 2,
      sections,
      relatedSlugs: ["commercial/multi-tenancy", "commercial/authentication-security"],
      lastUpdated: "2026-02-20",
});
