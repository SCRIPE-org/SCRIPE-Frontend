/**
 * Party Mapper
 *
 * Converts between PartyModel (DTO) and Party (Entity).
 * Repository uses this to transform service responses.
 */
import { Party, type PartyData } from "../../domain/entities/Party";
import { PartyModel, type PartyJson } from "../models/PartyModel";

/**
 * Documentation for module export
 */
export class PartyMapper {
  /**
   * Convert PartyModel to Party Entity
   */
  static toEntity(model: PartyModel): Party {
    const data: PartyData = {
      id: model.id,
      type: model.type,
      displayName: model.displayName,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new Party(data);
  }

  /**
   * Convert Party Entity to PartyModel
   */
  static toModel(entity: Party): PartyModel {
    return new PartyModel(
      entity.id,
      entity.type,
      entity.displayName,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert PartyJson (raw API) to Party Entity
   */
  static fromJsonToEntity(json: PartyJson): Party {
    const model = PartyModel.fromJson(json);
    return PartyMapper.toEntity(model);
  }
}
