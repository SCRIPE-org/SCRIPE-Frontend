/**
 * Feature Mapper — Model ↔ Entity conversion
 *
 * All model→entity transformations go through this mapper.
 * Repositories MUST use mapper methods — never construct entities directly.
 */
import { Feature } from "../../domain/entities/Feature";
import type { FeatureData, FeatureValueType } from "../../domain/entities/Feature";
import { TenantEffectiveFeature } from "../../domain/entities/TenantEffectiveFeature";
import type { TenantEffectiveFeatureData } from "../../domain/entities/TenantEffectiveFeature";
import type { FeatureModel, TenantEffectiveFeatureModel } from "../models/FeatureModels";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../../domain/entities/FeatureRequests";

export class FeatureMapper {
      static toEntity(model: FeatureModel): Feature {
            const data: FeatureData = {
                  id: model.id,
                  name: model.name,
                  displayNameEn: model.displayNameEn,
                  displayNameAr: model.displayNameAr,
                  category: model.category,
                  sortOrder: model.sortOrder ?? 0,
                  isVisibleInUI: model.isVisibleInUI ?? true,
                  valueType: model.valueType as FeatureValueType,
                  defaultValue: model.defaultValue,
                  module: model.module,
                  description: model.description,
                  isSystem: model.isSystem,
                  createdAt: model.createdAt,
                  modifiedAt: model.modifiedAt,
            };
            return new Feature(data);
      }

      static toEffectiveEntity(model: TenantEffectiveFeatureModel): TenantEffectiveFeature {
            const data: TenantEffectiveFeatureData = {
                  featureId: model.featureId,
                  name: model.name,
                  displayNameEn: model.displayNameEn,
                  displayNameAr: model.displayNameAr,
                  valueType: model.valueType ?? "",
                  editionValue: model.editionValue ?? "",
                  overrideValue: model.overrideValue ?? null,
                  effectiveValue: model.effectiveValue ?? "",
                  category: model.category,
                  module: model.module,
                  hasOverride: model.hasOverride ?? false,
            };
            return new TenantEffectiveFeature(data);
      }

      static toCreateJson(request: CreateFeatureRequest): Record<string, unknown> {
            return {
                  name: request.name,
                  valueType: request.valueType,
                  defaultValue: request.defaultValue,
                  module: request.module,
                  description: request.description,
                  displayNameEn: request.displayNameEn,
                  displayNameAr: request.displayNameAr,
                  category: request.category,
                  sortOrder: request.sortOrder ?? 0,
                  isVisibleInUI: request.isVisibleInUI ?? true,
            };
      }

      static toUpdateJson(request: UpdateFeatureRequest): Record<string, unknown> {
            return {
                  name: request.name,
                  defaultValue: request.defaultValue,
                  description: request.description,
                  displayNameEn: request.displayNameEn,
                  displayNameAr: request.displayNameAr,
                  category: request.category,
                  sortOrder: request.sortOrder,
                  isVisibleInUI: request.isVisibleInUI,
            };
      }
}
