/**
 * Customization Repository
 *
 * Implements ICustomizationRepository. Uses Service for API calls
 * and Mapper for Model → Entity conversion.
 *
 * @module customization/data
 */
import type { ICustomizationRepository } from "../../domain/interfaces/ICustomizationRepository";
import type { ICustomizationService } from "../../domain/interfaces/ICustomizationService";
import type { BrandingConfig } from "../../domain/entities/BrandingConfig";
import type { SystemDefaults } from "../../domain/entities/SystemDefaults";
import type { AuditLogEntry } from "../../domain/entities/AuditLogEntry";
import type { PagedResult } from "@/modules/identity/core/domain/types";
import { BrandingMapper } from "../mappers/BrandingMapper";
import { BrandingModel, AuditLogEntryModel } from "../models/BrandingModel";
import { SystemSettingsModel } from "../models/SystemSettingsModel";

export class CustomizationRepository implements ICustomizationRepository {
  constructor(private readonly service: ICustomizationService) { }

  // ── Tenant Branding (My Tenant) ──

  async getMyBranding(): Promise<BrandingConfig> {
    const json = await this.service.getMyBranding();
    const model = BrandingModel.fromJson(json);
    return BrandingMapper.toBrandingEntity(model);
  }

  async updateMySettings(data: Record<string, unknown>): Promise<void> {
    await this.service.updateMySettings(data);
  }

  async publishBranding(expectedVersion: number): Promise<void> {
    await this.service.publishBranding({ expectedVersion });
  }

  async discardDraft(): Promise<void> {
    await this.service.discardDraft();
  }

  async resetBranding(type: "Published" | "GlobalDefault" | "FactoryDefault"): Promise<void> {
    await this.service.resetBranding(type);
  }

  async rollback(targetVersion: number): Promise<void> {
    await this.service.rollback(targetVersion);
  }

  // ── Tenant-Scoped (Drilldown) ──

  async getTenantBrandingById(tenantId: string): Promise<BrandingConfig> {
    const json = await this.service.getTenantSettingsById(tenantId);
    const model = BrandingModel.fromJson(json);
    return BrandingMapper.toBrandingEntity(model);
  }

  async updateTenantSettingsById(tenantId: string, data: Record<string, unknown>): Promise<void> {
    await this.service.updateTenantSettingsById(tenantId, data);
  }

  // ── System Settings ──

  async getSystemDefaults(): Promise<SystemDefaults> {
    const json = await this.service.getSystemSettings();
    const model = SystemSettingsModel.fromJson(json);
    return BrandingMapper.toSystemDefaultsEntity(model);
  }

  async updateSystemDefaults(data: Record<string, unknown>): Promise<void> {
    await this.service.updateSystemSettings(data);
  }

  // ── Audit Log ──

  async getAuditLog(page: number, pageSize: number): Promise<PagedResult<AuditLogEntry>> {
    const json = await this.service.getAuditLog(page, pageSize);
    const models = json.items.map((item) => AuditLogEntryModel.fromJson(item));
    const entities = BrandingMapper.toAuditLogEntityList(models);

    return {
      items: entities,
      totalCount: json.totalCount,
      page: json.page,
      pageSize: json.pageSize,
      totalPages: Math.ceil(json.totalCount / json.pageSize),
      hasNextPage: json.page * json.pageSize < json.totalCount,
      hasPreviousPage: json.page > 1,
    };
  }
}
