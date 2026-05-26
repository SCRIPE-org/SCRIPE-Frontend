/**
 * Permission Submodule Public Exports
 */

// Views
export { PermissionsView } from "./src/presentation/views/PermissionsView";

// ViewModels
export { usePermissionsViewModel } from "./src/presentation/viewmodels/usePermissionsViewModel";

// Entities
export { Permission } from "./src/domain/entities/Permission";
export type {
  PermissionProps,
  PermissionCategoryGroup,
  PermissionModuleGroup,
} from "./src/domain/entities/Permission";
export type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "./src/domain/entities/PermissionRequests";

// Interfaces
export type {
  IPermissionRepository,
  PermissionListParams,
} from "./src/domain/interfaces/IPermissionRepository";

// Mappers (for sibling sub-modules: roles, tenants)
export { PermissionMapper } from "./src/data/mappers/PermissionMapper";

// Data Models (for sibling sub-modules: roles, tenants service layer)
export type { PermissionModuleGroupJson, PermissionJson } from "./src/data/models/PermissionModel";
export { PermissionModel } from "./src/data/models/PermissionModel";

// Services (for DI)
export { PermissionService } from "./src/data/services/PermissionService";
export type { IPermissionService } from "./src/domain/interfaces/IPermissionService";
