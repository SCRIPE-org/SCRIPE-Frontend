/**
* PartyRole Mapper
*
* Converts between PartyRoleModel (DTO) and PartyRole (Entity).
* Repository uses this to transform service responses.
*/
import { PartyRole, type PartyRoleData } from "../../domain/entities/PartyRole";
import { PartyRoleModel, type PartyRoleJson } from "../models/PartyRoleModel";

export class PartyRoleMapper {
/**
* Convert PartyRoleModel to PartyRole Entity
*/
static toEntity(model: PartyRoleModel): PartyRole {
const data: PartyRoleData = {
id: model.id,
partyId: model.partyId,
roleType: model.roleType,
createdAt: model.createdAt,
modifiedAt: model.modifiedAt,
};
return new PartyRole(data);
}

/**
* Convert PartyRole Entity to PartyRoleModel
*/
static toModel(entity: PartyRole): PartyRoleModel {
return new PartyRoleModel(
entity.id,
entity.partyId,
entity.roleType,
entity.createdAt,
entity.modifiedAt,
);
}

/**
* Convert PartyRoleJson (raw API) to PartyRole Entity
*/
static fromJsonToEntity(json: PartyRoleJson): PartyRole {
const model = PartyRoleModel.fromJson(json);
return PartyRoleMapper.toEntity(model);
}
}