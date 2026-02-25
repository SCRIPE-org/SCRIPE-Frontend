/**
 * Bundle Mapper — Model ↔ Entity conversion
 */
import { Bundle } from "../../domain/entities/Bundle";
import type { BundleData } from "../../domain/entities/Bundle";
import type { BundleModel } from "../services/BundleService";
import type { CreateBundleRequest, UpdateBundleRequest } from "../../domain/entities/BundleRequests";

export class BundleMapper {
      static toEntity(model: BundleModel): Bundle {
            const data: BundleData = {
                  id: model.id,
                  name: model.name,
                  displayNameEn: model.displayNameEn,
                  displayNameAr: model.displayNameAr,
                  description: model.description,
                  scope: model.scope,
                  createdByTenantId: model.createdByTenantId,
                  isSystem: model.isSystem,
                  isRetired: model.isRetired,
                  permissionRuleCount: model.permissionRuleCount,
                  featureRuleCount: model.featureRuleCount,
                  permissionRules: model.permissionRules,
                  featureRules: model.featureRules,
                  createdAt: model.createdAt,
                  modifiedAt: model.modifiedAt,
            };
            return new Bundle(data);
      }

      static toCreateJson(request: CreateBundleRequest): Record<string, unknown> {
            return {
                  name: request.name,
                  displayNameEn: request.displayNameEn,
                  displayNameAr: request.displayNameAr,
                  description: request.description,
                  permissionRules: request.permissionRules,
                  featureRules: request.featureRules,
            };
      }

      static toUpdateJson(request: UpdateBundleRequest): Record<string, unknown> {
            return {
                  displayNameEn: request.displayNameEn,
                  displayNameAr: request.displayNameAr,
                  description: request.description,
                  permissionRules: request.permissionRules,
                  featureRules: request.featureRules,
            };
      }
}
