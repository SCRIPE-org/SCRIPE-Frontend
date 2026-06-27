import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.userGroupsApi.intro" },

  // ─── Admin Groups CRUD ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userGroupsApi.crudTitle",
    id: "user-groups-crud",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/UserGroups",
        descriptionKey: "apiReference.userGroupsApi.listGroupsDesc",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/myTenantGroups",
        descriptionKey: "apiReference.userGroupsApi.myTenantGroupsDesc",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "apiReference.userGroupsApi.getGroupDesc",
        auth: "user_groups.view",
      },
      {
        method: "GET",
        path: "/api/v1/UserGroups/byTenantId/{tenantId}",
        descriptionKey: "apiReference.userGroupsApi.groupsByTenantDesc",
        auth: "user_groups.view",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups",
        descriptionKey: "apiReference.userGroupsApi.createGroupDesc",
        auth: "user_groups.create",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/createForMyTenant",
        descriptionKey: "apiReference.userGroupsApi.createGroupMyTenantDesc",
        auth: "user_groups.create",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "apiReference.userGroupsApi.updateGroupDesc",
        auth: "user_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/UserGroups/{id}",
        descriptionKey: "apiReference.userGroupsApi.deleteGroupDesc",
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
    titleKey: "apiReference.userGroupsApi.groupMembersTitle",
    id: "group-members",
  },
  { type: "paragraph", contentKey: "apiReference.userGroupsApi.groupMembersIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/UserGroups/{id}/members",
        descriptionKey: "apiReference.userGroupsApi.addMembersDesc",
        auth: "user_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/UserGroups/{id}/members/{adminId}",
        descriptionKey: "apiReference.userGroupsApi.removeMemberDesc",
        auth: "user_groups.update",
      },
    ],
  },

  // ─── Admin Group Roles & Restrictions ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userGroupsApi.groupRolesRestrictionsTitle",
    id: "group-roles-restrictions",
  },
  { type: "paragraph", contentKey: "apiReference.userGroupsApi.groupRolesRestrictionsIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{id}/roles",
        descriptionKey: "apiReference.userGroupsApi.setGroupRolesDesc",
        auth: "user_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{id}/restrictions",
        descriptionKey: "apiReference.userGroupsApi.setGroupRestrictionsDesc",
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
    titleKey: "apiReference.userGroupsApi.bulkCascadeTitle",
    id: "bulk-cascade-operations",
  },
  { type: "paragraph", contentKey: "apiReference.userGroupsApi.bulkCascadeIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/activate",
        descriptionKey: "apiReference.userGroupsApi.bulkActivateDesc",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/deactivate",
        descriptionKey: "apiReference.userGroupsApi.bulkDeactivateDesc",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/delete",
        descriptionKey: "apiReference.userGroupsApi.bulkDeleteDesc",
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
    contentKey: "apiReference.userGroupsApi.cascadeWarningNode",
  },
];

registerPage({
  slug: "api-reference/user-groups-api",
  titleKey: "apiReference.userGroupsApi.title",
  descriptionKey: "apiReference.userGroupsApi.description",
  category: "api-reference",
  order: 7,
  sections,
  relatedSlugs: ["api-reference/role-permission-api", "api-reference/admin-api"],
  lastUpdated: "2026-02-22",
});
