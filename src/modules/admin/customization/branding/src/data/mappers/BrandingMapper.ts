/**
 * Branding Mapper
 *
 * Maps between Branding Model (API DTO) and domain entities.
 * Following the canonical RoleMapper pattern.
 *
 * @module customization/data
 */

import { BrandingConfig, type BrandingConfigProps } from "../../domain/entities/BrandingConfig";
import { SystemDefaults, type SystemDefaultsProps } from "../../domain/entities/SystemDefaults";
import { AuditLogEntry, type AuditLogEntryProps } from "../../domain/entities/AuditLogEntry";
import { BrandingModel, AuditLogEntryModel } from "../models/BrandingModel";
import type { BrandingResponseJson, AuditLogEntryJson } from "../models/BrandingModel";
import { SystemSettingsModel } from "../models/SystemSettingsModel";
import type { SystemSettingsJson } from "../models/SystemSettingsModel";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class BrandingMapper {
  // ── BrandingModel → BrandingConfig Entity ──

  static toBrandingEntity(model: BrandingModel): BrandingConfig {
    const props: BrandingConfigProps = {
      companyName: model.companyName,
      logoUrl: model.logoUrl,
      faviconUrl: model.faviconUrl,
      loginHeadline: model.loginHeadline,
      loginSubtitle: model.loginSubtitle,
      primaryColor: model.primaryColor,
      secondaryColor: model.secondaryColor,
      loginBrandingJson: model.loginBrandingJson,
      draftBrandingJson: model.draftBrandingJson,
      slotConfigJson: model.slotConfigJson,
      dashboardThemeJson: model.dashboardThemeJson,
      allowedLayoutsJson: model.allowedLayoutsJson,
      allowAdminThemeOverride: model.allowAdminThemeOverride,
      allowedAdminSettingsJson: model.allowedAdminSettingsJson,
      loginTextOverridesJson: model.loginTextOverridesJson,
      customFeaturesJson: model.customFeaturesJson,
      termsOfServiceUrl: model.termsOfServiceUrl,
      privacyPolicyUrl: model.privacyPolicyUrl,
      settingsVersion: model.settingsVersion,
      isSafeMode: model.isSafeMode,
    };
    return new BrandingConfig(props);
  }

  /** Shortcut: raw JSON → BrandingConfig entity */
  static jsonToBrandingEntity(json: BrandingResponseJson): BrandingConfig {
    return BrandingMapper.toBrandingEntity(BrandingModel.fromJson(json));
  }

  // ── SystemSettingsModel → SystemDefaults Entity ──

  static toSystemDefaultsEntity(model: SystemSettingsModel): SystemDefaults {
    const props: SystemDefaultsProps = {
      defaultThemeJson: model.defaultThemeJson,
      layoutCatalogJson: model.layoutCatalogJson,
      slotRegistryJson: model.slotRegistryJson,
      loginBrandingJson: model.loginBrandingJson,
      slotConfigJson: model.slotConfigJson,
      draftBrandingJson: model.draftBrandingJson,
      defaultCompanyName: model.defaultCompanyName,
      defaultLogoUrl: model.defaultLogoUrl,
      defaultFaviconUrl: model.defaultFaviconUrl,
      defaultLoginHeadline: model.defaultLoginHeadline,
      defaultLoginSubtitle: model.defaultLoginSubtitle,
      defaultPrimaryColor: model.defaultPrimaryColor,
      defaultSecondaryColor: model.defaultSecondaryColor,
      defaultTermsOfServiceUrl: model.defaultTermsOfServiceUrl,
      defaultPrivacyPolicyUrl: model.defaultPrivacyPolicyUrl,
      dashboardThemeJson: model.dashboardThemeJson,
      settingsVersion: model.settingsVersion,
    };
    return new SystemDefaults(props);
  }

  /** Shortcut: raw JSON → SystemDefaults entity */
  static jsonToSystemDefaultsEntity(json: SystemSettingsJson): SystemDefaults {
    return BrandingMapper.toSystemDefaultsEntity(SystemSettingsModel.fromJson(json));
  }

  // ── AuditLogEntryModel → AuditLogEntry Entity ──

  static toAuditLogEntity(model: AuditLogEntryModel): AuditLogEntry {
    const props: AuditLogEntryProps = {
      versionNumber: model.versionNumber,
      changeType: model.changeType,
      changedByAdminName: model.changedByAdminName,
      changedAt: model.changedAt,
    };
    return new AuditLogEntry(props);
  }

  /** Shortcut: raw JSON → AuditLogEntry entity */
  static jsonToAuditLogEntity(json: AuditLogEntryJson): AuditLogEntry {
    return BrandingMapper.toAuditLogEntity(AuditLogEntryModel.fromJson(json));
  }

  /** Map array of audit log entries */
  static toAuditLogEntityList(models: AuditLogEntryModel[]): AuditLogEntry[] {
    return models.map((m) => BrandingMapper.toAuditLogEntity(m));
  }
}
