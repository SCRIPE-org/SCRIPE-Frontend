/**
 * CustomField Mapper
 *
 * Converts between CustomFieldModel (DTO) and CustomField (Entity).
 * Repository uses this to transform service responses.
 */
import { CustomField, type CustomFieldData } from "../../domain/entities/CustomField";
import { CustomFieldModel, type CustomFieldJson } from "../models/CustomFieldModel";

export class CustomFieldMapper {
  /**
   * Convert CustomFieldModel to CustomField Entity
   */
  static toEntity(model: CustomFieldModel): CustomField {
    const data: CustomFieldData = {
      id: model.id,
      entityTypeKey: model.entityTypeKey,
      key: model.key,
      labelEn: model.labelEn,
      labelAr: model.labelAr,
      valueType: model.valueType,
      isRequired: model.isRequired,
      options: model.options,
      sortOrder: model.sortOrder,
      isActive: model.isActive,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new CustomField(data);
  }

  /**
   * Convert CustomField Entity to CustomFieldModel
   */
  static toModel(entity: CustomField): CustomFieldModel {
    return new CustomFieldModel(
      entity.id,
      entity.entityTypeKey,
      entity.key,
      entity.labelEn,
      entity.valueType,
      entity.isRequired,
      entity.sortOrder,
      entity.isActive,
      entity.createdAt,
      entity.labelAr,
      entity.options,
      entity.modifiedAt
    );
  }

  /**
   * Convert CustomFieldJson (raw API) to CustomField Entity
   */
  static fromJsonToEntity(json: CustomFieldJson): CustomField {
    const model = CustomFieldModel.fromJson(json);
    return CustomFieldMapper.toEntity(model);
  }
}
