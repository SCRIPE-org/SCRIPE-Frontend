import { ComplianceEntity } from "../../domain/entities/ComplianceEntity";
import type { ComplianceModel } from "../models/ComplianceModel";

export class ComplianceMapper {
  static toEntity(dto: ComplianceModel): ComplianceEntity {
    return new ComplianceEntity({
      id: dto.id ?? "",
      type: dto.type ?? "",
      status: dto.status ?? "",
      entityType: dto.entityType ?? "",
      retentionDays: dto.retentionDays ?? "",
      createdAt: dto.createdAt ?? "",
    });
  }
}
