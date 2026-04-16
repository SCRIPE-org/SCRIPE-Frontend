/**
 * Admin Entity
 *
 * Represents an administrator in the system.
 */
import type { BaseEntity } from "@modules/identity/core/domain/types";

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
  /** Group names from user groups (from list API) */
  groupNamesEn?: string[];
  groupNamesAr?: string[];
  /** Whether this admin has completed account activation */
  isAccountActivated?: boolean;
  /** Whether this admin must change password on next login */
  mustChangePassword?: boolean;
  /** Whether this admin is a protected super admin */
  isProtected?: boolean;
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

  // ===== Group Helpers =====

  /** Whether admin belongs to any user groups */
  get hasGroups(): boolean {
    return (this.data.groupNamesEn?.length ?? 0) > 0;
  }

  /** Get group names as comma-separated string */
  get groupNames(): string {
    return this.getLocalizedGroupNames("en");
  }

  /** Get group names array for GenericCrudView auto-hide check */
  get groups(): string[] {
    return this.getLocalizedGroups("en");
  }

  /** Get localized group names as comma-separated string */
  getLocalizedGroupNames(lang: string = "en"): string {
    if (lang === "ar" && this.data.groupNamesAr?.length) {
      return this.data.groupNamesAr.join(", ");
    }
    if (this.data.groupNamesEn?.length) {
      return this.data.groupNamesEn.join(", ");
    }
    return "";
  }

  /** Get localized group names as array */
  getLocalizedGroups(lang: string = "en"): string[] {
    if (lang === "ar" && this.data.groupNamesAr?.length) {
      return this.data.groupNamesAr;
    }
    return this.data.groupNamesEn ?? [];
  }

  /** Whether this admin has completed account activation */
  get isAccountActivated(): boolean {
    return this.data.isAccountActivated ?? true;
  }

  /** Whether this admin must change password on next login */
  get mustChangePassword(): boolean {
    return this.data.mustChangePassword ?? false;
  }

  /** Whether this admin is a protected super admin */
  get isProtected(): boolean {
    return this.data.isProtected ?? false;
  }

  /** Whether this admin needs account setup (protected + not activated) */
  get needsAccountSetup(): boolean {
    return this.isProtected && !this.isAccountActivated;
  }
}
