/**
 * Admin Mapper
 *
 * Converts between AdminModel (DTO) and Admin (Entity).
 * Repository uses this to transform service responses.
 *
 * @module admin/data
 */
import { Admin, type AdminData } from "../../domain/entities/Admin";
import { AdminModel, type AdminJson } from "../models/AdminModel";

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
                  roles: model.roles,
                  roleNames: model.roleNames,
                  tenantId: model.tenantId,
                  tenantName: model.tenantName,
                  isSuperAdmin: model.isSuperAdmin,
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
                  entity.data.roleNames,
                  entity.tenantId,
                  entity.tenantName,
                  entity.isSuperAdmin
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
}
