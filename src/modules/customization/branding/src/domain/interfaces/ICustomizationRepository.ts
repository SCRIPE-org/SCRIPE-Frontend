/**
 * Customization Repository Interface
 *
 * Defines the contract for customization data operations.
 * Repositories map Models → Entities, ViewModels use this interface.
 *
 * @module customization/domain
 */
import type { BrandingConfig } from "../entities/BrandingConfig";
import type { SystemDefaults } from "../entities/SystemDefaults";
import type { AuditLogEntry } from "../entities/AuditLogEntry";
import type { PagedResult } from "@core/interfaces/common.interface";

/**
 * Interface defining repository methods for managing Customization data access.
 */
export interface ICustomizationRepository {
  // ── Tenant Branding (My Tenant) ──

  /** Get the current tenant's branding config */
  getMyBranding(): Promise<BrandingConfig>;

  /** Update the current tenant's settings (partial update) */
  updateMySettings(data: Record<string, unknown>): Promise<void>;

  /** Publish draft branding to live */
  publishBranding(expectedVersion: number): Promise<void>;

  /** Discard unpublished draft */
  discardDraft(): Promise<void>;

  /** Reset draft branding to a known baseline */
  resetBranding(type: "Published" | "GlobalDefault" | "FactoryDefault"): Promise<void>;

  /** Rollback to a specific version */
  rollback(targetVersion: number): Promise<void>;

  // ── Tenant-Scoped (Drilldown) ──

  /** Get a specific tenant's branding config (super admin drilldown) */
  getTenantBrandingById(tenantId: string): Promise<BrandingConfig>;

  /** Update a specific tenant's settings (super admin drilldown) */
  updateTenantSettingsById(tenantId: string, data: Record<string, unknown>): Promise<void>;

  // ── System Settings ──

  /** Get platform-wide system defaults */
  getSystemDefaults(): Promise<SystemDefaults>;

  /** Update platform-wide system defaults */
  updateSystemDefaults(data: Record<string, unknown>): Promise<void>;

  // ── Audit Log ──

  /** Get paginated audit log for current tenant */
  getAuditLog(page: number, pageSize: number): Promise<PagedResult<AuditLogEntry>>;
}
