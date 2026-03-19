import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@/core/config/api-endpoints";

// ─── Response Types ─────────────────────────────────────
export interface AuditLogEntry {
  versionNumber: number;
  changeType: string;
  changedByAdminName: string | null;
  changedAt: string;
}

export interface AuditLogPagedResult {
  items: AuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface SystemSettingsResponse {
  defaultThemeJson: string | null;
  layoutCatalogJson: string | null;
  slotRegistryJson: string | null;
}

export interface AdminSettingsResponse {
  adminSettingsJson: string | null;
}

// ─── Request Types ──────────────────────────────────────
export interface PublishBrandingRequest {
  expectedVersion: number;
}

export interface UpdateSystemSettingsRequest {
  defaultThemeJson?: string | null;
  layoutCatalogJson?: string | null;
  slotRegistryJson?: string | null;
}

export interface UpdateAdminSettingsRequest {
  adminSettingsJson?: string | null;
}

/**
 * CustomizationService - API wrapper for customization system endpoints
 */
export class CustomizationService {
  constructor(private readonly apiService: IApiService) {}

  // ── Publish / Draft / Rollback ──
  async publishBranding(request: PublishBrandingRequest): Promise<void> {
    await this.apiService.post(API_ENDPOINTS.TENANTS.PUBLISH_BRANDING, request);
  }

  async discardDraft(): Promise<void> {
    await this.apiService.delete(API_ENDPOINTS.TENANTS.DISCARD_DRAFT);
  }

  async rollback(targetVersion: number): Promise<void> {
    await this.apiService.post(API_ENDPOINTS.TENANTS.ROLLBACK(targetVersion), {});
  }

  // ── Audit Log ──
  async getAuditLog(page: number = 1, pageSize: number = 20): Promise<AuditLogPagedResult> {
    return this.apiService.get<AuditLogPagedResult>(
      buildUrl(API_ENDPOINTS.TENANTS.AUDIT_LOG, { page, pageSize })
    );
  }

  // ── System Settings ──
  async getSystemSettings(): Promise<SystemSettingsResponse> {
    return this.apiService.get<SystemSettingsResponse>(API_ENDPOINTS.TENANTS.SYSTEM_SETTINGS);
  }

  async updateSystemSettings(request: UpdateSystemSettingsRequest): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.SYSTEM_SETTINGS, request);
  }

  // ── Admin Preferences ──
  async getAdminPreferences(): Promise<AdminSettingsResponse> {
    return this.apiService.get<AdminSettingsResponse>(API_ENDPOINTS.TENANTS.ADMIN_PREFERENCES);
  }

  async updateAdminPreferences(request: UpdateAdminSettingsRequest): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.ADMIN_PREFERENCES, request);
  }

  // ── Tenant Display Preferences (DashboardThemeJson) ──
  async saveTenantDisplayPrefs(dashboardThemeJson: string): Promise<void> {
    await this.apiService.put(API_ENDPOINTS.TENANTS.MY_SETTINGS, {
      dashboardThemeJson,
    });
  }
}
