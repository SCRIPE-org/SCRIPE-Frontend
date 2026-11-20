/**
 * CRM Lead Data Mapper
 * Converts between raw DTO formats and domain entities.
 */

import { LeadEntity, type CrmLead } from "../../domain/entities/LeadEntity";

const STATUS_TO_STAGE_KEY: Record<string, string> = {
  New: "lead.new",
  Working: "lead.working",
  Qualified: "lead.qualified",
  Converted: "lead.converted",
  Disqualified: "lead.disqualified",
};

/**
 * Mapper for converting Lead DTOs to Domain Entities.
 */
export class CrmLeadMapper {
  /**
   * Convert DTO to Domain Entity
   */
  static toEntity(dto: CrmLead): LeadEntity {
    const stageKey =
      dto.stageKey && dto.stageKey.trim() !== ""
        ? dto.stageKey
        : (STATUS_TO_STAGE_KEY[dto.status] ?? "lead.new");

    return new LeadEntity({
      ...dto,
      stageKey,
      title: dto.title ?? "",
      status: dto.status ?? "New",
      currency: dto.currency ?? "SAR",
    });
  }
}
