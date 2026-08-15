/**
 * StaffAvailability Mapper
 *
 * Converts between StaffAvailabilityModel (DTO) and StaffAvailability (Entity).
 * Repository uses this to transform service responses.
 */
import {
  StaffAvailability,
  type StaffAvailabilityData,
} from "../../domain/entities/StaffAvailability";
import {
  StaffAvailabilityModel,
  type StaffAvailabilityJson,
} from "../models/StaffAvailabilityModel";

export class StaffAvailabilityMapper {
  /**
   * Convert StaffAvailabilityModel to StaffAvailability Entity
   */
  static toEntity(model: StaffAvailabilityModel): StaffAvailability {
    const data: StaffAvailabilityData = {
      id: model.id,
      staffMemberId: model.staffMemberId,
      dayOfWeek: model.dayOfWeek,
      startTime: model.startTime,
      endTime: model.endTime,
      isAvailable: model.isAvailable,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new StaffAvailability(data);
  }

  /**
   * Convert StaffAvailability Entity to StaffAvailabilityModel
   */
  static toModel(entity: StaffAvailability): StaffAvailabilityModel {
    return new StaffAvailabilityModel(
      entity.id,
      entity.staffMemberId,
      entity.dayOfWeek,
      entity.startTime,
      entity.endTime,
      entity.isAvailable,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert StaffAvailabilityJson (raw API) to StaffAvailability Entity
   */
  static fromJsonToEntity(json: StaffAvailabilityJson): StaffAvailability {
    const model = StaffAvailabilityModel.fromJson(json);
    return StaffAvailabilityMapper.toEntity(model);
  }
}
