import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.adminGroupsApi.intro" },

  // ─── Admin Groups CRUD ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminGroupsApi.crudTitle",
    id: "user-groups-crud",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/admingroups",
        descriptionKey: "apiReference.adminGroupsApi.listGroupsDesc",
        auth: "admin_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/admingroups/myTenantGroups",
        descriptionKey: "apiReference.adminGroupsApi.myTenantGroupsDesc",
        auth: "admin_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/admingroups/{id}",
        descriptionKey: "apiReference.adminGroupsApi.getGroupDesc",
        auth: "admin_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/admingroups/byTenant/{tenantId}",
        descriptionKey: "apiReference.adminGroupsApi.groupsByTenantDesc",
        auth: "admin_groups.view",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups",
        descriptionKey: "apiReference.adminGroupsApi.createGroupDesc",
        auth: "admin_groups.create",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/createForMyTenant",
        descriptionKey: "apiReference.adminGroupsApi.createGroupMyTenantDesc",
        auth: "admin_groups.create",
      },
      {
        method: "PUT",
        path: "/api/v1/admingroups/{id}",
        descriptionKey: "apiReference.adminGroupsApi.updateGroupDesc",
        auth: "admin_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/admingroups/{id}",
        descriptionKey: "apiReference.adminGroupsApi.deleteGroupDesc",
        auth: "admin_groups.delete",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Group Detail",
        language: "json",
        filename: "GET /admingroups/{id} — Response",
        code: `{
  "id": "group-uuid",
  "nameEn": "Finance Team",
  "nameAr": "فريق المالية",
  "code": "FINANCE_TEAM",
  "tenantId": "tenant-uuid",
  "isActive": true,
  "members": [
    { "adminId": "admin-uuid", "name": "John Doe", "email": "john@example.com" }
  ],
  "roles": [
    { "roleId": "role-uuid", "roleName": "Accountant" }
  ],
  "restrictions": [
    { "permissionCode": "admins.view", "restrictedFields": ["salary", "ssn"] }
  ]
}`,
      },
      {
        label: "Create Group",
        language: "json",
        filename: "POST /admingroups — Request",
        code: `{
  "nameEn": "Finance Team",
  "nameAr": "فريق المالية",
  "code": "FINANCE_TEAM",
  "tenantId": "tenant-uuid",
  "description": "All finance department admins"
}`,
      },
    ],
  },

  // ─── Admin Group Members ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminGroupsApi.groupMembersTitle",
    id: "group-members",
  },
  { type: "paragraph", contentKey: "apiReference.adminGroupsApi.groupMembersIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/admingroups/{id}/members",
        descriptionKey: "apiReference.adminGroupsApi.addMembersDesc",
        auth: "admin_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/admingroups/{id}/members/{adminId}",
        descriptionKey: "apiReference.adminGroupsApi.removeMemberDesc",
        auth: "admin_groups.update",
      },
    ],
  },

  // ─── Admin Group Roles & Restrictions ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminGroupsApi.groupRolesRestrictionsTitle",
    id: "group-roles-restrictions",
  },
  { type: "paragraph", contentKey: "apiReference.adminGroupsApi.groupRolesRestrictionsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "PUT",
        path: "/api/v1/admingroups/{id}/roles",
        descriptionKey: "apiReference.adminGroupsApi.setGroupRolesDesc",
        auth: "admin_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/admingroups/{id}/restrictions",
        descriptionKey: "apiReference.adminGroupsApi.setGroupRestrictionsDesc",
        auth: "admin_groups.update",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "PUT /admingroups/{id}/restrictions — Request",
    code: `{
  "restrictions": [
    {
      "permissionCode": "admins.view",
      "restrictedFields": ["salary", "bankAccount", "ssn"]
    },
    {
      "permissionCode": "users.view",
      "restrictedFields": ["email", "phoneNumber"]
    }
  ]
}`,
  },

  // ─── Bulk & Cascade Operations ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminGroupsApi.bulkCascadeTitle",
    id: "bulk-cascade-operations",
  },
  { type: "paragraph", contentKey: "apiReference.adminGroupsApi.bulkCascadeIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/admingroups/bulk/activate",
        descriptionKey: "apiReference.adminGroupsApi.bulkActivateDesc",
        auth: "admin_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/bulk/deactivate",
        descriptionKey: "apiReference.adminGroupsApi.bulkDeactivateDesc",
        auth: "admin_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/admingroups/bulk/delete",
        descriptionKey: "apiReference.adminGroupsApi.bulkDeleteDesc",
        auth: "admin_groups.delete",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "POST /admingroups/bulk/delete — Request",
    code: `{
  "ids": ["group-uuid-1", "group-uuid-2"],
  "cascadeAdmins": true
}`,
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "apiReference.adminGroupsApi.cascadeWarningNode",
  },
];

registerPage({
  slug: "api-reference/user-groups-api",
  titleKey: "apiReference.adminGroupsApi.title",
  descriptionKey: "apiReference.adminGroupsApi.description",
  category: "api-reference",
  order: 7,
  sections,
  relatedSlugs: ["api-reference/role-permission-api", "api-reference/admin-api"],
  lastUpdated: "2026-02-22",
});
