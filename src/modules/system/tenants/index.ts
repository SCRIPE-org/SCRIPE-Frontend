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
      TenantData,
      TenantTreeNode,
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
