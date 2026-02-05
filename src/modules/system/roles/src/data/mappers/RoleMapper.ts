/**
 * Role Mapper
 *
 * Maps between Role Model (API DTO) and Role Entity (Domain).
 *
 * @module roles/data
 */

import { Role, type RoleProps, type RolePermission } from "../../domain/entities/Role";
import {
      RoleModel,
      RolePermissionModel,
      CreateRoleModel,
      UpdateRoleModel,
      AssignPermissionsModel,
} from "../models/RoleModel";
import type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
} from "../../domain/entities/RoleRequests";

export class RoleMapper {
      /**
       * Map Model (DTO) to Domain Entity
       */
      static toEntity(model: RoleModel): Role {
            const permissions: RolePermission[] = model.permissions.map((p) => ({
                  permissionId: p.permissionId,
                  permissionCode: p.permissionCode,
                  scope: p.scope,
            }));

            const props: RoleProps = {
                  id: model.id,
                  name: model.name,
                  nameEn: model.nameEn,
                  nameAr: model.nameAr,
                  code: model.code,
                  isSystem: model.isSystem,
                  priority: model.priority,
                  isActive: model.isActive,
                  permissions,
                  createdAt: model.createdAt,
                  description: model.description,
                  descriptionEn: model.descriptionEn,
                  descriptionAr: model.descriptionAr,
                  tenantId: model.tenantId,
                  tenantName: model.tenantName,
                  modifiedAt: model.modifiedAt,
            };

            return new Role(props);
      }

      /**
       * Map Domain Entity to Model (DTO)
       */
      static toModel(entity: Role): RoleModel {
            const permissions = entity.permissions.map(
                  (p) => new RolePermissionModel(p.permissionId, p.permissionCode, p.scope)
            );

            return new RoleModel(
                  entity.id,
                  entity.name,
                  entity.code,
                  entity.isSystem,
                  entity.priority,
                  entity.isActive,
                  permissions,
                  entity.createdAt,
                  entity.description,
                  entity.nameEn,
                  entity.nameAr,
                  entity.descriptionEn,
                  entity.descriptionAr,
                  entity.tenantId,
                  entity.tenantName,
                  entity.modifiedAt
            );
      }

      /**
       * Map array of Models to Entities
       */
      static toEntityList(models: RoleModel[]): Role[] {
            return models.map((model) => RoleMapper.toEntity(model));
      }

      /**
       * Map CreateRoleRequest to CreateRoleModel
       */
      static toCreateModel(request: CreateRoleRequest): CreateRoleModel {
            return new CreateRoleModel(
                  request.nameEn,
                  request.nameAr,
                  request.code,
                  request.priority ?? 0, // Default priority if not provided
                  request.descriptionEn,
                  request.descriptionAr,
                  undefined // permissionIds handled separately via assignPermissions
            );
      }

      /**
       * Map UpdateRoleRequest to UpdateRoleModel
       */
      static toUpdateModel(request: UpdateRoleRequest): UpdateRoleModel {
            return new UpdateRoleModel(
                  request.nameEn,
                  request.nameAr,
                  request.priority,
                  request.descriptionEn,
                  request.descriptionAr,
                  undefined // isActive not in UpdateRoleRequest
            );
      }

      /**
       * Map AssignPermissionsRequest to AssignPermissionsModel
       */
      static toAssignPermissionsModel(
            request: AssignPermissionsRequest
      ): AssignPermissionsModel {
            // Extract permissionIds from the permissions array
            const permissionIds = request.permissions.map((p) => p.permissionId);
            return new AssignPermissionsModel(permissionIds);
      }
}
