/**
 * Role Entity
 *
 * Domain entity representing a role in the RBAC system.
 * Pure business logic - no API/JSON concerns.
 *
 * @module roles/domain
 */

export interface RolePermission {
  permissionId: string;
  permissionCode: string;
  scope?: string;
}

export interface RoleProps {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  isSystem: boolean;
  priority: number;
  isActive: boolean;
  permissions: RolePermission[];
  createdAt: string;
  descriptionEn?: string;
  descriptionAr?: string;
  tenantId?: string;
  tenantName?: string;
  modifiedAt?: string;
  groupNamesEn?: string[];
  groupNamesAr?: string[];
}

/**
 * Role domain entity
 */
export class Role {
  private readonly props: RoleProps;

  constructor(props: RoleProps) {
    this.props = props;
  }

  // ===== Getters =====

  get id(): string {
    return this.props.id;
  }

  get nameEn(): string {
    return this.props.nameEn;
  }

  get nameAr(): string {
    return this.props.nameAr;
  }

  get code(): string {
    return this.props.code;
  }

  get descriptionEn(): string | undefined {
    return this.props.descriptionEn;
  }

  get descriptionAr(): string | undefined {
    return this.props.descriptionAr;
  }

  get tenantId(): string | undefined {
    return this.props.tenantId;
  }

  get tenantName(): string | undefined {
    return this.props.tenantName;
  }

  get isSystem(): boolean {
    return this.props.isSystem;
  }

  get priority(): number {
    return this.props.priority;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get permissions(): RolePermission[] {
    return this.props.permissions;
  }

  get createdAt(): string {
    return this.props.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.props.modifiedAt;
  }

  // ===== Business Logic =====

  /**
   * Get localized name based on language
   */
  getLocalizedName(lang: string = "en"): string {
    if (lang === "ar" && this.props.nameAr) {
      return this.props.nameAr;
    }
    return this.props.nameEn;
  }

  /**
   * Get localized description based on language
   */
  getLocalizedDescription(lang: string = "en"): string {
    if (lang === "ar" && this.props.descriptionAr) {
      return this.props.descriptionAr;
    }
    return this.props.descriptionEn ?? "";
  }

  /**
   * Get display name (alias for localized name)
   */
  get displayName(): string {
    return this.nameEn;
  }

  get permissionCount(): number {
    return this.props.permissions.length;
  }

  get permissionCodes(): string[] {
    return this.props.permissions.map((p) => p.permissionCode);
  }

  /**
   * Check if role has a specific permission
   */
  hasPermission(permissionCode: string): boolean {
    return this.props.permissions.some((p) => p.permissionCode === permissionCode);
  }

  /**
   * Get raw props (for serialization via mapper)
   */
  toProps(): RoleProps {
    return { ...this.props };
  }

  // ===== Group Helpers =====

  /** Whether role belongs to any user groups */
  get hasGroups(): boolean {
    return (this.props.groupNamesEn?.length ?? 0) > 0;
  }

  /** Get group names array for GenericCrudView auto-hide check */
  get groups(): string[] {
    return this.getLocalizedGroups("en");
  }

  /** Get localized group names as comma-separated string */
  getLocalizedGroupNames(lang: string = "en"): string {
    if (lang === "ar" && this.props.groupNamesAr?.length) {
      return this.props.groupNamesAr.join(", ");
    }
    if (this.props.groupNamesEn?.length) {
      return this.props.groupNamesEn.join(", ");
    }
    return "";
  }

  /** Get localized group names as array */
  getLocalizedGroups(lang: string = "en"): string[] {
    if (lang === "ar" && this.props.groupNamesAr?.length) {
      return this.props.groupNamesAr;
    }
    return this.props.groupNamesEn ?? [];
  }

  copyWith(updates: Partial<RoleProps>): Role {
    return new Role({
      ...this.props,
      ...updates,
    } as RoleProps);
  }
}

// Keep backward compatibility alias
export type RoleData = RoleProps;
export type RolePermissionData = RolePermission;
