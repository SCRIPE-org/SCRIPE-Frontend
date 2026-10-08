/**
 * StaffAssignment Mapper
 *
 * Converts between StaffAssignmentModel (DTO) and StaffAssignment (Entity).
 * Repository uses this to transform service responses.
 */
import { StaffAssignment, type StaffAssignmentData } from "../../domain/entities/StaffAssignment";
import { StaffAssignmentModel, type StaffAssignmentJson } from "../models/StaffAssignmentModel";

/**
 * Documentation for module export
 */
export class StaffAssignmentMapper {
  /**
   * Convert StaffAssignmentModel to StaffAssignment Entity
   */
  static toEntity(model: StaffAssignmentModel): StaffAssignment {
    const data: StaffAssignmentData = {
      id: model.id,
      staffMemberId: model.staffMemberId,
      organizationUnitId: model.organizationUnitId,
      assignmentType: model.assignmentType,
      validFrom: model.validFrom,
      validTo: model.validTo,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new StaffAssignment(data);
  }

  /**
   * Convert StaffAssignment Entity to StaffAssignmentModel
   */
  static toModel(entity: StaffAssignment): StaffAssignmentModel {
    return new StaffAssignmentModel(
      entity.id,
      entity.staffMemberId,
      entity.organizationUnitId,
      entity.assignmentType,
      entity.validFrom,
      entity.validTo,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert StaffAssignmentJson (raw API) to StaffAssignment Entity
   */
  static fromJsonToEntity(json: StaffAssignmentJson): StaffAssignment {
    const model = StaffAssignmentModel.fromJson(json);
    return StaffAssignmentMapper.toEntity(model);
  }
}
