/**
 * DSR Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import type { DataSubjectRequestData } from "../../domain/entities/DataSubjectRequest";
import type { DsrModel } from "../models/DsrModels";

export class DsrMapper {
  static toEntity(model: DsrModel): DataSubjectRequest {
    const data: DataSubjectRequestData = {
      id: model.id,
      subjectEmail: model.subjectEmail ?? "",
      subjectType: (model.subjectType ?? "User") as DataSubjectRequestData["subjectType"],
      requestType: (model.requestType ?? "Export") as DataSubjectRequestData["requestType"],
      status: (model.status ?? "Pending") as DataSubjectRequestData["status"],
      regulationCode: model.regulationCode ?? "",
      deadline: model.deadline,
      daysRemaining: model.daysRemaining ?? 0,
      slaPercent: model.slaPercent ?? 0,
      createdAt: model.createdAt,
      submittedAt: model.submittedAt,
      completedAt: model.completedAt,
      reviewedBy: model.reviewedBy,
      notes: model.notes,
      resolution: model.resolution,
    };
    return new DataSubjectRequest(data);
  }
}
