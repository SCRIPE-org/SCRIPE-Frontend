/**
 * Marketplace Mapper
 *
 * Converts between MarketplaceModel (DTO) and Marketplace (Entity).
 * Repository uses this to transform service responses.
 */
import { Marketplace, type MarketplaceData } from "../../domain/entities/Marketplace";
import { MarketplaceModel, type MarketplaceJson } from "../models/MarketplaceModel";

export class MarketplaceMapper {
  /**
   * Convert MarketplaceModel to Marketplace Entity
   */
  static toEntity(model: MarketplaceModel): Marketplace {
    const data: MarketplaceData = {
      id: model.id,
      name: model.name,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new Marketplace(data);
  }

  /**
   * Convert Marketplace Entity to MarketplaceModel
   */
  static toModel(entity: Marketplace): MarketplaceModel {
    return new MarketplaceModel(
      entity.id,
      entity.name,
      entity.createdAt,
      entity.modifiedAt,
    );
  }

  /**
   * Convert MarketplaceJson (raw API) to Marketplace Entity
   */
  static fromJsonToEntity(json: MarketplaceJson): Marketplace {
    const model = MarketplaceModel.fromJson(json);
    return MarketplaceMapper.toEntity(model);
  }
}
