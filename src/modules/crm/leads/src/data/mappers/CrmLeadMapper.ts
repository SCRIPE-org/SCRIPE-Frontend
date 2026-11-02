/**
 * CRM Lead Data Mapper
 * Converts between raw DTO formats and domain entities.
 */

import { LeadEntity, type CrmLead } from "../../domain/entities/LeadEntity";

/**
 * Mapper for converting Lead DTOs to Domain Entities.
 */
export class CrmLeadMapper {
  /**
   * Convert DTO to Domain Entity
   */
  static toEntity(dto: CrmLead): LeadEntity {
    return new LeadEntity({
      ...dto,
      title: dto.title ?? "",
      status: dto.status ?? "New",
      currency: dto.currency ?? "SAR",
    });
  }
}
