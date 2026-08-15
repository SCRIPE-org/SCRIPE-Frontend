/**
 * DSR Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import type { DataSubjectRequestData } from "../../domain/entities/DataSubjectRequest";
import type {
  DsrModel,
  DsrDetailModel,
  DsrStatusHistoryModel,
  DsrModuleExecutionModel,
} from "../models/DsrModels";
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

const DsrStatusHistoryModelSchema = z.object({
  fromStatus: z.string().optional().default(""),
  toStatus: z.string().optional().default(""),
  changedByAdminId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  occurredAt: optionalIsoDate(),
});

const DsrModuleExecutionModelSchema = z.object({
  moduleName: z.string().optional().default(""),
  isCompleted: z.boolean().optional().default(false),
  processedCount: z.number().int().optional().default(0),
  errorMessage: z.string().optional().nullable(),
  retryCount: z.number().int().optional().default(0),
  completedAt: optionalIsoDate(),
});

const DsrDetailModelSchema = DsrModelSchema.extend({
  dsrDeadlineDays: z.number().int().optional().default(0),
  assignedToAdminId: z.string().optional().nullable(),
  exportFileUrl: z.string().optional().nullable(),
  erasureConfirmed: z.boolean().optional().default(false),
  erasureExecuteAfter: optionalIsoDate(),
  requesterNotes: z.string().optional().nullable(),
  statusHistory: z.array(DsrStatusHistoryModelSchema).optional().default([]),
  moduleExecutions: z.array(DsrModuleExecutionModelSchema).optional().default([]),
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

  static toDetailEntity(model: DsrDetailModel): DataSubjectRequest {
    const validated = safeParseApiResponse(DsrDetailModelSchema, model, "DataSubjectRequestDetail");

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
      dsrDeadlineDays: validated.dsrDeadlineDays ?? 0,
      assignedToAdminId: validated.assignedToAdminId ?? undefined,
      exportFileUrl: validated.exportFileUrl ?? undefined,
      erasureConfirmed: validated.erasureConfirmed ?? false,
      erasureExecuteAfter: validated.erasureExecuteAfter ?? undefined,
      requesterNotes: validated.requesterNotes ?? undefined,
      statusHistory: (validated.statusHistory ?? []).map(
        (h): DsrStatusHistoryModel => ({
          fromStatus: h.fromStatus ?? "",
          toStatus: h.toStatus ?? "",
          changedByAdminId: h.changedByAdminId ?? undefined,
          notes: h.notes ?? undefined,
          occurredAt: h.occurredAt ?? "",
        })
      ),
      moduleExecutions: (validated.moduleExecutions ?? []).map(
        (m): DsrModuleExecutionModel => ({
          moduleName: m.moduleName ?? "",
          isCompleted: m.isCompleted ?? false,
          processedCount: m.processedCount ?? 0,
          errorMessage: m.errorMessage ?? undefined,
          retryCount: m.retryCount ?? 0,
          completedAt: m.completedAt ?? undefined,
        })
      ),
    };
    return new DataSubjectRequest(data);
  }
}
