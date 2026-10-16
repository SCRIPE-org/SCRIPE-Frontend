/**
 * Qualification Mapper
 *
 * Converts between QualificationModel (DTO) and Qualification (Entity).
 * Repository uses this to transform service responses.
 */
import { Qualification, type QualificationData } from "../../domain/entities/Qualification";
import { QualificationModel, type QualificationJson } from "../models/QualificationModel";

/**
 * Documentation for module export
 */
export class QualificationMapper {
  /**
   * Convert QualificationModel to Qualification Entity
   */
  static toEntity(model: QualificationModel): Qualification {
    const data: QualificationData = {
      id: model.id,
      staffMemberId: model.staffMemberId,
      title: model.title,
      institution: model.institution,
      awardedOn: model.awardedOn,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new Qualification(data);
  }

  /**
   * Convert Qualification Entity to QualificationModel
   */
  static toModel(entity: Qualification): QualificationModel {
    return new QualificationModel(
      entity.id,
      entity.staffMemberId,
      entity.title,
      entity.institution,
      entity.awardedOn,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert QualificationJson (raw API) to Qualification Entity
   */
  static fromJsonToEntity(json: QualificationJson): Qualification {
    const model = QualificationModel.fromJson(json);
    return QualificationMapper.toEntity(model);
  }
}
