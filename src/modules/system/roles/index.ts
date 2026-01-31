/**
 * Role Submodule Public Exports
 */

// Views
export { RolesView } from "./src/presentation/views/RolesView";

// ViewModels
export { useRolesViewModel } from "./src/presentation/viewmodels/useRolesViewModel";

// Entities
export { Role } from "./src/domain/entities/Role";
export type { RoleData, RolePermissionData } from "./src/domain/entities/Role";
export type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
} from "./src/domain/entities/RoleRequests";

// Interfaces
export type { IRoleRepository, RoleListParams } from "./src/domain/interfaces/IRoleRepository";
