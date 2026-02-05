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
      name: string;
      nameEn?: string;
      nameAr?: string;
      code: string;
      isSystem: boolean;
      priority: number;
      isActive: boolean;
      permissions: RolePermission[];
      createdAt: string;
      description?: string;
      descriptionEn?: string;
      descriptionAr?: string;
      tenantId?: string;
      tenantName?: string;
      modifiedAt?: string;
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

      get name(): string {
            return this.props.name;
      }

      get nameEn(): string | undefined {
            return this.props.nameEn;
      }

      get nameAr(): string | undefined {
            return this.props.nameAr;
      }

      get code(): string {
            return this.props.code;
      }

      get description(): string | undefined {
            return this.props.description;
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
}

// Keep backward compatibility alias
export type RoleData = RoleProps;
export type RolePermissionData = RolePermission;
