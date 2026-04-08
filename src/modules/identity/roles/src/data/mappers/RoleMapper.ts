/**
 * Role Mapper
 *
 * Maps between Role Model (API DTO) and Role Entity (Domain).
 *
 * @module roles/data
 */

import { Role, type RoleProps, type RolePermission } from "../../domain/entities/Role";
import * as RoleModel from "../models/RoleModel";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
} from "../../domain/entities/RoleRequests";

export class RoleMapper {
  /**
   * Map Model (DTO) to Domain Entity
   */
  static toEntity(model: RoleModel.RoleModel): Role {
    const permissions: RolePermission[] = model.permissions.map((p) => ({
      permissionId: p.permissionId,
      permissionCode: p.permissionCode,
      scope: p.scope,
    }));

    const props: RoleProps = {
      id: model.id,
      nameEn: model.nameEn,
      nameAr: model.nameAr,
      code: model.code,
      isSystem: model.isSystem,
      priority: model.priority,
      isActive: model.isActive,
      permissions,
      createdAt: model.createdAt,
      descriptionEn: model.descriptionEn,
      descriptionAr: model.descriptionAr,
      tenantId: model.tenantId,
      tenantName: model.tenantName,
      modifiedAt: model.modifiedAt,
      groupNamesEn: model.groupNamesEn,
      groupNamesAr: model.groupNamesAr,
    };

    return new Role(props);
  }

  /**
   * Map Domain Entity to Model (DTO)
   */
  static toModel(entity: Role): RoleModel.RoleModel {
    const permissions = entity.permissions.map(
      (p) => new RoleModel.RolePermissionModel(p.permissionId, p.permissionCode, p.scope)
    );

    return new RoleModel.RoleModel(
      entity.id,
      entity.nameEn,
      entity.nameAr,
      entity.code,
      entity.isSystem,
      entity.priority,
      entity.isActive,
      permissions,
      entity.createdAt,
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
  static toEntityList(models: RoleModel.RoleModel[]): Role[] {
    return models.map((model) => RoleMapper.toEntity(model));
  }

  /**
   * Map CreateRoleRequest to CreateRoleModel
   */
  static toCreateModel(request: CreateRoleRequest): RoleModel.CreateRoleModel {
    return new RoleModel.CreateRoleModel(
      request.nameEn,
      request.nameAr,
      request.code,
      request.priority ?? 0,
      request.descriptionEn,
      request.descriptionAr,
      request.tenantId
    );
  }

  /**
   * Map UpdateRoleRequest to UpdateRoleModel
   */
  static toUpdateModel(request: UpdateRoleRequest): RoleModel.UpdateRoleModel {
    return new RoleModel.UpdateRoleModel(
      request.nameEn,
      request.nameAr,
      request.priority,
      request.descriptionEn,
      request.descriptionAr,
      undefined
    );
  }

  /**
   * Map AssignPermissionsRequest to AssignPermissionsModel
   */
  static toAssignPermissionsModel(
    request: AssignPermissionsRequest
  ): RoleModel.AssignPermissionsModel {
    return new RoleModel.AssignPermissionsModel(request.permissions);
  }
}
