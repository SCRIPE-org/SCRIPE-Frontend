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
      placeholderEn: model.placeholderEn,
      placeholderAr: model.placeholderAr,
      valueType: model.valueType,
      isRequired: model.isRequired,
      options: model.options,
      // optionsAr was added to the model, the JSON shape and the entity in the Wave 5
      // bilingual-options change but never mapped HERE, so entity.optionsAr came back undefined
      // after every round trip -- the edit form then seeded "" and cleared the Arabic labels on the
      // next save. Same dropped-property class as the backend controller's own OptionsAr bug.
      // customFieldMapper.completeness.test.ts now pins every CustomFieldData key against the model.
      optionsAr: model.optionsAr,
      sensitivity: model.sensitivity,
      isExportable: model.isExportable,
      sortOrder: model.sortOrder,
      isActive: model.isActive,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
      isGlobal: model.isGlobal,
      validatorKind: model.validatorKind,
      validatorParam: model.validatorParam,
      fieldGroupId: model.fieldGroupId,
      // Wave 4 follow-up. Copied here for the same reason optionsAr's omission above was a bug: the
      // edit form seeds from the ENTITY, so a column that does not survive this mapper arrives as
      // undefined, gets blanked to "" by the initial-values builder, and is written back as blank by
      // an update command that full-replaces every property. For this column that means an unrelated
      // rename silently UNPINS a field an admin deliberately pinned to one entity type.
      referenceTargetEntityTypeKey: model.referenceTargetEntityTypeKey,
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
      entity.optionsAr,
      entity.modifiedAt,
      entity.isGlobal,
      entity.placeholderEn,
      entity.placeholderAr,
      entity.validatorKind,
      entity.validatorParam,
      entity.fieldGroupId,
      entity.sensitivity,
      entity.isExportable,
      entity.referenceTargetEntityTypeKey
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
