/**
 * Admin Submodule Public Exports
 */

// Views
export { AdminsView } from "./src/presentation/views/AdminsView";

// ViewModels
export { useAdminsViewModel } from "./src/presentation/viewmodels/useAdminsViewModel";

// Entities
export { Admin } from "./src/domain/entities/Admin";
export type { AdminData, AdminRoleData } from "./src/domain/entities/Admin";
export type {
  CreateAdminRequest,
  UpdateAdminRequest,
  AssignRoleRequest,
} from "./src/domain/entities/AdminRequests";

// Interfaces
export type { IAdminRepository, AdminListParams } from "./src/domain/interfaces/IAdminRepository";
