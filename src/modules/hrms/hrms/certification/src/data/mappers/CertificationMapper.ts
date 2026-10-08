/**
 * Certification Mapper
 *
 * Converts between CertificationModel (DTO) and Certification (Entity).
 * Repository uses this to transform service responses.
 */
import { Certification, type CertificationData } from "../../domain/entities/Certification";
import { CertificationModel, type CertificationJson } from "../models/CertificationModel";

/**
 * Documentation for module export
 */
export class CertificationMapper {
  /**
   * Convert CertificationModel to Certification Entity
   */
  static toEntity(model: CertificationModel): Certification {
    const data: CertificationData = {
      id: model.id,
      staffMemberId: model.staffMemberId,
      name: model.name,
      issuer: model.issuer,
      issuedOn: model.issuedOn,
      expiresOn: model.expiresOn,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new Certification(data);
  }

  /**
   * Convert Certification Entity to CertificationModel
   */
  static toModel(entity: Certification): CertificationModel {
    return new CertificationModel(
      entity.id,
      entity.staffMemberId,
      entity.name,
      entity.issuer,
      entity.issuedOn,
      entity.expiresOn,
      entity.createdAt,
      entity.modifiedAt
    );
  }

  /**
   * Convert CertificationJson (raw API) to Certification Entity
   */
  static fromJsonToEntity(json: CertificationJson): Certification {
    const model = CertificationModel.fromJson(json);
    return CertificationMapper.toEntity(model);
  }
}
