/**
* PartyRelationship Mapper
*
* Converts between PartyRelationshipModel (DTO) and PartyRelationship (Entity).
* Repository uses this to transform service responses.
*/
import { PartyRelationship, type PartyRelationshipData } from "../../domain/entities/PartyRelationship";
import { PartyRelationshipModel, type PartyRelationshipJson } from "../models/PartyRelationshipModel";

export class PartyRelationshipMapper {
/**
* Convert PartyRelationshipModel to PartyRelationship Entity
*/
static toEntity(model: PartyRelationshipModel): PartyRelationship {
const data: PartyRelationshipData = {
id: model.id,
sourcePartyId: model.sourcePartyId,
targetPartyId: model.targetPartyId,
relationshipType: model.relationshipType,
createdAt: model.createdAt,
modifiedAt: model.modifiedAt,
};
return new PartyRelationship(data);
}

/**
* Convert PartyRelationship Entity to PartyRelationshipModel
*/
static toModel(entity: PartyRelationship): PartyRelationshipModel {
return new PartyRelationshipModel(
entity.id,
entity.sourcePartyId,
entity.targetPartyId,
entity.relationshipType,
entity.createdAt,
entity.modifiedAt,
);
}

/**
* Convert PartyRelationshipJson (raw API) to PartyRelationship Entity
*/
static fromJsonToEntity(json: PartyRelationshipJson): PartyRelationship {
const model = PartyRelationshipModel.fromJson(json);
return PartyRelationshipMapper.toEntity(model);
}
}