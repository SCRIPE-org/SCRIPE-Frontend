/**
 * EntityLookup Mapper (Clean Architecture Data Layer)
 * Maps wire models to domain entity types.
 */
import type { EntityLookupItem, EntityLookupType } from "../../domain/entities/EntityLookup";

/**
 * Maps raw entity lookup models to domain representations.
 */
export class EntityLookupMapper {
  /**
   * Maps an entity lookup item DTO to its domain entity representation.
   */
  static toEntity(dto: EntityLookupItem): EntityLookupItem {
    return {
      id: dto.id,
      displayName: dto.displayName ?? "",
      secondary: dto.secondary ?? null,
      isActive: Boolean(dto.isActive),
    };
  }

  /**
   * Maps an entity lookup type DTO to its domain entity representation.
   */
  static toTypeEntity(dto: EntityLookupType): EntityLookupType {
    return {
      key: dto.key,
      owningModule: dto.owningModule ?? "",
      displayNameEn: dto.displayNameEn ?? "",
      displayNameAr: dto.displayNameAr ?? "",
    };
  }
}
