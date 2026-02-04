/**
 * Tenant Settings Module - Public API
 *
 * Following Clean Architecture patterns:
 * - Domain layer: entities, interfaces
 * - Data layer: models, mappers, services, repositories
 * - Presentation layer: viewmodels, views
 *
 * NOTE: Service and Repository registered in @modules/system/di.ts
 */

// Public view
export { TenantSettingsView } from "./src/presentation/views/TenantSettingsView";

// Public viewmodel
export { useTenantSettingsViewModel, tenantSettingsKeys } from "./src/presentation/viewmodels/useTenantSettingsViewModel";

// Public entities
export type { TenantSettings } from "./src/domain/entities/TenantSettings";
export { DEFAULT_TENANT_SETTINGS } from "./src/domain/entities/TenantSettings";

// Public interfaces
export type { ITenantSettingsRepository } from "./src/domain/interfaces/ITenantSettingsRepository";
export type { ITenantSettingsService } from "./src/domain/interfaces/ITenantSettingsService";
