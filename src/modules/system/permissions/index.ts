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
      PermissionData,
      PermissionCategoryGroup,
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
