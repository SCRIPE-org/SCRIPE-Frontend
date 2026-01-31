/**
 * Admin Entity
 *
 * Represents an administrator in the system.
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

/**
 * Admin role assignment data
 */
export interface AdminRoleData {
      roleId: string;
      roleName: string;
      roleCode: string;
      tenantId?: string;
      tenantName?: string;
      expiresAt?: string;
      inheritToChildren?: boolean;
}

/**
 * Admin data from API
 */
export interface AdminData extends BaseEntity {
      username: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      isActive: boolean;
      lastLoginAt?: string;
      notes?: string;
      roles: AdminRoleData[];
}

/**
 * Admin entity class
 */
export class Admin {
      constructor(public readonly data: AdminData) { }

      get id(): string {
            return this.data.id;
      }

      get username(): string {
            return this.data.username;
      }

      get firstName(): string | undefined {
            return this.data.firstName;
      }

      get lastName(): string | undefined {
            return this.data.lastName;
      }

      get displayName(): string {
            const name = `${this.data.firstName ?? ""} ${this.data.lastName ?? ""}`.trim();
            return name || this.data.username;
      }

      get phoneNumber(): string | undefined {
            return this.data.phoneNumber;
      }

      get isActive(): boolean {
            return this.data.isActive;
      }

      get lastLoginAt(): string | undefined {
            return this.data.lastLoginAt;
      }

      get createdAt(): string {
            return this.data.createdAt;
      }

      get notes(): string | undefined {
            return this.data.notes;
      }

      get roles(): AdminRoleData[] {
            return this.data.roles;
      }

      get roleNames(): string {
            return this.data.roles.map((r) => r.roleName).join(", ") || "No roles";
      }

      get hasRoles(): boolean {
            return this.data.roles.length > 0;
      }

      /**
       * Get role by tenant
       */
      getRoleForTenant(tenantId?: string): AdminRoleData | undefined {
            return this.data.roles.find((r) => r.tenantId === tenantId);
      }
}
