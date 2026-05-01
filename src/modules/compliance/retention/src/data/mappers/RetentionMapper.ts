/**
 * Retention Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import type { RetentionPolicyData } from "../../domain/entities/RetentionPolicy";
import type { RetentionPolicyModel } from "../models/RetentionModels";

export class RetentionMapper {
  static toEntity(model: RetentionPolicyModel): RetentionPolicy {
    const data: RetentionPolicyData = {
      id: model.id,
      policyId: model.policyId,
      category: model.category ?? "",
      legalBasis: model.legalBasis,
      retentionDays: model.retentionDays ?? 0,
      minRetentionDays: model.minRetentionDays ?? 0,
      maxRetentionDays: model.maxRetentionDays ?? 0,
      expiryAction: (model.expiryAction ?? "Delete") as RetentionPolicyData["expiryAction"],
      nextEvaluationAt: model.nextEvaluationAt,
      lastExecutionAt: model.lastExecutionAt,
      recordsProcessedLast: model.recordsProcessedLast,
      isActive: model.isActive ?? false,
    };
    return new RetentionPolicy(data);
  }
}
