/**
 * Customization Service
 *
 * Thin API wrapper — all HTTP calls go through IApiService.
 * Implements ICustomizationService interface from domain layer.
 *
 * Single Responsibility: only does HTTP calls, no business logic.
 *
 * @module customization/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@/core/config/api-endpoints";
import type { ICustomizationService } from "../../domain/interfaces/ICustomizationService";
import type { BrandingResponseJson, AuditLogPagedResultJson } from "../models/BrandingModel";
import type { SystemSettingsJson, UpdateSystemSettingsJson } from "../models/SystemSettingsModel";

/**
 * Http API network service for customization.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class CustomizationService implements ICustomizationService {
  constructor(private readonly apiService: IApiService) {}

  // ── Tenant Branding (My Tenant) ──

  async getMyBranding(): Promise<BrandingResponseJson> {
    return this.apiService.get<BrandingResponseJson>(API_ENDPOINTS.TENANTS.MY_BRANDING);
  }

  async updateMySettings(data: Record<string, unknown>): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.MY_SETTINGS, data);
  }

  async publishBranding(request: { expectedVersion: number }): Promise<void> {
    await this.apiService.post(API_ENDPOINTS.TENANTS.PUBLISH_BRANDING, request);
  }

  async discardDraft(): Promise<void> {
    await this.apiService.delete(API_ENDPOINTS.TENANTS.DISCARD_DRAFT);
  }

  async rollback(targetVersion: number): Promise<void> {
    await this.apiService.post(API_ENDPOINTS.TENANTS.ROLLBACK(targetVersion), {});
  }

  async resetBranding(type: "Published" | "GlobalDefault" | "FactoryDefault"): Promise<void> {
    await this.apiService.post(API_ENDPOINTS.TENANTS.RESET_BRANDING, { type });
  }

  // ── Tenant Display Prefs (DashboardThemeJson) ──

  async saveTenantDisplayPrefs(dashboardThemeJson: string): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.MY_SETTINGS, {
      dashboardThemeJson,
    });
  }

  // ── Tenant-Scoped (Drilldown) ──

  async getTenantSettingsById(tenantId: string): Promise<BrandingResponseJson> {
    return this.apiService.get<BrandingResponseJson>(API_ENDPOINTS.TENANTS.SETTINGS(tenantId));
  }

  async updateTenantSettingsById(tenantId: string, data: Record<string, unknown>): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.SETTINGS(tenantId), data);
  }

  // ── System Settings ──

  async getSystemSettings(): Promise<SystemSettingsJson> {
    return this.apiService.get<SystemSettingsJson>(API_ENDPOINTS.TENANTS.SYSTEM_SETTINGS);
  }

  async updateSystemSettings(request: UpdateSystemSettingsJson): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.SYSTEM_SETTINGS, request);
  }

  async saveSystemBranding(data: UpdateSystemSettingsJson): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.SYSTEM_SETTINGS, data);
  }

  // ── Audit Log ──

  async getAuditLog(page: number = 1, pageSize: number = 20): Promise<AuditLogPagedResultJson> {
    return this.apiService.get<AuditLogPagedResultJson>(
      `${API_ENDPOINTS.TENANTS.AUDIT_LOG}?page=${page}&pageSize=${pageSize}`
    );
  }

  // ── Admin Preferences ──

  async getAdminPreferences(): Promise<{ adminSettingsJson: string | null }> {
    return this.apiService.get(API_ENDPOINTS.TENANTS.ADMIN_PREFERENCES);
  }

  async updateAdminPreferences(request: { adminSettingsJson?: string | null }): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.ADMIN_PREFERENCES, request);
  }
}
