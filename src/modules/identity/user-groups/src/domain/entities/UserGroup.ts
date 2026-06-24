/**
 * UserGroup Entity
 *
 * Domain entity representing a user group in the RBAC system.
 * Groups provide batch role assignment and field restrictions.
 *
 * @module user-groups/domain
 */

export interface UserGroupMember {
  adminId: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  isActive: boolean;
}

export interface UserGroupRole {
  roleId: string;
  nameEn: string;
  nameAr: string;
  code: string;
  permissionCount: number;
}

export interface UserGroupRestriction {
  permissionCode: string;
  restrictedFields: string[];
}

export interface UserGroupProps {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  tenantId: string;
  tenantName?: string;
  isActive: boolean;
  memberCount: number;
  roleCount: number;
  createdAt: string;
  modifiedAt?: string;
  members?: UserGroupMember[];
  roles?: UserGroupRole[];
  restrictions?: UserGroupRestriction[];
}

export class UserGroup {
  private readonly props: UserGroupProps;

  constructor(props: UserGroupProps) {
    this.props = props;
  }

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
  get tenantId(): string {
    return this.props.tenantId;
  }
  get tenantName(): string | undefined {
    return this.props.tenantName;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get memberCount(): number {
    return this.props.memberCount;
  }
  get roleCount(): number {
    return this.props.roleCount;
  }
  get createdAt(): string {
    return this.props.createdAt;
  }
  get modifiedAt(): string | undefined {
    return this.props.modifiedAt;
  }
  get members(): UserGroupMember[] {
    return this.props.members ?? [];
  }
  get roles(): UserGroupRole[] {
    return this.props.roles ?? [];
  }
  get restrictions(): UserGroupRestriction[] {
    return this.props.restrictions ?? [];
  }

  getLocalizedName(lang: string = "en"): string {
    return lang === "ar" && this.props.nameAr ? this.props.nameAr : this.props.nameEn;
  }

  getLocalizedDescription(lang: string = "en"): string {
    return lang === "ar" && this.props.descriptionAr
      ? this.props.descriptionAr
      : (this.props.descriptionEn ?? "");
  }

  get displayName(): string {
    return this.nameEn;
  }

  toProps(): UserGroupProps {
    return { ...this.props };
  }

  copyWith(updates: Partial<UserGroupProps>): UserGroup {
    return new UserGroup({
      ...this.props,
      ...updates,
    } as UserGroupProps);
  }
}
