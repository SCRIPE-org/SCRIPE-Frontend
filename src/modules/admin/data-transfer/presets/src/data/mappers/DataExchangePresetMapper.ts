import { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import type { DataExchangePresetModel } from "../models/DataExchangePresetModel";

/**
 * Pure mapper between DataExchangePresetModel and DataExchangePreset domain entity.
 */
export class DataExchangePresetMapper {
  /**
   * Maps an API model to a domain entity.
   */
  static toDomain(model: DataExchangePresetModel): DataExchangePreset {
    return new DataExchangePreset({
      id: model.id,
      entityKey: model.entityKey,
      name: model.name,
      importMode: model.importMode,
      mappings: model.mappings ?? [],
      isDefault: model.isDefault ?? false,
      createdAt: model.createdAt,
    });
  }

  /**
   * Maps a domain entity to an API model.
   */
  static toModel(entity: DataExchangePreset): DataExchangePresetModel {
    return {
      id: entity.id,
      entityKey: entity.entityKey,
      name: entity.name,
      importMode: entity.importMode,
      mappings: entity.mappings,
      isDefault: entity.isDefault,
      createdAt: entity.createdAt,
    };
  }
}
