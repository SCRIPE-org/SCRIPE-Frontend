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
  roleNameEn: string;
  roleNameAr: string;
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
  email?: string;
  isActive: boolean;
  lastLoginAt?: string;
  notes?: string;
  /** Full role data (from details API) */
  roles?: AdminRoleData[];
  /** Simple role names (from list API) */
  roleNamesEn?: string[];
  roleNamesAr?: string[];
  /** The tenant this admin belongs to (null for system admins) */
  tenantId?: string;
  tenantName?: string;
  /** Whether this admin is a super/system admin */
  isSuperAdmin?: boolean;
  /** Server-computed: Whether this admin can be modified (deleted, toggled, reset) */
  canModify?: boolean;
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

  get email(): string | undefined {
    return this.data.email;
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
    return this.data.roles ?? [];
  }

  /**
   * Get role names as comma-separated string (English default).
   */
  get roleNames(): string {
    return this.getLocalizedRoleNames("en");
  }

  /**
   * Get localized role names
   */
  getLocalizedRoleNames(lang: string = "en"): string {
    // prefer specific language list from API
    if (lang === "ar") {
      if (this.data.roleNamesAr && this.data.roleNamesAr.length > 0) {
        return this.data.roleNamesAr.join(", ");
      }
      // Fallback to details array if available
      if (this.data.roles && this.data.roles.length > 0) {
        return this.data.roles.map((r) => r.roleNameAr || r.roleNameEn).join(", ");
      }
    } else {
      if (this.data.roleNamesEn && this.data.roleNamesEn.length > 0) {
        return this.data.roleNamesEn.join(", ");
      }
      if (this.data.roles && this.data.roles.length > 0) {
        return this.data.roles.map((r) => r.roleNameEn).join(", ");
      }
    }

    // Absolute fallback
    return "No roles";
  }

  get hasRoles(): boolean {
    return (this.data.roleNamesEn?.length ?? 0) > 0 || (this.data.roles?.length ?? 0) > 0;
  }

  /**
   * Get localized role names as an array
   */
  getLocalizedRoles(lang: string = "en"): string[] {
    // prefer specific language list from API
    if (lang === "ar") {
      if (this.data.roleNamesAr && this.data.roleNamesAr.length > 0) {
        return this.data.roleNamesAr;
      }
      // Fallback to details array if available
      if (this.data.roles && this.data.roles.length > 0) {
        return this.data.roles.map((r) => r.roleNameAr || r.roleNameEn);
      }
    } else {
      if (this.data.roleNamesEn && this.data.roleNamesEn.length > 0) {
        return this.data.roleNamesEn;
      }
      if (this.data.roles && this.data.roles.length > 0) {
        return this.data.roles.map((r) => r.roleNameEn);
      }
    }

    // Absolute fallback
    return [];
  }

  /** The tenant this admin belongs to (null for system admins) */
  get tenantId(): string | undefined {
    return this.data.tenantId;
  }

  get tenantName(): string | undefined {
    return this.data.tenantName;
  }

  /** Whether this admin is a super/system admin */
  get isSuperAdmin(): boolean {
    return this.data.isSuperAdmin ?? false;
  }

  /** Whether this admin is a system-level admin (no tenant or super admin) */
  get isSystemAdmin(): boolean {
    return this.isSuperAdmin || !this.tenantId;
  }

  /** Server-computed: Whether this admin can be modified (deleted, toggled, reset) */
  get canModify(): boolean {
    return this.data.canModify ?? true;
  }

  /** Whether any guardian protection is active (inverse of canModify) */
  get hasGuardianProtection(): boolean {
    return !this.canModify;
  }

  /**
   * Get role by tenant (only works with full role data from details API)
   */
  getRoleForTenant(tenantId?: string): AdminRoleData | undefined {
    return this.data.roles?.find((r) => r.tenantId === tenantId);
  }
}
