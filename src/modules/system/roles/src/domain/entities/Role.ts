/**
 * Role Entity
 *
 * Represents a role in the RBAC system.
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

/**
 * Role permission assignment data
 */
export interface RolePermissionData {
      permissionId: string;
      permissionCode: string;
      scope?: string;
}

/**
 * Role data from API
 */
export interface RoleData extends BaseEntity {
      name: string;
      code: string;
      description?: string;
      tenantId?: string;
      tenantName?: string;
      isSystem: boolean;
      priority: number;
      isActive: boolean;
      permissions: RolePermissionData[];
}

/**
 * Role entity class
 */
export class Role {
      constructor(public readonly data: RoleData) { }

      get id(): string {
            return this.data.id;
      }

      get name(): string {
            return this.data.name;
      }

      get code(): string {
            return this.data.code;
      }

      get description(): string | undefined {
            return this.data.description;
      }

      get tenantId(): string | undefined {
            return this.data.tenantId;
      }

      get tenantName(): string | undefined {
            return this.data.tenantName;
      }

      get isSystem(): boolean {
            return this.data.isSystem;
      }

      get priority(): number {
            return this.data.priority;
      }

      get isActive(): boolean {
            return this.data.isActive;
      }

      get permissions(): RolePermissionData[] {
            return this.data.permissions;
      }

      get createdAt(): string {
            return this.data.createdAt;
      }

      get modifiedAt(): string | undefined {
            return this.data.modifiedAt;
      }

      get permissionCount(): number {
            return this.data.permissions.length;
      }

      get permissionCodes(): string[] {
            return this.data.permissions.map((p) => p.permissionCode);
      }

      /**
       * Check if role has a specific permission
       */
      hasPermission(permissionCode: string): boolean {
            return this.data.permissions.some((p) => p.permissionCode === permissionCode);
      }
}
