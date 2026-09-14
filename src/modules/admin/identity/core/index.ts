/**
 * Identity Core shared exports
 */

// Permissions
export { Permission } from "../permissions/src/domain/entities/Permission";
export type {
  PermissionProps,
  PermissionCategoryGroup,
  PermissionModuleGroup,
} from "../permissions/src/domain/entities/Permission";
export { PermissionMapper } from "../permissions/src/data/mappers/PermissionMapper";
export { PermissionModel } from "../permissions/src/data/models/PermissionModel";
export type {
  PermissionModuleGroupJson,
  PermissionJson,
} from "../permissions/src/data/models/PermissionModel";
export type { IPermissionService } from "../permissions/src/domain/interfaces/IPermissionService";

// Roles
export { Role } from "../roles/src/domain/entities/Role";
export { useRolesViewModel } from "../roles/src/presentation/viewmodels/useRolesViewModel";
export { RolePermissionsDialog } from "../roles/src/presentation/components/RolePermissionsDialog";

// User Groups
export { UserGroup } from "../user-groups/src/domain/entities/UserGroup";
export { useUserGroupsViewModel } from "../user-groups/src/presentation/viewmodels/useUserGroupsViewModel";
export type { UserGroupListItem } from "../user-groups/src/presentation/viewmodels/useUserGroupsViewModel";
export { CascadeDeleteDialog } from "../user-groups/src/presentation/components/CascadeDeleteDialog";
export { CascadeStatusDialog } from "../user-groups/src/presentation/components/CascadeStatusDialog";
export { AssignToGroupDialog } from "../user-groups/src/presentation/components/AssignToGroupDialog";

// Tenants
export { SYSTEM_TENANT_ID, Tenant } from "../tenants/src/domain/entities/Tenant";
export type { TenantProps, TenantTreeNode } from "../tenants/src/domain/entities/Tenant";

// Admins
export { AdminsView } from "../admin/src/presentation/views/AdminsView";
export { useAdminsViewModel } from "../admin/src/presentation/viewmodels/useAdminsViewModel";
