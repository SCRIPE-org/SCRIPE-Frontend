/**
 * CustomField Model (DTO wrapper)
 *
 * Represents the API data transfer object for CustomField.
 * Used for service communication and mapped to domain entities.
 */

import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import type {
  ValidatorKindName,
  EntityTypeItemJson,
  CustomFieldJson,
  CustomFieldListItemJson,
  CustomFieldListResponseJson,
} from "./CustomFieldDto";

export type {
  ValidatorKindName,
  EntityTypeItemJson,
  CustomFieldJson,
  CustomFieldListItemJson,
  CustomFieldListResponseJson,
};

/**
 * CustomField Model class wrapping API responses and providing serialization helpers.
 */
export class CustomFieldModel {
  constructor(
    public readonly id: string,
    public readonly entityTypeKey: string,
    public readonly key: string,
    public readonly labelEn: string,
    public readonly valueType: CustomFieldValueTypeName,
    public readonly isRequired: boolean,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly labelAr?: string | null,
    public readonly options?: string | null,
    public readonly optionsAr?: string | null,
    public readonly modifiedAt?: string | null,
    public readonly isGlobal?: boolean,
    public readonly placeholderEn?: string | null,
    public readonly placeholderAr?: string | null,
    public readonly validatorKind?: string | null,
    public readonly validatorParam?: string | null,
    public readonly fieldGroupId?: string | null,
    public readonly sensitivity?: string | null,
    public readonly isExportable?: boolean | null,
    public readonly referenceTargetEntityTypeKey?: string | null
  ) {}

  /**
   * Constructs a CustomFieldModel instance from API detail JSON.
   */
  static fromJson(json: CustomFieldJson): CustomFieldModel {
    return new CustomFieldModel(
      json.id,
      json.entityTypeKey,
      json.key,
      json.labelEn,
      json.valueType,
      json.isRequired,
      json.sortOrder,
      json.isActive,
      json.createdAt,
      json.labelAr,
      json.options,
      json.optionsAr,
      json.modifiedAt,
      undefined,
      json.placeholderEn,
      json.placeholderAr,
      json.validatorKind,
      json.validatorParam,
      json.fieldGroupId,
      json.sensitivity,
      json.isExportable,
      json.referenceTargetEntityTypeKey
    );
  }

  /**
   * Constructs a CustomFieldModel instance from API list-row JSON.
   * Note: The list response omits detail fields such as options and placeholders.
   */
  static fromListJson(json: CustomFieldListItemJson): CustomFieldModel {
    return new CustomFieldModel(
      json.id,
      json.entityTypeKey,
      json.key,
      json.labelEn,
      json.valueType,
      json.isRequired,
      json.sortOrder,
      json.isActive,
      json.createdAt,
      json.labelAr,
      null,
      null,
      null,
      json.isGlobal
    );
  }

  /**
   * Converts the model instance to API JSON format.
   */
  toJson(): CustomFieldJson {
    return {
      id: this.id,
      entityTypeKey: this.entityTypeKey,
      key: this.key,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      placeholderEn: this.placeholderEn,
      placeholderAr: this.placeholderAr,
      valueType: this.valueType,
      isRequired: this.isRequired,
      options: this.options,
      optionsAr: this.optionsAr,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      validatorKind: this.validatorKind,
      validatorParam: this.validatorParam,
      fieldGroupId: this.fieldGroupId,
      sensitivity: this.sensitivity,
      isExportable: this.isExportable,
      referenceTargetEntityTypeKey: this.referenceTargetEntityTypeKey,
    };
  }
}
