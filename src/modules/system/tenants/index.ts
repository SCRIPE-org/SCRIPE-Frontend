/**
 * Tenant Submodule Public Exports
 */

// Views
export { TenantsView } from "./src/presentation/views/TenantsView";

// ViewModels
export { useTenantsViewModel } from "./src/presentation/viewmodels/useTenantsViewModel";

// Entities
export { Tenant } from "./src/domain/entities/Tenant";
export type {
  TenantProps,
  TenantTreeNode,
  TenantTreeNodeProps,
  // Keep backward compatibility
  TenantData,
} from "./src/domain/entities/Tenant";
export type {
  CreateTenantRequest,
  UpdateTenantRequest,
} from "./src/domain/entities/TenantRequests";

// Interfaces
export type {
  ITenantRepository,
  TenantListParams,
} from "./src/domain/interfaces/ITenantRepository";

// Services (for DI)
export { TenantService } from "./src/data/services/TenantService";
export type {
  ITenantService,
  ServiceTenantListParams,
  TenantListResult,
} from "./src/domain/interfaces/ITenantService";
export type { TenantStats } from "./src/domain/interfaces/ITenantRepository";
