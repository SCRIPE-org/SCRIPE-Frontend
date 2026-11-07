/**
 * CRM Contact Data Mapper
 * Converts between raw DTO formats and domain entities.
 */

import { ContactEntity, type CrmContact } from "../../domain/entities/ContactEntity";

/**
 * Mapper for converting Contact DTOs to Domain Entities.
 */
export class CrmContactMapper {
  /**
   * Convert DTO to Domain Entity
   */
  static toEntity(dto: CrmContact): ContactEntity {
    return new ContactEntity({
      ...dto,
      personLegalNameEn: dto.personLegalNameEn ?? "",
    });
  }
}
