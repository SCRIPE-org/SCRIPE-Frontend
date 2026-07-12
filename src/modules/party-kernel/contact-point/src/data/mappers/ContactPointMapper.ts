/**
* ContactPoint Mapper
*
* Converts between ContactPointModel (DTO) and ContactPoint (Entity).
* Repository uses this to transform service responses.
*/
import { ContactPoint, type ContactPointData } from "../../domain/entities/ContactPoint";
import { ContactPointModel, type ContactPointJson } from "../models/ContactPointModel";

export class ContactPointMapper {
/**
* Convert ContactPointModel to ContactPoint Entity
*/
static toEntity(model: ContactPointModel): ContactPoint {
const data: ContactPointData = {
id: model.id,
partyId: model.partyId,
type: model.type,
value: model.value,
isPrimary: model.isPrimary,
createdAt: model.createdAt,
modifiedAt: model.modifiedAt,
};
return new ContactPoint(data);
}

/**
* Convert ContactPoint Entity to ContactPointModel
*/
static toModel(entity: ContactPoint): ContactPointModel {
return new ContactPointModel(
entity.id,
entity.partyId,
entity.type,
entity.value,
entity.isPrimary,
entity.createdAt,
entity.modifiedAt,
);
}

/**
* Convert ContactPointJson (raw API) to ContactPoint Entity
*/
static fromJsonToEntity(json: ContactPointJson): ContactPoint {
const model = ContactPointModel.fromJson(json);
return ContactPointMapper.toEntity(model);
}
}