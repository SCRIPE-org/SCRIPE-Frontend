/**
 * User Mapper
 * 
 * Handles conversion between User domain model and external data formats.
 * Follows Single Responsibility Principle by separating serialization
 * concerns from domain logic.
 */

import { User, type UserData } from "@modules/auth/core/domain/entities/User";

export class UserMapper {
  /**
   * Convert JSON/API response to User domain model
   * Maps the AdminResponse from backend including permissions
   */
  static fromJson(json: any): User {
    return new User({
      id: json.id || '',
      username: json.username || '',
      firstName: json.firstName || '',
      lastName: json.lastName || '',
      phoneNumber: json.phoneNumber || '',
      adminTypeName: json.adminTypeName || '',
      role: json.roles?.[0]?.roleCode || json.roles?.[0]?.roleName || undefined,
      // Map permissions from backend's flattened list
      permissions: json.permissions || [],
    });
  }

  /**
   * Convert User domain model to JSON for API requests
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
    return jsonArray.map(json => this.fromJson(json));
  }

  /**
   * Convert User array to JSON array
   */
  static toJsonArray(users: User[]): any[] {
    return users.map(user => this.toJson(user));
  }
}
