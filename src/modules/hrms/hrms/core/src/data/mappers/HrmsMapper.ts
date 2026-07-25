/**
 * Hrms Mapper
 *
 * Converts between HrmsModel (DTO) and Hrms (Entity).
 * Repository uses this to transform service responses.
 */
import { Hrms, type HrmsData } from "../../domain/entities/Hrms";
import { HrmsModel, type HrmsJson } from "../models/HrmsModel";

export class HrmsMapper {
  /**
   * Convert HrmsModel to Hrms Entity
   */
  static toEntity(model: HrmsModel): Hrms {
    const data: HrmsData = {
      id: model.id,
      name: model.name,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new Hrms(data);
  }

  /**
   * Convert Hrms Entity to HrmsModel
   */
  static toModel(entity: Hrms): HrmsModel {
    return new HrmsModel(entity.id, entity.name, entity.createdAt, entity.modifiedAt);
  }

  /**
   * Convert HrmsJson (raw API) to Hrms Entity
   */
  static fromJsonToEntity(json: HrmsJson): Hrms {
    const model = HrmsModel.fromJson(json);
    return HrmsMapper.toEntity(model);
  }
}
