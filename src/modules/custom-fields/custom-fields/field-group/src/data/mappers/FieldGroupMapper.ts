/**
 * FieldGroup Mapper
 *
 * Converts between FieldGroupModel (DTO) and FieldGroup (Entity).
 * The repository uses this to transform service responses.
 */
import { FieldGroup, type FieldGroupData } from "../../domain/entities/FieldGroup";
import { FieldGroupModel, type FieldGroupJson } from "../models/FieldGroupModel";

/**
 * Documentation for module export
 */
export class FieldGroupMapper {
  /** Convert a FieldGroupModel to a FieldGroup entity. */
  static toEntity(model: FieldGroupModel): FieldGroup {
    const data: FieldGroupData = {
      id: model.id,
      entityTypeKey: model.entityTypeKey,
      stableKey: model.stableKey,
      labelEn: model.labelEn,
      labelAr: model.labelAr,
      sortOrder: model.sortOrder,
      isGlobal: model.isGlobal,
    };
    return new FieldGroup(data);
  }

  /** Convert a FieldGroup entity back to a FieldGroupModel. */
  static toModel(entity: FieldGroup): FieldGroupModel {
    return new FieldGroupModel(
      entity.id,
      entity.entityTypeKey,
      entity.stableKey,
      entity.labelEn,
      entity.sortOrder,
      entity.isGlobal,
      entity.labelAr
    );
  }

  /** Convert raw API JSON straight to a FieldGroup entity. */
  static fromJsonToEntity(json: FieldGroupJson): FieldGroup {
    return FieldGroupMapper.toEntity(FieldGroupModel.fromJson(json));
  }
}
