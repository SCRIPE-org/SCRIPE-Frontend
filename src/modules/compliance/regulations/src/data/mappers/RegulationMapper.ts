import type { RegulationProfileModel } from "../models/RegulationModels";
import { Regulation } from "../../domain/entities/Regulation";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ConsentPurposeSchema = z.object({
  id: uuidField(),
  key: z.string().min(1),
  name: z.string().min(1),
  nameAr: optionalString(),
  description: optionalString(),
  legalBasis: z.string().min(1),
  isRequired: z.boolean(),
  sortOrder: z.number().int().default(0),
});

const RegulationProfileSchema = z.object({
  id: uuidField(),
  code: z.string().min(1),
  name: z.string().min(1),
  jurisdiction: optionalString(),
  dsrDeadlineDays: z.number().int(),
  referenceUrl: z.string().optional().nullable(),
  isActive: z.boolean(),
  purposes: z.array(ConsentPurposeSchema).optional().default([]),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class RegulationMapper {
  static toEntity(model: RegulationProfileModel): Regulation {
    const validated = safeParseApiResponse(RegulationProfileSchema, model, "Regulation");
    return new Regulation(validated as RegulationProfileModel);
  }
}
