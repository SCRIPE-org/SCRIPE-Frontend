/**
 * CustomFieldValue Mapper (Clean Architecture Data Layer)
 * Maps raw custom field value responses to domain representations.
 */
import type {
  EntityCustomFieldValueData,
  CustomFieldColumnData,
  BulkEntityCustomFieldValuesData,
} from "../../domain/entities/CustomFieldValue";

/**
 * Maps custom field value DTOs to domain models.
 */
export class CustomFieldValueMapper {
  /**
   * Maps an entity custom field value DTO to its domain representation.
   */
  static toEntity(dto: EntityCustomFieldValueData): EntityCustomFieldValueData {
    return {
      customFieldId: dto.customFieldId,
      key: dto.key,
      labelEn: dto.labelEn ?? "",
      labelAr: dto.labelAr ?? null,
      placeholderEn: dto.placeholderEn ?? null,
      placeholderAr: dto.placeholderAr ?? null,
      valueType: dto.valueType,
      isRequired: Boolean(dto.isRequired),
      options: dto.options ?? null,
      sortOrder: dto.sortOrder ?? 0,
      value: dto.value ?? null,
      hiddenByRule: Boolean(dto.hiddenByRule),
    };
  }

  /**
   * Maps a custom field column DTO to its domain representation.
   */
  static toColumnEntity(dto: CustomFieldColumnData): CustomFieldColumnData {
    return {
      customFieldId: dto.customFieldId,
      key: dto.key,
      labelEn: dto.labelEn ?? "",
      labelAr: dto.labelAr ?? null,
      valueType: dto.valueType,
      options: dto.options ?? null,
      sortOrder: dto.sortOrder ?? 0,
    };
  }

  /**
   * Maps bulk custom field values DTO to its domain representation.
   */
  static toBulkEntity(dto: BulkEntityCustomFieldValuesData): BulkEntityCustomFieldValuesData {
    return {
      columns: (dto.columns ?? []).map(CustomFieldValueMapper.toColumnEntity),
      valuesByOwnerId: dto.valuesByOwnerId ?? {},
      hiddenKeysByOwnerId: dto.hiddenKeysByOwnerId ?? null,
    };
  }
}
