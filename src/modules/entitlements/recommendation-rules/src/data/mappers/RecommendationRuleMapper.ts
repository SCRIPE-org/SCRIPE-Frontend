/**
 * RecommendationRule Mapper — Model ↔ Entity conversion
 *
 * All model→entity transformations go through this mapper.
 * Repositories MUST use mapper methods — never construct entities directly.
 */
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalIsoDate } from "@core/common/zod-utils";
import { RecommendationRule } from "../../domain/entities/RecommendationRule";
import type { RecommendationRuleData } from "../../domain/entities/RecommendationRule";
import type {
  RecommendationRuleListModel,
  RecommendationRuleDetailModel,
} from "../models/RecommendationRuleModels";
import type {
  CreateRecommendationRuleRequest,
  UpdateRecommendationRuleRequest,
} from "../../domain/entities/RecommendationRuleRequests";

// ─── Zod Schema ────────────────────────────────────────────────────────────

const RecommendationRuleModelSchema = z.object({
  id: uuidField(),
  name: z.string().min(1),
  editionCategoryId: z.string().optional().nullable(),
  conditionJson: z.string().optional().default("{}"),
  recommendedTierLevel: z.number().int().optional().nullable(),
  scoreBonus: z.number().int().optional().default(0),
  reasonEn: z.string().optional().default(""),
  reasonAr: z.string().optional().default(""),
  priority: z.number().int().optional().default(5),
  isSystem: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  createdAt: optionalIsoDate(),
  modifiedAt: optionalIsoDate(),
});

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class RecommendationRuleMapper {
  static toEntity(
    model: RecommendationRuleListModel | RecommendationRuleDetailModel
  ): RecommendationRule {
    const v = safeParseApiResponse(RecommendationRuleModelSchema, model, "RecommendationRule");

    const data: RecommendationRuleData = {
      id: v.id,
      name: v.name,
      editionCategoryId: v.editionCategoryId ?? undefined,
      conditionJson: v.conditionJson,
      recommendedTierLevel: v.recommendedTierLevel ?? undefined,
      scoreBonus: v.scoreBonus,
      reasonEn: v.reasonEn,
      reasonAr: v.reasonAr,
      priority: v.priority,
      isSystem: v.isSystem,
      isActive: v.isActive,
      createdAt: v.createdAt ?? new Date().toISOString(),
      modifiedAt: v.modifiedAt ?? new Date().toISOString(),
    };

    return new RecommendationRule(data);
  }

  static toCreateJson(request: CreateRecommendationRuleRequest): CreateRecommendationRuleRequest {
    return {
      name: request.name,
      editionCategoryId: request.editionCategoryId,
      conditionJson: request.conditionJson,
      recommendedTierLevel: request.recommendedTierLevel,
      scoreBonus: request.scoreBonus,
      reasonEn: request.reasonEn,
      reasonAr: request.reasonAr,
      priority: request.priority,
    };
  }

  static toUpdateJson(request: UpdateRecommendationRuleRequest): UpdateRecommendationRuleRequest {
    return RecommendationRuleMapper.toCreateJson(request);
  }
}
