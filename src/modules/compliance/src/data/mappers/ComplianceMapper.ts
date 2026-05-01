/**
 * Compliance Mapper
 *
 * Converts between ComplianceModel (DTO) and Compliance (Entity).
 * Repository uses this to transform service responses.
 */
import { Compliance, type ComplianceData } from "../../domain/entities/Compliance";
import { ComplianceModel, type ComplianceJson } from "../models/ComplianceModel";

export class ComplianceMapper {
  /**
   * Convert ComplianceModel to Compliance Entity
   */
  static toEntity(model: ComplianceModel): Compliance {
    const data: ComplianceData = {
      id: model.id,
      name: model.name,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new Compliance(data);
  }

  /**
   * Convert Compliance Entity to ComplianceModel
   */
  static toModel(entity: Compliance): ComplianceModel {
    return new ComplianceModel(
      entity.id,
      entity.name,
      entity.createdAt,
      entity.modifiedAt,
    );
  }

  /**
   * Convert ComplianceJson (raw API) to Compliance Entity
   */
  static fromJsonToEntity(json: ComplianceJson): Compliance {
    const model = ComplianceModel.fromJson(json);
    return ComplianceMapper.toEntity(model);
  }
}
