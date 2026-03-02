/**
 * Edition Mapper — Model ↔ Entity conversion
 */
import { Edition } from "../../domain/entities/Edition";
import type { EditionData } from "../../domain/entities/Edition";
import type { EditionModel } from "../services/EditionService";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../domain/entities/EditionRequests";

export class EditionMapper {
      static toEntity(model: EditionModel): Edition {
            const data: EditionData = {
                  id: model.id,
                  name: model.name,
                  displayNameEn: model.displayNameEn,
                  displayNameAr: model.displayNameAr,
                  description: model.description,
                  isSystem: model.isSystem,
                  isRetired: model.isRetired,
                  createdByTenantId: model.createdByTenantId,
                  featureCount: model.featureCount,
                  features: model.features,
                  fallbackEditionId: model.fallbackEditionId,
                  fallbackEditionName: model.fallbackEditionName,
                  overflowPolicy: model.overflowPolicy,
                  createdAt: model.createdAt,
                  modifiedAt: model.modifiedAt,
            };
            return new Edition(data);
      }

      static toCreateJson(request: CreateEditionRequest): Record<string, unknown> {
            return {
                  name: request.name,
                  displayNameEn: request.displayNameEn,
                  displayNameAr: request.displayNameAr,
                  description: request.description,
                  fallbackEditionId: request.fallbackEditionId || null,
            };
      }

      static toUpdateJson(request: UpdateEditionRequest): Record<string, unknown> {
            return {
                  name: request.name,
                  displayNameEn: request.displayNameEn,
                  displayNameAr: request.displayNameAr,
                  description: request.description,
                  fallbackEditionId: request.fallbackEditionId || null,
                  overflowPolicy: request.overflowPolicy || 'Block',
            };
      }
}
