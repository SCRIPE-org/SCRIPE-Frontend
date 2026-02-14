/**
 * Permission Submodule Public Exports
 */

// Views
export { PermissionsView } from "./src/presentation/views/PermissionsView";

// ViewModels
export { usePermissionsViewModel } from "./src/presentation/viewmodels/usePermissionsViewModel";

// Entities
export { Permission } from "./src/domain/entities/Permission";
export type { PermissionProps, PermissionCategoryGroup } from "./src/domain/entities/Permission";
export type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "./src/domain/entities/PermissionRequests";

// Interfaces
export type {
  IPermissionRepository,
  PermissionListParams,
} from "./src/domain/interfaces/IPermissionRepository";

// Services (for DI)
export { PermissionService } from "./src/data/services/PermissionService";
export type { IPermissionService } from "./src/domain/interfaces/IPermissionService";
