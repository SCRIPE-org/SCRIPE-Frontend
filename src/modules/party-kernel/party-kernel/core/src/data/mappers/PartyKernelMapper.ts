/**
 * PartyKernel Mapper
 *
 * Converts between PartyKernelModel (DTO) and PartyKernel (Entity).
 * Repository uses this to transform service responses.
 */
import { PartyKernel, type PartyKernelData } from "../../domain/entities/PartyKernel";
import { PartyKernelModel, type PartyKernelJson } from "../models/PartyKernelModel";

export class PartyKernelMapper {
  /**
   * Convert PartyKernelModel to PartyKernel Entity
   */
  static toEntity(model: PartyKernelModel): PartyKernel {
    const data: PartyKernelData = {
      id: model.id,
      name: model.name,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new PartyKernel(data);
  }

  /**
   * Convert PartyKernel Entity to PartyKernelModel
   */
  static toModel(entity: PartyKernel): PartyKernelModel {
    return new PartyKernelModel(entity.id, entity.name, entity.createdAt, entity.modifiedAt);
  }

  /**
   * Convert PartyKernelJson (raw API) to PartyKernel Entity
   */
  static fromJsonToEntity(json: PartyKernelJson): PartyKernel {
    const model = PartyKernelModel.fromJson(json);
    return PartyKernelMapper.toEntity(model);
  }
}
