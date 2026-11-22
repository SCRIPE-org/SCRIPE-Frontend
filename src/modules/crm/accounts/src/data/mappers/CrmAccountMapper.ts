/**
 * CRM Account Data Mapper
 * Converts between raw DTO formats and domain entities.
 */

import { AccountEntity, type CrmAccount } from "../../domain/entities/AccountEntity";

/**
 * Mapper for converting Account DTOs to Domain Entities.
 */
export class CrmAccountMapper {
  /**
   * Convert DTO to Domain Entity
   */
  static toEntity(dto: CrmAccount): AccountEntity {
    return new AccountEntity({
      ...dto,
      partyLegalNameEn: dto.partyLegalNameEn ?? "",
      preferredCurrencyCode: dto.preferredCurrencyCode ?? "SAR",
      linkedContactsCount: dto.linkedContactsCount ?? 0,
      activeOpportunitiesCount: dto.activeOpportunitiesCount ?? 0,
    });
  }
}
