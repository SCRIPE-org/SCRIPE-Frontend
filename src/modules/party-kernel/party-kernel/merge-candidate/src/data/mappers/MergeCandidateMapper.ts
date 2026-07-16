/**
* MergeCandidate Mapper
*
* Converts between MergeCandidateModel (DTO) and MergeCandidate (Entity).
* Repository uses this to transform service responses.
*/
import { MergeCandidate, type MergeCandidateData } from "../../domain/entities/MergeCandidate";
import { MergeCandidateModel, type MergeCandidateJson } from "../models/MergeCandidateModel";

export class MergeCandidateMapper {
/**
* Convert MergeCandidateModel to MergeCandidate Entity
*/
static toEntity(model: MergeCandidateModel): MergeCandidate {
const data: MergeCandidateData = {
id: model.id,
primaryPartyId: model.primaryPartyId,
duplicatePartyId: model.duplicatePartyId,
status: model.status,
reason: model.reason,
createdAt: model.createdAt,
modifiedAt: model.modifiedAt,
};
return new MergeCandidate(data);
}

/**
* Convert MergeCandidate Entity to MergeCandidateModel
*/
static toModel(entity: MergeCandidate): MergeCandidateModel {
return new MergeCandidateModel(
entity.id,
entity.primaryPartyId,
entity.duplicatePartyId,
entity.status,
entity.reason,
entity.createdAt,
entity.modifiedAt,
);
}

/**
* Convert MergeCandidateJson (raw API) to MergeCandidate Entity
*/
static fromJsonToEntity(json: MergeCandidateJson): MergeCandidate {
const model = MergeCandidateModel.fromJson(json);
return MergeCandidateMapper.toEntity(model);
}
}