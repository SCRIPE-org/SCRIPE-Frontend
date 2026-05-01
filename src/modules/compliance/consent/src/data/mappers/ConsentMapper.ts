/**
 * Consent Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { ConsentStatus } from "../../domain/entities/ConsentStatus";
import type { ConsentStatusData } from "../../domain/entities/ConsentStatus";
import type { ConsentStatusModel } from "../models/ConsentModels";

export class ConsentMapper {
  static toEntity(model: ConsentStatusModel): ConsentStatus {
    const data: ConsentStatusData = {
      purposeId: model.purposeId,
      purposeKey: model.purposeKey ?? "",
      purposeName: model.purposeName ?? model.purposeKey ?? "",
      currentAction: (model.currentAction ?? "Withdrawn") as ConsentStatusData["currentAction"],
      requiresReConsent: model.requiresReConsent ?? false,
      lastUpdatedAt: model.lastUpdatedAt,
      consentVersion: model.consentVersion ?? "1.0",
    };
    return new ConsentStatus(data);
  }
}
