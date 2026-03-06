/**
 * Override Mapper — Model ↔ Entity conversion
 *
 * Maps OverrideService DTOs to domain entities.
 */
import type { FeatureOverride, ResolvedFeature } from "../../domain/entities/Override";
import type {
      FeatureOverrideModel,
      ResolvedFeatureModel,
} from "../services/OverrideService";

export class OverrideMapper {
      static toOverrideEntity(model: FeatureOverrideModel): FeatureOverride {
            return {
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
      }

      static toResolvedEntity(model: ResolvedFeatureModel): ResolvedFeature {
            return {
                  featureId: model.featureId,
                  key: model.key,
                  nameEn: model.nameEn,
                  nameAr: model.nameAr,
                  valueType: model.valueType,
                  effectiveValue: model.effectiveValue,
                  source: model.source,
            };
      }
}
