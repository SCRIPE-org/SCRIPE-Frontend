/**
 * Admin Mapper
 *
 * Converts between AdminModel (DTO) and Admin (Entity).
 * Repository uses this to transform service responses.
 *
 * @module admin/data
 */
import { Admin, type AdminData, type AdminRoleData } from "../../domain/entities/Admin";
import {
  AdminModel,
  CreateAdminModel,
  UpdateAdminModel,
  type AdminJson,
  type AdminRoleJson,
} from "../models/AdminModel";
import type {
  CreateAdminRequest,
  UpdateAdminRequest,
} from "../../domain/entities/AdminRequests";

export class AdminMapper {
  /**
   * Convert AdminModel to Admin Entity
   */
  static toEntity(model: AdminModel): Admin {
    const data: AdminData = {
      id: model.id,
      username: model.username,
      isActive: model.isActive,
      createdAt: model.createdAt,
      firstName: model.firstName,
      lastName: model.lastName,
      phoneNumber: model.phoneNumber,
      email: model.email,
      lastLoginAt: model.lastLoginAt,
      notes: model.notes,
      roles: model.roles ? AdminMapper.toRoleDataList(model.roles) : undefined,
      roleNamesEn: model.roleNamesEn,
      roleNamesAr: model.roleNamesAr,
      tenantId: model.tenantId,
      tenantName: model.tenantName,
      isSuperAdmin: model.isSuperAdmin,
      canModify: model.canModify,
      groupNamesEn: model.groupNamesEn,
      groupNamesAr: model.groupNamesAr,
      isAccountActivated: model.isAccountActivated,
      isProtected: model.isProtected,
    };
    return new Admin(data);
  }

  /**
   * Convert Admin Entity to AdminModel
   */
  static toModel(entity: Admin): AdminModel {
    return new AdminModel(
      entity.id,
      entity.username,
      entity.isActive,
      entity.createdAt,
      entity.firstName,
      entity.lastName,
      entity.phoneNumber,
      entity.email,
      entity.lastLoginAt,
      entity.notes,
      entity.roles,
      entity.data.roleNamesEn,
      entity.data.roleNamesAr,
      entity.tenantId,
      entity.tenantName,
      entity.isSuperAdmin,
      entity.canModify,
      undefined
    );
  }

  /**
   * Convert AdminJson (raw API) to Admin Entity
   * Shortcut for fromJson -> toEntity
   */
  static fromJsonToEntity(json: AdminJson): Admin {
    const model = AdminModel.fromJson(json);
    return AdminMapper.toEntity(model);
  }

  /**
   * Convert Admin Entity to AdminJson
   * Shortcut for toModel -> toJson
   */
  static toJsonFromEntity(entity: Admin): AdminJson {
    const model = AdminMapper.toModel(entity);
    return model.toJson();
  }

  /**
   * Map CreateAdminRequest (domain) to CreateAdminModel (data)
   */
  static toCreateModel(request: CreateAdminRequest): CreateAdminModel {
    return new CreateAdminModel(
      request.username,
      request.password,
      request.firstName,
      request.lastName,
      request.phoneNumber,
      request.email,
      request.notes,
      request.tenantId,
      request.roleIds,
      request.userGroupIds
    );
  }

  /**
   * Map UpdateAdminRequest (domain) to UpdateAdminModel (data)
   */
  static toUpdateModel(request: UpdateAdminRequest): UpdateAdminModel {
    return new UpdateAdminModel(
      request.firstName,
      request.lastName,
      request.phoneNumber,
      request.email,
      request.notes,
      request.isActive
    );
  }

  /**
   * Convert AdminRoleJson list to AdminRoleData list
   */
  static toRoleDataList(roles: AdminRoleJson[]): AdminRoleData[] {
    return roles.map((r) => AdminMapper.toRoleData(r));
  }

  /**
   * Convert single AdminRoleJson to AdminRoleData
   */
  static toRoleData(role: AdminRoleJson): AdminRoleData {
    return {
      ...role,
    };
  }
}

