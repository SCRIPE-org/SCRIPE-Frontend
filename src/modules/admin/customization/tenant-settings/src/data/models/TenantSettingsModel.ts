/**
 * TenantSettingsModel - Data Layer
 *
 * Re-exports from domain types (single source of truth).
 *
 * @module tenant-settings/data
 */
export type {
  IdentityProviderMode,
  TenantAuthenticationMode,
  TenantSettingsModel,
  UpdateTenantSettingsRequest,
} from "../../domain/types/SettingsTypes";
export { normalizeTenantAuthenticationMode } from "../../domain/types/SettingsTypes";
