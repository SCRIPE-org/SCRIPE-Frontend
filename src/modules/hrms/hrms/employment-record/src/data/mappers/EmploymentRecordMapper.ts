/**
 * EmploymentRecord Mapper
 *
 * Converts between EmploymentRecordModel (DTO) and EmploymentRecord (Entity).
 * Repository uses this to transform service responses.
 */
import {
  EmploymentRecord,
  type EmploymentRecordData,
} from "../../domain/entities/EmploymentRecord";
import { EmploymentRecordModel, type EmploymentRecordJson } from "../models/EmploymentRecordModel";

export class EmploymentRecordMapper {
  /**
   * Convert EmploymentRecordModel to EmploymentRecord Entity
   */
  static toEntity(model: EmploymentRecordModel): EmploymentRecord {
    const data: EmploymentRecordData = {
      id: model.id,
      staffMemberId: model.staffMemberId,
      employmentType: model.employmentType,
      startDate: model.startDate,
      endDate: model.endDate,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new EmploymentRecord(data);
  }

  /**
   * Convert EmploymentRecord Entity to EmploymentRecordModel
   */
  static toModel(entity: EmploymentRecord): EmploymentRecordModel {
    return new EmploymentRecordModel(
      entity.id,
      entity.staffMemberId,
      entity.employmentType,
      entity.startDate,
      entity.endDate,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert EmploymentRecordJson (raw API) to EmploymentRecord Entity
   */
  static fromJsonToEntity(json: EmploymentRecordJson): EmploymentRecord {
    const model = EmploymentRecordModel.fromJson(json);
    return EmploymentRecordMapper.toEntity(model);
  }
}
