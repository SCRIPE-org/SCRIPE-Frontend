/**
 * StaffMember Mapper
 *
 * Converts between StaffMemberModel (DTO) and StaffMember (Entity).
 * Repository uses this to transform service responses.
 */
import { StaffMember, type StaffMemberData } from "../../domain/entities/StaffMember";
import { StaffMemberModel, type StaffMemberJson } from "../models/StaffMemberModel";

/**
 * Documentation for module export
 */
export class StaffMemberMapper {
  /**
   * Convert StaffMemberModel to StaffMember Entity
   */
  static toEntity(model: StaffMemberModel): StaffMember {
    const data: StaffMemberData = {
      id: model.id,
      identityUserId: model.identityUserId,
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      jobTitle: model.jobTitle,
      isActive: model.isActive,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new StaffMember(data);
  }

  /**
   * Convert StaffMember Entity to StaffMemberModel
   */
  static toModel(entity: StaffMember): StaffMemberModel {
    return new StaffMemberModel(
      entity.id,
      entity.identityUserId,
      entity.firstName,
      entity.lastName,
      entity.email,
      entity.jobTitle,
      entity.isActive,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert StaffMemberJson (raw API) to StaffMember Entity
   */
  static fromJsonToEntity(json: StaffMemberJson): StaffMember {
    const model = StaffMemberModel.fromJson(json);
    return StaffMemberMapper.toEntity(model);
  }
}
