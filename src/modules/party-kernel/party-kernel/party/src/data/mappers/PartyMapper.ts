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
      fullName: model.fullName ?? null,
      legalName: model.legalName ?? null,
      primaryPhone: model.primaryPhone ?? null,
      primaryEmail: model.primaryEmail ?? null,
      roles: model.roles ?? undefined,
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
      entity.modifiedAt,
      entity.fullName,
      entity.legalName,
      entity.primaryPhone,
      entity.primaryEmail,
      entity.roles
    );
  }

  /**
   * Convert PartyJson (raw API) to Party Entity
   */
  static fromJsonToEntity(json: PartyJson): Party {
    const model = PartyModel.fromJson(json);
    return PartyMapper.toEntity(model);
  }

  /**
   * Convert PartyContactLookupResponseJson (API lookup DTO) to PartyContactLookup domain entity
   */
  static toContactLookup(
    dto: import("../models/PartyModel").PartyContactLookupResponseJson
  ): import("../../domain/entities/Party").PartyContactLookup {
    return {
      id: dto.id,
      type: (dto.type === "Person" || dto.type?.toLowerCase() === "person") ? "Person" : "Organization",
      displayName: dto.displayName ?? "",
      fullName: dto.fullName ?? null,
      legalName: dto.legalName ?? null,
    };
  }
}
