/**
 * Override Mapper — Model ↔ Entity conversion
 *
 * Maps OverrideService DTOs to domain entities.
 */
import { FeatureOverride, ResolvedFeature } from "../../domain/entities/Override";
import type { FeatureOverrideData, ResolvedFeatureData } from "../../domain/entities/Override";
import type { FeatureOverrideModel, ResolvedFeatureModel } from "../models/OverrideModels";

export class OverrideMapper {
  static toOverrideEntity(model: FeatureOverrideModel): FeatureOverride {
    const data: FeatureOverrideData = {
      id: model.id,
      tenantId: model.tenantId,
      featureId: model.featureId,
      featureName: model.featureName,
      value: model.value,
      valueType: model.valueType,
      reason: model.reason,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
      costAmountUsd: model.costAmountUsd,
      costReason: model.costReason,
    };
    return new FeatureOverride(data);
  }

  static toResolvedEntity(model: ResolvedFeatureModel): ResolvedFeature {
    const data: ResolvedFeatureData = {
      featureId: model.featureId,
      key: model.key,
      nameEn: model.nameEn,
      nameAr: model.nameAr,
      valueType: model.valueType,
      effectiveValue: model.effectiveValue,
      source: model.source,
    };
    return new ResolvedFeature(data);
  }
}
