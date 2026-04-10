/**
 * Feature Mapper — Model ↔ Entity conversion
 */
import { Feature } from "../../domain/entities/Feature";
import type { FeatureData, FeatureValueType } from "../../domain/entities/Feature";
import type { FeatureModel } from "../models/FeatureModels";
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

      static toCreateJson(request: CreateFeatureRequest): Record<string, unknown> {
            return {
                  name: request.name,
                  valueType: request.valueType,
                  defaultValue: request.defaultValue,
                  module: request.module,
                  description: request.description,
            };
      }

      static toUpdateJson(request: UpdateFeatureRequest): Record<string, unknown> {
            return {
                  name: request.name,
                  defaultValue: request.defaultValue,
                  description: request.description,
            };
      }
}
