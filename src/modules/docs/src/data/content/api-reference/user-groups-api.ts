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
        path: "/api/v1/UserGroups",
        descriptionKey: "apiReference.adminGroupsApi.listGroupsDesc",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/myTenantGroups",
        descriptionKey: "apiReference.adminGroupsApi.myTenantGroupsDesc",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "apiReference.adminGroupsApi.getGroupDesc",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/byTenantId/{tenantId}",
        descriptionKey: "apiReference.adminGroupsApi.groupsByTenantDesc",
        auth: "user_groups.view",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups",
        descriptionKey: "apiReference.adminGroupsApi.createGroupDesc",
        auth: "user_groups.create",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/createForMyTenant",
        descriptionKey: "apiReference.adminGroupsApi.createGroupMyTenantDesc",
        auth: "user_groups.create",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "apiReference.adminGroupsApi.updateGroupDesc",
        auth: "user_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "apiReference.adminGroupsApi.deleteGroupDesc",
        auth: "user_groups.delete",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Group Detail",
        language: "json",
        filename: "GET /UserGroups/{id} — Response",
        code: `{
  "id": "group-uuid",
  "nameEn": "Finance Team",
  "nameAr": "فريق المالية",
  "code": "FINANCE_TEAM",
  "tenantId": "tenant-uuid",
  "isActive": true,
  "members": [
    {
      "adminId": "admin-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "isActive": true
    }
  ],
  "roles": [
    {
      "roleId": "role-uuid",
      "nameEn": "Accountant",
      "nameAr": "محاسب",
      "code": "ACCOUNTANT",
      "permissionCount": 12
    }
  ],
  "restrictions": [
    {
      "permissionCode": "admins.view",
      "restrictedFields": ["salary", "ssn"]
    }
  ]
}`,
      },
      {
        label: "Create Group",
        language: "json",
        filename: "POST /UserGroups — Request",
        code: `{
  "nameEn": "Finance Team",
  "nameAr": "فريق المالية",
  "code": "FINANCE_TEAM",
  "descriptionEn": "All finance department admins",
  "descriptionAr": "جميع مشرفي القسم المالي",
  "roleIds": ["role-uuid-1", "role-uuid-2"],
  "tenantId": "tenant-uuid"
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
        path: "/api/v1/UserGroups/{id}/members",
        descriptionKey: "apiReference.adminGroupsApi.addMembersDesc",
        auth: "user_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/UserGroups/{id}/members/{adminId}",
        descriptionKey: "apiReference.adminGroupsApi.removeMemberDesc",
        auth: "user_groups.update",
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
        path: "/api/v1/UserGroups/{id}/roles",
        descriptionKey: "apiReference.adminGroupsApi.setGroupRolesDesc",
        auth: "user_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{id}/restrictions",
        descriptionKey: "apiReference.adminGroupsApi.setGroupRestrictionsDesc",
        auth: "user_groups.update",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "PUT /UserGroups/{id}/restrictions — Request",
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
        path: "/api/v1/UserGroups/bulk/activate",
        descriptionKey: "apiReference.adminGroupsApi.bulkActivateDesc",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/deactivate",
        descriptionKey: "apiReference.adminGroupsApi.bulkDeactivateDesc",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/delete",
        descriptionKey: "apiReference.adminGroupsApi.bulkDeleteDesc",
        auth: "user_groups.delete",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "POST /UserGroups/bulk/delete — Request",
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
