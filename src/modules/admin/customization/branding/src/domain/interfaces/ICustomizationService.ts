/**
 * Customization Service Interface
 *
 * Defines the contract for ALL customization API operations.
 * Implementation in data/services/CustomizationService.ts
 *
 * @module customization/domain
 */
import type {
  BrandingResponseJson,
  AuditLogPagedResultJson,
} from "../types/CustomizationServiceTypes";
import type {
  SystemSettingsJson,
  UpdateSystemSettingsJson,
} from "../types/CustomizationServiceTypes";

/**
 * Http API network service for i customization.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ICustomizationService {
  // ── Tenant Branding (My Tenant) ──
  getMyBranding(): Promise<BrandingResponseJson>;
  updateMySettings(data: Record<string, unknown>): Promise<void>;
  publishBranding(request: { expectedVersion: number }): Promise<void>;
  discardDraft(): Promise<void>;
  resetBranding(type: "Published" | "GlobalDefault" | "FactoryDefault"): Promise<void>;
  rollback(targetVersion: number): Promise<void>;

  // ── Tenant Display Prefs (DashboardThemeJson) ──
  saveTenantDisplayPrefs(dashboardThemeJson: string): Promise<void>;

  // ── Tenant-Scoped (Drilldown) ──
  getTenantSettingsById(tenantId: string): Promise<BrandingResponseJson>;
  updateTenantSettingsById(tenantId: string, data: Record<string, unknown>): Promise<void>;

  // ── System Settings ──
  getSystemSettings(): Promise<SystemSettingsJson>;
  updateSystemSettings(request: UpdateSystemSettingsJson): Promise<void>;
  saveSystemBranding(data: UpdateSystemSettingsJson): Promise<void>;

  // ── Audit Log ──
  getAuditLog(page: number, pageSize: number): Promise<AuditLogPagedResultJson>;

  // ── Admin Preferences ──
  getAdminPreferences(): Promise<{ adminSettingsJson: string | null }>;
  updateAdminPreferences(request: { adminSettingsJson?: string | null }): Promise<void>;
}
