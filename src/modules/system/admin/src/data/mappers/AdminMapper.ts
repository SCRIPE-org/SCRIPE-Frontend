/**
 * Admin Mapper
 *
 * Converts between AdminModel (DTO) and Admin (Entity).
 * Repository uses this to transform service responses.
 *
 * @module admin/data
 */
import { Admin, type AdminData, type AdminRoleData } from "../../domain/entities/Admin";
import { AdminModel, type AdminJson, type AdminRoleJson } from "../models/AdminModel";

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
                  lastLoginAt: model.lastLoginAt,
                  notes: model.notes,
                  roles: model.roles ? AdminMapper.toRoleDataList(model.roles) : undefined,
                  roleNamesEn: model.roleNamesEn,
                  roleNamesAr: model.roleNamesAr,
                  tenantId: model.tenantId,
                  tenantName: model.tenantName,
                  isSuperAdmin: model.isSuperAdmin,
                  canModify: model.canModify,
                  // permissions: model.permissions - Admin entity doesn't store calculated permissions, they come from roles
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
                  entity.lastLoginAt,
                  entity.notes,
                  entity.roles,
                  entity.data.roleNamesEn,
                  entity.data.roleNamesAr,
                  entity.tenantId,
                  entity.tenantName,
                  entity.isSuperAdmin,
                  entity.canModify,
                  // Entity might not have permissions populated if it came from internal logic, 
                  // but if it came from API -> Model -> Entity, we might lose it. 
                  // However, Admin Entity is domain, it shouldn't care about DTO's calculated permissions.
                  // We'll leave it undefined for toModel unless we extend Entity data.
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
       * Convert AdminRoleJson list to AdminRoleData list
       */
      static toRoleDataList(roles: AdminRoleJson[]): AdminRoleData[] {
            return roles.map(r => AdminMapper.toRoleData(r));
      }

      /**
       * Convert single AdminRoleJson to AdminRoleData
       */
      static toRoleData(role: AdminRoleJson): AdminRoleData {
            return {
                  ...role
            };
      }
}
