/**
 * PartyOrganization Mapper
 *
 * Converts between PartyOrganizationModel (DTO) and PartyOrganization (Entity).
 * Repository uses this to transform service responses.
 */
import {
  PartyOrganization,
  type PartyOrganizationData,
} from "../../domain/entities/PartyOrganization";
import {
  PartyOrganizationModel,
  type PartyOrganizationJson,
} from "../models/PartyOrganizationModel";

/**
 * Documentation for module export
 */
export class PartyOrganizationMapper {
  /**
   * Convert PartyOrganizationModel to PartyOrganization Entity
   */
  static toEntity(model: PartyOrganizationModel): PartyOrganization {
    const data: PartyOrganizationData = {
      id: model.id,
      partyId: model.partyId,
      legalName: model.legalName,
      taxId: model.taxId,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new PartyOrganization(data);
  }

  /**
   * Convert PartyOrganization Entity to PartyOrganizationModel
   */
  static toModel(entity: PartyOrganization): PartyOrganizationModel {
    return new PartyOrganizationModel(
      entity.id,
      entity.partyId,
      entity.legalName,
      entity.taxId,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert PartyOrganizationJson (raw API) to PartyOrganization Entity
   */
  static fromJsonToEntity(json: PartyOrganizationJson): PartyOrganization {
    const model = PartyOrganizationModel.fromJson(json);
    return PartyOrganizationMapper.toEntity(model);
  }
}
