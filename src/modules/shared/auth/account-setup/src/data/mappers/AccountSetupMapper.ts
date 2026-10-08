/**
 * AccountSetupMapper — Data Mapper transforming raw account setup DTOs
 * into immutable Domain Entities with defensive defaults and computed properties.
 *
 * @module auth/account-setup/data/mappers
 */

import { SetupTokenInfo, SetupCustomField, AccountActivationResult } from "../../domain/entities";
import type {
  ValidateTokenResponse,
  SetupCustomFieldDto,
  ActivateAccountResponse,
} from "../../domain/interfaces/IAccountSetupService";

/**
 * Documentation for module export
 */
export class AccountSetupMapper {
  /**
   * Transforms token validation DTO to SetupTokenInfo domain entity.
   */
  static toTokenInfoEntity(dto: ValidateTokenResponse): SetupTokenInfo {
    return new SetupTokenInfo({
      adminUsername: dto.adminUsername ?? "",
      tenantName: dto.tenantName ?? "",
      email: dto.email ?? dto.adminEmail ?? "",
      isValid: Boolean(dto.isValid),
      errorMessage: dto.errorMessage,
      passwordMinLength: dto.passwordMinLength ?? 8,
      passwordRequireUppercase: dto.passwordRequireUppercase ?? true,
      passwordRequireNumber: dto.passwordRequireNumber ?? true,
      passwordRequireSpecial: dto.passwordRequireSpecial ?? true,
      adminId: dto.adminId,
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      phoneNumber: dto.phoneNumber ?? "",
      profileImageUrl: dto.profileImageUrl ?? "",
      tenantId: dto.tenantId,
      tenantCode: dto.tenantCode,
      expiresAt: dto.expiresAt,
    });
  }

  /**
   * Transforms custom field DTO to SetupCustomField domain entity.
   */
  static toCustomFieldEntity(dto: SetupCustomFieldDto): SetupCustomField {
    return new SetupCustomField({
      key: dto.key ?? "",
      labelEn: dto.labelEn ?? "",
      labelAr: dto.labelAr,
      placeholderEn: dto.placeholderEn,
      placeholderAr: dto.placeholderAr,
      valueType: dto.valueType ?? "text",
      isRequired: Boolean(dto.isRequired),
      sensitivity: dto.sensitivity ?? 0,
      options: dto.options,
      optionsAr: dto.optionsAr,
      sortOrder: dto.sortOrder ?? 0,
      currentValue: dto.currentValue,
    });
  }

  /**
   * Transforms account activation outcome DTO to AccountActivationResult domain entity.
   */
  static toActivationResultEntity(dto: ActivateAccountResponse): AccountActivationResult {
    return new AccountActivationResult({
      success: Boolean(dto.success),
      adminUsername: dto.adminUsername ?? "",
      tenantName: dto.tenantName ?? "",
      errorMessage: dto.errorMessage,
    });
  }
}
