/**
 * StaffCompetency Mapper
 *
 * Converts between StaffCompetencyModel (DTO) and StaffCompetency (Entity).
 * Repository uses this to transform service responses.
 */
import { StaffCompetency, type StaffCompetencyData } from "../../domain/entities/StaffCompetency";
import { StaffCompetencyModel, type StaffCompetencyJson } from "../models/StaffCompetencyModel";

/**
 * Documentation for module export
 */
export class StaffCompetencyMapper {
  /**
   * Convert StaffCompetencyModel to StaffCompetency Entity
   */
  static toEntity(model: StaffCompetencyModel): StaffCompetency {
    const data: StaffCompetencyData = {
      id: model.id,
      staffMemberId: model.staffMemberId,
      competencyName: model.competencyName,
      level: model.level,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new StaffCompetency(data);
  }

  /**
   * Convert StaffCompetency Entity to StaffCompetencyModel
   */
  static toModel(entity: StaffCompetency): StaffCompetencyModel {
    return new StaffCompetencyModel(
      entity.id,
      entity.staffMemberId,
      entity.competencyName,
      entity.level,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert StaffCompetencyJson (raw API) to StaffCompetency Entity
   */
  static fromJsonToEntity(json: StaffCompetencyJson): StaffCompetency {
    const model = StaffCompetencyModel.fromJson(json);
    return StaffCompetencyMapper.toEntity(model);
  }
}
