/**
 * Consent Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { ConsentStatus } from "../../domain/entities/ConsentStatus";
import type { ConsentStatusData } from "../../domain/entities/ConsentStatus";
import type { ConsentStatusModel } from "../models/ConsentModels";
import { z } from "zod";
import { safeParseApiResponse, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ConsentStatusModelSchema = z.object({
  purposeId: z.string().min(1),
  purposeKey: optionalString(),
  purposeName: optionalString(),
  currentAction: z.enum(["Granted", "Withdrawn", "Pending"]).optional().default("Withdrawn"),
  requiresReConsent: z.boolean().optional().default(false),
  lastUpdatedAt: z.string().optional().nullable(),
  consentVersion: z.string().optional().default("1.0"),
});

export class ConsentMapper {
  static toEntity(model: ConsentStatusModel): ConsentStatus {
    const validated = safeParseApiResponse(ConsentStatusModelSchema, model, "ConsentStatus");

    const data: ConsentStatusData = {
      purposeId: validated.purposeId,
      purposeKey: validated.purposeKey ?? "",
      purposeName: validated.purposeName ?? validated.purposeKey ?? "",
      currentAction: (validated.currentAction ?? "Withdrawn") as ConsentStatusData["currentAction"],
      requiresReConsent: validated.requiresReConsent ?? false,
      lastUpdatedAt: validated.lastUpdatedAt ?? "",
      consentVersion: validated.consentVersion ?? "1.0",
    };
    return new ConsentStatus(data);
  }
}
