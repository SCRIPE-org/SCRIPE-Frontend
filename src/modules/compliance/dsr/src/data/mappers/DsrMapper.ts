/**
 * DSR Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import type { DataSubjectRequestData } from "../../domain/entities/DataSubjectRequest";
import type { DsrModel } from "../models/DsrModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const DsrModelSchema = z.object({
  id: uuidField(),
  subjectEmail: optionalString(),
  subjectType: z.string().optional().default("User"),
  requestType: z.string().optional().default("Export"),
  status: z.string().optional().default("Pending"),
  regulationCode: optionalString(),
  deadline: optionalIsoDate(),
  daysRemaining: z.number().int().optional().default(0),
  slaPercent: z.number().optional().default(0),
  createdAt: optionalIsoDate(),
  submittedAt: optionalIsoDate(),
  completedAt: optionalIsoDate(),
  reviewedBy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
});

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class DsrMapper {
  static toEntity(model: DsrModel): DataSubjectRequest {
    const validated = safeParseApiResponse(DsrModelSchema, model, "DataSubjectRequest");

    const data: DataSubjectRequestData = {
      id: validated.id,
      subjectEmail: validated.subjectEmail ?? "",
      subjectType: (validated.subjectType ?? "User") as DataSubjectRequestData["subjectType"],
      requestType: (validated.requestType ?? "Export") as DataSubjectRequestData["requestType"],
      status: (validated.status ?? "Pending") as DataSubjectRequestData["status"],
      regulationCode: validated.regulationCode ?? "",
      deadline: validated.deadline ?? "",
      daysRemaining: validated.daysRemaining ?? 0,
      slaPercent: validated.slaPercent ?? 0,
      createdAt: validated.createdAt ?? "",
      submittedAt: validated.submittedAt ?? undefined,
      completedAt: validated.completedAt ?? undefined,
      reviewedBy: validated.reviewedBy ?? undefined,
      notes: validated.notes ?? undefined,
      resolution: validated.resolution ?? undefined,
    };
    return new DataSubjectRequest(data);
  }
}
