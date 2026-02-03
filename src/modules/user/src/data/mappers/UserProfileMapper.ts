/**
 * User Profile Mapper
 *
 * Maps between User Model (API DTO) and User Entity (Domain).
 *
 * Clean Architecture:
 * - API Response → Model.fromJson() → Model
 * - Model → Mapper.toEntity() → Entity (used in app)
 * - Entity → Mapper.toModel() → Model.toJson() → API Request
 *
 * @module user/data
 */

import { User, type UserData } from "@modules/auth/core/domain/entities/User";
import { UserModel } from "../models/UserModel";

export class UserProfileMapper {
      // ===== Model to Entity =====

      /**
       * Map UserModel to User Entity
       */
      static toEntity(model: UserModel): User {
            return new User({
                  id: model.id,
                  username: model.username,
                  firstName: model.firstName,
                  lastName: model.lastName,
                  phoneNumber: model.phoneNumber,
                  adminTypeName: model.adminTypeName,
                  role: model.role,
                  permissions: model.permissions,
            });
      }

      // ===== Entity to Model =====

      /**
       * Map User Entity to UserModel
       */
      static toModel(entity: User): UserModel {
            return new UserModel(
                  entity.id,
                  entity.username,
                  entity.firstName,
                  entity.lastName,
                  entity.phoneNumber,
                  entity.adminTypeName,
                  entity.role,
                  entity.permissions
            );
      }

      // ===== Legacy Compatibility (from original UserMapper) =====

      /**
       * Convert JSON/API response to User domain model
       * @deprecated Use UserModel.fromJson + toEntity instead
       */
      static fromJson(json: any): User {
            return new User({
                  id: json.id || "",
                  username: json.username || "",
                  firstName: json.firstName || "",
                  lastName: json.lastName || "",
                  phoneNumber: json.phoneNumber || "",
                  adminTypeName: json.adminTypeName || "",
                  role:
                        json.roles?.[0]?.roleCode || json.roles?.[0]?.roleName || undefined,
                  permissions: json.permissions || [],
            });
      }

      /**
       * Convert User domain model to JSON for API requests
       * @deprecated Use toModel().toJson() instead
       */
      static toJson(user: User): any {
            return {
                  id: user.id,
                  username: user.username,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phoneNumber: user.phoneNumber,
                  adminTypeName: user.adminTypeName,
            };
      }

      /**
       * Convert User domain model to plain object
       */
      static toPlainObject(user: User): UserData {
            return {
                  id: user.id,
                  username: user.username,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phoneNumber: user.phoneNumber,
                  adminTypeName: user.adminTypeName,
            };
      }

      /**
       * Convert plain object to User domain model
       */
      static fromPlainObject(data: UserData): User {
            return new User(data);
      }

      /**
       * Convert array of JSON objects to User array
       */
      static fromJsonArray(jsonArray: any[]): User[] {
            return jsonArray.map((json) => this.fromJson(json));
      }

      /**
       * Convert User array to JSON array
       */
      static toJsonArray(users: User[]): any[] {
            return users.map((user) => this.toJson(user));
      }
}
