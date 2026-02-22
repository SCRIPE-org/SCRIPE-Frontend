import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "apiReference.userGroupsApi.intro" },

      // ─── User Groups CRUD ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userGroupsApi.crudTitle", id: "user-groups-crud",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/usergroups", descriptionKey: "apiReference.userGroupsApi.listGroupsDesc", auth: "user_groups.view" },
                  { method: "GET", path: "/api/v1/usergroups/myTenantGroups", descriptionKey: "apiReference.userGroupsApi.myTenantGroupsDesc", auth: "user_groups.view" },
                  { method: "GET", path: "/api/v1/usergroups/{id}", descriptionKey: "apiReference.userGroupsApi.getGroupDesc", auth: "user_groups.view" },
                  { method: "GET", path: "/api/v1/usergroups/byTenant/{tenantId}", descriptionKey: "apiReference.userGroupsApi.groupsByTenantDesc", auth: "user_groups.view" },
                  { method: "POST", path: "/api/v1/usergroups", descriptionKey: "apiReference.userGroupsApi.createGroupDesc", auth: "user_groups.create" },
                  { method: "POST", path: "/api/v1/usergroups/createForMyTenant", descriptionKey: "apiReference.userGroupsApi.createGroupMyTenantDesc", auth: "user_groups.create" },
                  { method: "PUT", path: "/api/v1/usergroups/{id}", descriptionKey: "apiReference.userGroupsApi.updateGroupDesc", auth: "user_groups.update" },
                  { method: "DELETE", path: "/api/v1/usergroups/{id}", descriptionKey: "apiReference.userGroupsApi.deleteGroupDesc", auth: "user_groups.delete" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Group Detail",
                        language: "json",
                        filename: "GET /usergroups/{id} — Response",
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
                        filename: "POST /usergroups — Request",
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

      // ─── User Group Members ────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userGroupsApi.groupMembersTitle", id: "group-members",
      },
      { type: "paragraph", contentKey: "apiReference.userGroupsApi.groupMembersIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/usergroups/{id}/members", descriptionKey: "apiReference.userGroupsApi.addMembersDesc", auth: "user_groups.update" },
                  { method: "DELETE", path: "/api/v1/usergroups/{id}/members/{adminId}", descriptionKey: "apiReference.userGroupsApi.removeMemberDesc", auth: "user_groups.update" },
            ],
      },

      // ─── User Group Roles & Restrictions ───────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userGroupsApi.groupRolesRestrictionsTitle", id: "group-roles-restrictions",
      },
      { type: "paragraph", contentKey: "apiReference.userGroupsApi.groupRolesRestrictionsIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "PUT", path: "/api/v1/usergroups/{id}/roles", descriptionKey: "apiReference.userGroupsApi.setGroupRolesDesc", auth: "user_groups.update" },
                  { method: "PUT", path: "/api/v1/usergroups/{id}/restrictions", descriptionKey: "apiReference.userGroupsApi.setGroupRestrictionsDesc", auth: "user_groups.update" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "PUT /usergroups/{id}/restrictions — Request",
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
            type: "heading", level: 2,
            titleKey: "apiReference.userGroupsApi.bulkCascadeTitle", id: "bulk-cascade-operations",
      },
      { type: "paragraph", contentKey: "apiReference.userGroupsApi.bulkCascadeIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/usergroups/bulk/activate", descriptionKey: "apiReference.userGroupsApi.bulkActivateDesc", auth: "user_groups.update" },
                  { method: "POST", path: "/api/v1/usergroups/bulk/deactivate", descriptionKey: "apiReference.userGroupsApi.bulkDeactivateDesc", auth: "user_groups.update" },
                  { method: "POST", path: "/api/v1/usergroups/bulk/delete", descriptionKey: "apiReference.userGroupsApi.bulkDeleteDesc", auth: "user_groups.delete" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "POST /usergroups/bulk/delete — Request",
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
