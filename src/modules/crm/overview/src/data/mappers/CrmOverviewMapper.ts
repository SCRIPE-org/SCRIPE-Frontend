/**
 * CRM Overview Data Mapper
 * Converts between raw DTO formats and domain entities.
 */

import { OverviewEntity, type CrmOverviewData } from "../../domain/entities/OverviewEntity";

/**
 * Mapper for converting Overview DTOs to Domain Entities.
 */
export class CrmOverviewMapper {
  /**
   * Convert DTO to Domain Entity
   */
  static toEntity(dto: CrmOverviewData): OverviewEntity {
    return new OverviewEntity(dto);
  }
}
