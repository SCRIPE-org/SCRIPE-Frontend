/**
 * Permission Entity
 *
 * Represents a permission in the RBAC system.
 */

/**
 * Permission data from API
 */
export interface PermissionData {
      id: string;
      resource: string;
      action: string;
      code: string;
      defaultScope: string;
      description?: string;
      category?: string;
      displayOrder: number;
}

/**
 * Permission entity class
 */
export class Permission {
      constructor(public readonly data: PermissionData) { }

      get id(): string {
            return this.data.id;
      }

      get resource(): string {
            return this.data.resource;
      }

      get action(): string {
            return this.data.action;
      }

      get code(): string {
            return this.data.code;
      }

      get defaultScope(): string {
            return this.data.defaultScope;
      }

      get description(): string | undefined {
            return this.data.description;
      }

      get category(): string | undefined {
            return this.data.category;
      }

      get displayOrder(): number {
            return this.data.displayOrder;
      }

      /**
       * Get display name (formatted from resource.action)
       */
      get displayName(): string {
            const resource = this.data.resource.charAt(0).toUpperCase() + this.data.resource.slice(1);
            const action = this.data.action.charAt(0).toUpperCase() + this.data.action.slice(1);
            return `${resource} - ${action}`;
      }
}

/**
 * Permission grouped by category
 */
export interface PermissionCategoryGroup {
      category: string;
      permissions: Permission[];
}
