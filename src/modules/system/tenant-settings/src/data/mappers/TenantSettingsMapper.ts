import type { TenantSettings } from "../../domain/entities/TenantSettings";
import type {
  TenantSettingsModel,
  UpdateTenantSettingsRequest,
} from "../models/TenantSettingsModel";

/**
 * Mapper for TenantSettings ↔ TenantSettingsModel
 * Handles conversion between domain entities and API DTOs
 */
export const TenantSettingsMapper = {
  /**
   * Map API model to domain entity
   */
  toDomain(model: TenantSettingsModel): TenantSettings {
    return {
      maxAdmins: model.maxAdmins,
      maxRoles: model.maxRoles,
      maxSubTenants: model.maxSubTenants,
      passwordMinLength: model.passwordMinLength,
      passwordRequireUppercase: model.passwordRequireUppercase,
      passwordRequireNumber: model.passwordRequireNumber,
      passwordRequireSpecial: model.passwordRequireSpecial,
      passwordExpiryDays: model.passwordExpiryDays,
      loginLockoutThreshold: model.loginLockoutThreshold,
      loginLockoutMinutes: model.loginLockoutMinutes,
      require2FA: model.require2FA,
      auditEnabled: model.auditEnabled,
      auditRetentionDays: model.auditRetentionDays,
      logoUrl: model.logoUrl,
      primaryColor: model.primaryColor,
      secondaryColor: model.secondaryColor,
      faviconUrl: model.faviconUrl,
      loginHeadline: model.loginHeadline,
      loginSubtitle: model.loginSubtitle,
      companyName: model.companyName,
      // Customization System
      loginBrandingJson: model.loginBrandingJson,
      dashboardThemeJson: model.dashboardThemeJson,
      allowedLayoutsJson: model.allowedLayoutsJson,
      allowAdminThemeOverride: model.allowAdminThemeOverride,
      allowedAdminSettingsJson: model.allowedAdminSettingsJson,
      draftBrandingJson: model.draftBrandingJson,
      loginTextOverridesJson: model.loginTextOverridesJson,
      customFeaturesJson: model.customFeaturesJson,
      slotConfigJson: model.slotConfigJson,
      termsOfServiceUrl: model.termsOfServiceUrl,
      privacyPolicyUrl: model.privacyPolicyUrl,
      settingsVersion: model.settingsVersion,
      isSafeMode: model.isSafeMode,
    };
  },

  /**
   * Map domain entity to API request
   */
  toRequest(entity: Partial<TenantSettings>): UpdateTenantSettingsRequest {
    return {
      maxAdmins: entity.maxAdmins,
      maxRoles: entity.maxRoles,
      maxSubTenants: entity.maxSubTenants,
      passwordMinLength: entity.passwordMinLength,
      passwordRequireUppercase: entity.passwordRequireUppercase,
      passwordRequireNumber: entity.passwordRequireNumber,
      passwordRequireSpecial: entity.passwordRequireSpecial,
      passwordExpiryDays: entity.passwordExpiryDays,
      loginLockoutThreshold: entity.loginLockoutThreshold,
      loginLockoutMinutes: entity.loginLockoutMinutes,
      require2FA: entity.require2FA,
      auditEnabled: entity.auditEnabled,
      auditRetentionDays: entity.auditRetentionDays,
      logoUrl: entity.logoUrl,
      primaryColor: entity.primaryColor,
      secondaryColor: entity.secondaryColor,
      faviconUrl: entity.faviconUrl,
      loginHeadline: entity.loginHeadline,
      loginSubtitle: entity.loginSubtitle,
      companyName: entity.companyName,
      // Customization System
      loginBrandingJson: entity.loginBrandingJson,
      dashboardThemeJson: entity.dashboardThemeJson,
      allowedLayoutsJson: entity.allowedLayoutsJson,
      allowAdminThemeOverride: entity.allowAdminThemeOverride,
      allowedAdminSettingsJson: entity.allowedAdminSettingsJson,
      draftBrandingJson: entity.draftBrandingJson,
      loginTextOverridesJson: entity.loginTextOverridesJson,
      customFeaturesJson: entity.customFeaturesJson,
      slotConfigJson: entity.slotConfigJson,
      termsOfServiceUrl: entity.termsOfServiceUrl,
      privacyPolicyUrl: entity.privacyPolicyUrl,
    };
  },
};
