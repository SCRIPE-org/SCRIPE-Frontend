/**
 * User Model (DTO)
 *
 * Represents the raw API request/response for user profile operations.
 * Contains static methods for JSON serialization/deserialization.
 *
 * Clean Architecture:
 * - API Response → Model.fromJson() → Model
 * - Model → Mapper → Entity (used in app)
 * - Entity → Mapper → Model.toJson() → API Request
 *
 * @module user/data
 */

// ===== JSON Shapes (API contracts) =====

export interface UserJson {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      adminTypeName: string;
      roles?: Array<{ roleCode?: string; roleName?: string }>;
      permissions?: string[];
}

export interface UpdateProfileJson {
      firstName: string;
      lastName: string;
      phoneNumber: string;
}

export interface ChangePasswordJson {
      currentPassword: string;
      newPassword: string;
}

// ===== Model Classes =====

/**
 * User Model
 */
export class UserModel {
      constructor(
            public readonly id: string,
            public readonly username: string,
            public readonly firstName: string,
            public readonly lastName: string,
            public readonly phoneNumber: string,
            public readonly adminTypeName: string,
            public readonly role?: string,
            public readonly permissions?: string[]
      ) { }

      static fromJson(json: UserJson): UserModel {
            return new UserModel(
                  json.id || "",
                  json.username || "",
                  json.firstName || "",
                  json.lastName || "",
                  json.phoneNumber || "",
                  json.adminTypeName || "",
                  json.roles?.[0]?.roleCode || json.roles?.[0]?.roleName,
                  json.permissions
            );
      }

      toJson(): UserJson {
            return {
                  id: this.id,
                  username: this.username,
                  firstName: this.firstName,
                  lastName: this.lastName,
                  phoneNumber: this.phoneNumber,
                  adminTypeName: this.adminTypeName,
                  permissions: this.permissions,
            };
      }
}

/**
 * Update Profile Request Model
 */
export class UpdateProfileModel {
      constructor(
            public readonly firstName: string,
            public readonly lastName: string,
            public readonly phoneNumber: string
      ) { }

      static fromJson(json: UpdateProfileJson): UpdateProfileModel {
            return new UpdateProfileModel(
                  json.firstName,
                  json.lastName,
                  json.phoneNumber
            );
      }

      toJson(): UpdateProfileJson {
            return {
                  firstName: this.firstName,
                  lastName: this.lastName,
                  phoneNumber: this.phoneNumber,
            };
      }
}

/**
 * Change Password Request Model
 */
export class ChangePasswordModel {
      constructor(
            public readonly currentPassword: string,
            public readonly newPassword: string
      ) { }

      static fromJson(json: ChangePasswordJson): ChangePasswordModel {
            return new ChangePasswordModel(json.currentPassword, json.newPassword);
      }

      toJson(): ChangePasswordJson {
            return {
                  currentPassword: this.currentPassword,
                  newPassword: this.newPassword,
            };
      }
}
