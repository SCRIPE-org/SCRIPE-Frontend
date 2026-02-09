/**
 * Role Submodule Public Exports
 */

// Views
export { RolesView } from "./src/presentation/views/RolesView";

// ViewModels
export { useRolesViewModel } from "./src/presentation/viewmodels/useRolesViewModel";

// Entities
export { Role } from "./src/domain/entities/Role";
export type {
      RoleProps,
      RolePermission,
      // Keep backward compatibility aliases
      RoleData,
      RolePermissionData,
} from "./src/domain/entities/Role";
export type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
      CloneRoleRequest,
      DeleteRoleRequest,
} from "./src/domain/entities/RoleRequests";

// Interfaces
export type { IRoleRepository, RoleListParams } from "./src/domain/interfaces/IRoleRepository";

// Services (for DI)
export { RoleService } from "./src/data/services/RoleService";
export type { IRoleService, ServiceRoleListParams, RoleListResult } from "./src/domain/interfaces/IRoleService";
