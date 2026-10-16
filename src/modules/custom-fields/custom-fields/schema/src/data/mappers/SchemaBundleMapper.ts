/**
 * SchemaBundle Mapper
 *
 * Converts between SchemaBundleModel (DTO) and SchemaBundle (Entity). The repository uses it on the
 * way in; the view model uses `toModel` on the way OUT, to build the file that gets downloaded.
 *
 * BOTH DIRECTIONS ARE ON THE HOT PATH, WHICH IS UNUSUAL AND MATTERS
 * ----------------------------------------------------------------
 * In every other CustomFields submodule `toModel` exists for symmetry and is barely used. Here the
 * exported file IS `toModel(entity).toJson()`, so a property this mapper forgets does not merely
 * come back undefined in the UI — it is MISSING FROM THE FILE, and the loss surfaces only when
 * someone re-imports the bundle into another environment and finds their validators gone.
 *
 * That is exactly the defect class `CustomFieldMapper` shipped with `optionsAr`: added to the model,
 * the JSON shape and the entity, never mapped here, so it came back undefined after every round
 * trip. `SchemaBundleMapper.test.ts` therefore pins a FULL round trip — json -> entity -> json —
 * against a fixture in which every nullable field is populated, so a dropped property fails rather
 * than looking like a null the server never sent.
 */
import {
  SchemaBundle,
  type SchemaBundleData,
  type SchemaDefinitionData,
  type SchemaGroupData,
} from "../../domain/entities/SchemaBundle";
import {
  SchemaBundleModel,
  SchemaDefinitionModel,
  SchemaGroupModel,
  type SchemaBundleJson,
} from "../models/SchemaBundleModel";

/**
 * Documentation for module export
 */
export class SchemaBundleMapper {
  /** Convert a SchemaBundleModel to a SchemaBundle entity. */
  static toEntity(model: SchemaBundleModel): SchemaBundle {
    const data: SchemaBundleData = {
      formatVersion: model.formatVersion,
      entityTypeKey: model.entityTypeKey,
      groups: model.groups.map((group) => SchemaBundleMapper.groupToData(group)),
      definitions: model.definitions.map((definition) =>
        SchemaBundleMapper.definitionToData(definition)
      ),
    };
    return new SchemaBundle(data);
  }

  /** Convert a SchemaBundle entity back to a SchemaBundleModel. */
  static toModel(entity: SchemaBundle): SchemaBundleModel {
    return new SchemaBundleModel({
      formatVersion: entity.formatVersion,
      entityTypeKey: entity.entityTypeKey,
      groups: entity.groups.map((group) => new SchemaGroupModel(group)),
      definitions: entity.definitions.map((definition) => new SchemaDefinitionModel(definition)),
    });
  }

  /** Convert raw API JSON straight to a SchemaBundle entity. */
  static fromJsonToEntity(json: SchemaBundleJson): SchemaBundle {
    return SchemaBundleMapper.toEntity(SchemaBundleModel.fromJson(json));
  }

  /**
   * One group, model -> data.
   *
   * Spelled out property by property rather than spread, so adding a member to `SchemaGroupData`
   * without mapping it is a compile error instead of a silently absent key in the exported file.
   */
  private static groupToData(model: SchemaGroupModel): SchemaGroupData {
    return {
      entityTypeKey: model.entityTypeKey,
      stableKey: model.stableKey,
      labelEn: model.labelEn,
      labelAr: model.labelAr,
      sortOrder: model.sortOrder,
      isGlobal: model.isGlobal,
    };
  }

  /** One definition, model -> data. Same explicit-property rule as `groupToData`. */
  private static definitionToData(model: SchemaDefinitionModel): SchemaDefinitionData {
    return {
      entityTypeKey: model.entityTypeKey,
      key: model.key,
      labelEn: model.labelEn,
      labelAr: model.labelAr,
      placeholderEn: model.placeholderEn,
      placeholderAr: model.placeholderAr,
      valueType: model.valueType,
      isRequired: model.isRequired,
      isActive: model.isActive,
      sortOrder: model.sortOrder,
      options: model.options,
      optionsAr: model.optionsAr,
      validatorKind: model.validatorKind,
      validatorParam: model.validatorParam,
      sensitivity: model.sensitivity,
      isExportable: model.isExportable,
      groupStableKey: model.groupStableKey,
      isGlobal: model.isGlobal,
      referenceTargetEntityTypeKey: model.referenceTargetEntityTypeKey,
    };
  }
}
