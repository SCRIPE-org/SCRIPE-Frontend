/**
 * PartyPerson Mapper
 *
 * Converts between PartyPersonModel (DTO) and PartyPerson (Entity).
 * Repository uses this to transform service responses.
 */
import { PartyPerson, type PartyPersonData } from "../../domain/entities/PartyPerson";
import { PartyPersonModel, type PartyPersonJson } from "../models/PartyPersonModel";

export class PartyPersonMapper {
  /**
   * Convert PartyPersonModel to PartyPerson Entity
   */
  static toEntity(model: PartyPersonModel): PartyPerson {
    const data: PartyPersonData = {
      id: model.id,
      partyId: model.partyId,
      firstName: model.firstName,
      lastName: model.lastName,
      isMinor: model.isMinor,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new PartyPerson(data);
  }

  /**
   * Convert PartyPerson Entity to PartyPersonModel
   */
  static toModel(entity: PartyPerson): PartyPersonModel {
    return new PartyPersonModel(
      entity.id,
      entity.partyId,
      entity.firstName,
      entity.lastName,
      entity.isMinor,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert PartyPersonJson (raw API) to PartyPerson Entity
   */
  static fromJsonToEntity(json: PartyPersonJson): PartyPerson {
    const model = PartyPersonModel.fromJson(json);
    return PartyPersonMapper.toEntity(model);
  }
}
