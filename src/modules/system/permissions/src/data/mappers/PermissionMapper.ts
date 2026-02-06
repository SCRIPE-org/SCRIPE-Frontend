/**
 * Permission Mapper
 *
 * Maps between Permission Model (API DTO) and Permission Entity (Domain).
 *
 * Clean Architecture:
 * - API Response → Model.fromJson() → Model
 * - Model → Mapper.toEntity() → Entity (used in app)
 * - Entity → Mapper.toModel() → Model.toJson() → API Request
 *
 * @module permissions/data
 */

import { Permission, type PermissionProps } from "../../domain/entities/Permission";
import {
      PermissionModel,
      CreatePermissionModel,
      UpdatePermissionModel,
} from "../models/PermissionModel";
import type {
      CreatePermissionRequest,
      UpdatePermissionRequest,
} from "../../domain/entities/PermissionRequests";

export class PermissionMapper {
      /**
       * Map Model (DTO) to Domain Entity
       */
      static toEntity(model: PermissionModel): Permission {
            const props: PermissionProps = {
                  id: model.id,
                  resource: model.resource,
                  action: model.action,
                  code: model.permissionCode,
                  defaultScope: model.defaultScope,
                  category: model.category,
                  displayOrder: model.displayOrder,
                  descriptionEn: model.descriptionEn,
                  descriptionAr: model.descriptionAr,
                  nameEn: model.nameEn,
                  nameAr: model.nameAr,
            };
            return new Permission(props);
      }

      /**
       * Map Domain Entity to Model (DTO)
       */
      static toModel(entity: Permission): PermissionModel {
            return new PermissionModel(
                  entity.id,
                  entity.resource,
                  entity.action,
                  entity.code,
                  entity.defaultScope,
                  entity.category,
                  entity.displayOrder,
                  entity.descriptionEn,
                  entity.descriptionAr,
                  entity.nameEn,
                  entity.nameAr
            );
      }

      /**
       * Map array of Models to Entities
       */
      static toEntityList(models: PermissionModel[]): Permission[] {
            return models.map((model) => PermissionMapper.toEntity(model));
      }

      /**
       * Map CreatePermissionRequest to CreatePermissionModel
       */
      static toCreateModel(request: CreatePermissionRequest): CreatePermissionModel {
            // Generate permissionCode from resource.action
            const permissionCode = `${request.resource}.${request.action}`;
            return new CreatePermissionModel(
                  request.resource,
                  request.action,
                  permissionCode,
                  request.category || "system",
                  request.displayOrder ?? 0,
                  request.descriptionEn,
                  request.descriptionAr,
                  undefined, // nameEn not in request
                  undefined // nameAr not in request
            );
      }

      /**
       * Map UpdatePermissionRequest to UpdatePermissionModel
       */
      static toUpdateModel(request: UpdatePermissionRequest): UpdatePermissionModel {
            return new UpdatePermissionModel(
                  request.descriptionEn,
                  request.descriptionAr,
                  undefined, // nameEn not in request
                  undefined, // nameAr not in request
                  request.category,
                  request.displayOrder
            );
      }
}
