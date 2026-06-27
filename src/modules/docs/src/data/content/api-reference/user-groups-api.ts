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
        filename: "GET /api/v1/UserGroups/{id} — Response (200 OK)",
        code: `{
  "id": "ENCRYPTED_USER_GROUP_ID",
  "nameEn": "Finance Team",
  "nameAr": "فريق المالية",
  "code": "FINANCE_TEAM",
  "descriptionEn": "All finance department admins",
  "descriptionAr": "جميع مشرفي القسم المالي",
  "tenantId": "ENCRYPTED_TENANT_ID",
  "isActive": true,
  "members": [
    {
      "adminId": "ENCRYPTED_ADMIN_ID",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "isActive": true
    }
  ],
  "roles": [
    {
      "roleId": "ENCRYPTED_ROLE_ID",
      "nameEn": "Accountant",
      "nameAr": "محاسب",
      "code": "ACCOUNTANT",
      "permissionCount": 12
    }
  ],
  "restrictions": [
    {
      "permissionCode": "admins.view",
      "restrictedFields": ["salary", "ssn", "bankAccount"]
    }
  ]
}`,
      },
      {
        label: "Create Group",
        language: "json",
        filename: "POST /api/v1/UserGroups — Request",
        code: `{
  "nameEn": "Finance Team",
  "nameAr": "فريق المالية",
  "code": "FINANCE_TEAM",
  "descriptionEn": "All finance department admins",
  "descriptionAr": "جميع مشرفي القسم المالي",
  "roleIds": ["ENCRYPTED_ROLE_ID_1", "ENCRYPTED_ROLE_ID_2"],
  "tenantId": "ENCRYPTED_TENANT_ID"
}`,
      },
      {
        label: "Update Group",
        language: "json",
        filename: "PUT /api/v1/UserGroups/{id} — Request",
        code: `{
  "nameEn": "Updated Finance Team",
  "nameAr": "فريق المالية المحدث",
  "descriptionEn": "Updated description",
  "descriptionAr": "الوصف المحدث",
  "roleIds": ["ENCRYPTED_ROLE_ID_1", "ENCRYPTED_ROLE_ID_3"],
  "isActive": true
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
        path: "/api/v1/UserGroups/{groupId}/members",
        descriptionKey: "apiReference.userGroupsApi.addMembersDesc",
        auth: "user_groups.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/UserGroups/{groupId}/members/{adminId}",
        descriptionKey: "apiReference.userGroupsApi.removeMemberDesc",
        auth: "user_groups.update",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "POST /api/v1/UserGroups/{groupId}/members — Request",
    code: `{
  "adminIds": [
    "ENCRYPTED_ADMIN_ID_1",
    "ENCRYPTED_ADMIN_ID_2"
  ]
}`,
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
        path: "/api/v1/UserGroups/{groupId}/roles",
        descriptionKey: "apiReference.userGroupsApi.setGroupRolesDesc",
        auth: "user_groups.update",
      },
      {
        method: "PUT",
        path: "/api/v1/UserGroups/{groupId}/restrictions",
        descriptionKey: "apiReference.userGroupsApi.setGroupRestrictionsDesc",
        auth: "user_groups.update",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Set Roles",
        language: "json",
        filename: "PUT /api/v1/UserGroups/{groupId}/roles — Request",
        code: `{
  "roleIds": [
    "ENCRYPTED_ROLE_ID_1",
    "ENCRYPTED_ROLE_ID_2"
  ]
}`,
      },
      {
        label: "Set Restrictions",
        language: "json",
        filename: "PUT /api/v1/UserGroups/{groupId}/restrictions — Request",
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
    ],
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
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/activate-all",
        descriptionKey: "apiReference.userGroupsApi.bulkActivateAllDesc",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/deactivate-all",
        descriptionKey: "apiReference.userGroupsApi.bulkDeactivateAllDesc",
        auth: "user_groups.update",
      },
      {
        method: "POST",
        path: "/api/v1/UserGroups/bulk/delete-all",
        descriptionKey: "apiReference.userGroupsApi.bulkDeleteAllDesc",
        auth: "user_groups.delete",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Bulk Action (by IDs)",
        language: "json",
        filename: "POST /api/v1/UserGroups/bulk/{activate|deactivate|delete} — Request",
        code: `{
  "ids": [
    "ENCRYPTED_GROUP_ID_1",
    "ENCRYPTED_GROUP_ID_2"
  ],
  "cascadeAdmins": true
}`,
      },
      {
        label: "Bulk Action (by Filter)",
        language: "json",
        filename: "POST /api/v1/UserGroups/bulk/{activate|deactivate|delete}-all — Request",
        code: `{
  "tenantId": "ENCRYPTED_TENANT_ID",
  "search": "Finance",
  "isActive": true,
  "cascadeAdmins": true
}`,
      },
    ],
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
  lastUpdated: "2026-06-28",
});
